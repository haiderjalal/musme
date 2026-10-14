import { clamp, easeInOutCubic } from "@/lib/math";

/**
 * Pure geometry for the hero network. Every formation uses the same nodes in the same order, so the scene can
 * morph between them by interpolating positions. The edge list is built once, from the sphere, and reused.
 */

export const CLUSTER_COUNT = 4;

const SPHERE_RADIUS = 1.3;
const CLUSTER_SPREAD = 1.05;
const CLUSTER_RADIUS = 0.34;
const DISC_RADIUS = 1.55;
const DISC_THICKNESS = 0.18;
const EDGE_NEIGHBOURS = 3;
const JITTER = 0.08;
/** Share of the morph window used to stagger nodes, so they arrive in a wave rather than in lockstep. */
const STAGGER = 0.5;

/** Tetrahedron corners: four well-separated cluster directions. */
const CLUSTER_CORNERS: ReadonlyArray<readonly [number, number, number]> = [
  [1, 1, 1],
  [1, -1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
];

export type Formations = {
  count: number;
  /** Nodes on a sphere: the connected system. */
  sphere: Float32Array;
  /** Four clusters, one per service. */
  clusters: Float32Array;
  /** A flattened disc, used for the work section. */
  disc: Float32Array;
  /** Cluster index (0 to CLUSTER_COUNT - 1) for each node. */
  cluster: Uint8Array;
  /** Per-node offset in [0, 1) used to stagger morphs and twinkling. */
  stagger: Float32Array;
  /** Pairs of node indexes [a, b, a, b, ...] shared by every formation. */
  edges: Uint32Array;
};

/** Small deterministic PRNG (mulberry32) so the layout is identical on every visit. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Evenly spread unit vectors (Fibonacci spiral), with a little jitter so the sphere looks organic. */
function unitSphere(count: number, random: () => number): Float32Array {
  const points = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = count === 1 ? 0 : 1 - (2 * i) / (count - 1);
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const x = Math.cos(theta) * ring + (random() - 0.5) * JITTER;
    const jitteredY = y + (random() - 0.5) * JITTER;
    const z = Math.sin(theta) * ring + (random() - 0.5) * JITTER;
    const length = Math.hypot(x, jitteredY, z) || 1;
    points.set([x / length, jitteredY / length, z / length], i * 3);
  }

  return points;
}

function normalise(vector: readonly [number, number, number]): [number, number, number] {
  const length = Math.hypot(vector[0], vector[1], vector[2]);
  return [vector[0] / length, vector[1] / length, vector[2] / length];
}

/** For each node, the indexes of its nearest neighbours, as unique pairs. */
export function nearestNeighbourEdges(points: Float32Array, neighbours: number): Uint32Array {
  const count = points.length / 3;
  const seen = new Set<number>();
  const pairs: number[] = [];

  for (let a = 0; a < count; a++) {
    const candidates: Array<{ index: number; distance: number }> = [];
    for (let b = 0; b < count; b++) {
      if (b === a) continue;
      const dx = points[a * 3] - points[b * 3];
      const dy = points[a * 3 + 1] - points[b * 3 + 1];
      const dz = points[a * 3 + 2] - points[b * 3 + 2];
      candidates.push({ index: b, distance: dx * dx + dy * dy + dz * dz });
    }
    candidates.sort((first, second) => first.distance - second.distance);

    for (const { index } of candidates.slice(0, neighbours)) {
      const low = Math.min(a, index);
      const high = Math.max(a, index);
      const key = low * count + high;
      if (!seen.has(key)) {
        seen.add(key);
        pairs.push(low, high);
      }
    }
  }

  return Uint32Array.from(pairs);
}

export function buildFormations(count: number, seed = 7): Formations {
  const random = seededRandom(seed);
  const unit = unitSphere(count, random);
  const corners = CLUSTER_CORNERS.map(normalise);

  // Each node joins the cluster whose corner it points toward, so neighbours on the sphere stay together.
  const cluster = new Uint8Array(count);
  const rank = new Uint16Array(count);
  const sizes = new Array<number>(CLUSTER_COUNT).fill(0);
  for (let i = 0; i < count; i++) {
    let best = 0;
    let bestDot = -Infinity;
    corners.forEach(([x, y, z], k) => {
      const dot = unit[i * 3] * x + unit[i * 3 + 1] * y + unit[i * 3 + 2] * z;
      if (dot > bestDot) {
        bestDot = dot;
        best = k;
      }
    });
    cluster[i] = best;
    rank[i] = sizes[best];
    sizes[best] += 1;
  }

  const clusterShapes = sizes.map((size) => unitSphere(Math.max(size, 1), random));
  const sphere = new Float32Array(count * 3);
  const clusters = new Float32Array(count * 3);
  const disc = new Float32Array(count * 3);
  const stagger = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const ux = unit[i * 3];
    const uy = unit[i * 3 + 1];
    const uz = unit[i * 3 + 2];
    sphere.set([ux * SPHERE_RADIUS, uy * SPHERE_RADIUS, uz * SPHERE_RADIUS], i * 3);

    const k = cluster[i];
    const shape = clusterShapes[k];
    const j = rank[i];
    const [cx, cy, cz] = corners[k];
    clusters.set(
      [
        cx * CLUSTER_SPREAD + shape[j * 3] * CLUSTER_RADIUS,
        cy * CLUSTER_SPREAD + shape[j * 3 + 1] * CLUSTER_RADIUS,
        cz * CLUSTER_SPREAD + shape[j * 3 + 2] * CLUSTER_RADIUS,
      ],
      i * 3,
    );

    disc.set([ux * DISC_RADIUS, uy * DISC_THICKNESS, uz * DISC_RADIUS], i * 3);
    stagger[i] = random();
  }

  return {
    count,
    sphere,
    clusters,
    disc,
    cluster,
    stagger,
    edges: nearestNeighbourEdges(unit, EDGE_NEIGHBOURS),
  };
}

/**
 * Writes node positions for a continuous formation value:
 * 0 = sphere, 1 = clusters, 2 = disc. Values in between morph the nodes, each on its own stagger.
 */
export function morphPositions(formations: Formations, form: number, out: Float32Array): void {
  const value = clamp(form, 0, 2);
  const firstSegment = value < 1;
  const from = firstSegment ? formations.sphere : formations.clusters;
  const to = firstSegment ? formations.clusters : formations.disc;
  const local = firstSegment ? value : value - 1;

  for (let i = 0; i < formations.count; i++) {
    const start = formations.stagger[i] * STAGGER;
    const t = easeInOutCubic((local - start) / (1 - STAGGER));
    for (let axis = 0; axis < 3; axis++) {
      const index = i * 3 + axis;
      out[index] = from[index] + (to[index] - from[index]) * t;
    }
  }
}
