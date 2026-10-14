import { clamp, easeInOutCubic } from "@/lib/math";

/**
 * Pure geometry for the hero network. Every formation uses the same nodes in the same order, so the scene can
 * morph between shapes by interpolating positions. Each formation has its own edge list, built from its own
 * positions, and the scene cross-fades between the two edge sets while the nodes move.
 */

export const FORMATION = {
  /** A globe whose front surface carries the Musme mark as raised dots. */
  globe: 0,
  /** A plain connected sphere, used as the bridge from the logo into the sections. */
  network: 1,
  /** Four clusters, one per service. */
  clusters: 2,
  /** A 2 × 2 grid of blocks, one per project card. */
  gallery: 3,
  /** A ring, for the products. */
  ring: 4,
} as const;

export const FORMATION_COUNT = 5;
export const CLUSTER_COUNT = 4;

const SPHERE_RADIUS = 1.3;
/** How far the logo lifts off the globe, in world units. */
const LOGO_BUMP = 0.14;
/** The logo fits inside this fraction of the globe radius, so every logo dot sits on the globe. */
const LOGO_FIT = 0.96;
const LOGO_SHARE = 0.4;
const CLUSTER_SPREAD = 1.05;
const CLUSTER_RADIUS = 0.34;
const GALLERY_BLOCK_WIDTH = 1.2;
const GALLERY_BLOCK_HEIGHT = 0.72;
const GALLERY_OFFSET_X = 0.7;
const GALLERY_OFFSET_Y = 0.46;
const GALLERY_ASPECT = 1.6;
const RING_RADIUS = 1.2;
const RING_JITTER = 0.07;
const EDGE_NEIGHBOURS = 3;
const JITTER = 0.06;
/** Share of the morph window used to stagger nodes, so they arrive in a wave rather than in lockstep. */
const STAGGER = 0.5;

/** Tetrahedron corners: four well-separated cluster directions. */
const CLUSTER_CORNERS: ReadonlyArray<readonly [number, number, number]> = [
  [1, 1, 1],
  [1, -1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
];

/** Gallery block centres: top-left, top-right, bottom-left, bottom-right. */
const GALLERY_CENTRES: ReadonlyArray<readonly [number, number]> = [
  [-GALLERY_OFFSET_X, GALLERY_OFFSET_Y],
  [GALLERY_OFFSET_X, GALLERY_OFFSET_Y],
  [-GALLERY_OFFSET_X, -GALLERY_OFFSET_Y],
  [GALLERY_OFFSET_X, -GALLERY_OFFSET_Y],
];

/** A raster of the logo's coverage (alpha, 0 to 255), sampled once from the public mark. */
export type LogoMask = {
  width: number;
  height: number;
  coverage: Uint8Array;
};

export type Formation = {
  positions: Float32Array;
  /** Pairs of node indexes [a, b, a, b, ...]. */
  edges: Uint32Array;
  /** Globe only: 1 for edges between two logo dots, so the mark's own strokes can be drawn brighter. */
  logoEdges?: Uint8Array;
};

export type Formations = {
  count: number;
  /** Nodes [0, logoCount) form the logo on the globe; the rest sit on the globe's surface. */
  logoCount: number;
  /** One entry per formation, in the order of FORMATION. */
  list: Formation[];
  /** Cluster index (0 to CLUSTER_COUNT - 1) for each node, used to light services in turn. */
  cluster: Uint8Array;
  /** Per-node offset in [0, 1) used to stagger morphs and twinkling. */
  stagger: Float32Array;
};

/** Small deterministic PRNG (mulberry32) so the layout is identical on every visit. */
export function seededRandom(seed: number): () => number {
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

/**
 * Places `count` dots uniformly over the logo's coverage and lifts each onto the front of the globe.
 * The logo keeps its proportions and lies inside the globe's disc, so each dot sits on the surface.
 */
function sampleLogo(mask: LogoMask, count: number, random: () => number): Float32Array {
  const points = new Float32Array(count * 3);
  const aspect = mask.height / mask.width;
  const halfWidth = (LOGO_FIT * SPHERE_RADIUS) / Math.sqrt(1 + aspect * aspect);
  const radius = SPHERE_RADIUS + LOGO_BUMP;
  let filled = 0;
  let attempts = 0;

  while (filled < count && attempts < count * 400) {
    attempts += 1;
    const u = random();
    const v = random();
    const pixel = Math.floor(v * mask.height) * mask.width + Math.floor(u * mask.width);
    if (mask.coverage[pixel] < 128) continue;

    const x = (u - 0.5) * 2 * halfWidth;
    const y = (0.5 - v) * 2 * halfWidth * aspect;
    const z = Math.sqrt(Math.max(0, SPHERE_RADIUS * SPHERE_RADIUS - x * x - y * y));
    const length = Math.hypot(x, y, z) || 1;
    points.set([(x / length) * radius, (y / length) * radius, (z / length) * radius], filled * 3);
    filled += 1;
  }

  // An empty mask would leave points at the origin, so fall back to a point on the front of the globe.
  for (let i = filled; i < count; i++) points.set([0, 0, SPHERE_RADIUS + LOGO_BUMP], i * 3);
  return points;
}

/**
 * For each node, the indexes of its nearest neighbours, as unique pairs.
 * Keeps only the closest `neighbours` candidates per node, so no per-node sort of every other node is needed.
 */
export function nearestNeighbourEdges(points: Float32Array, neighbours: number): Uint32Array {
  const count = points.length / 3;
  const seen = new Set<number>();
  const pairs: number[] = [];
  const byDistance = (first: { distance: number }, second: { distance: number }) => first.distance - second.distance;

  for (let a = 0; a < count; a++) {
    const nearest: Array<{ index: number; distance: number }> = [];
    for (let b = 0; b < count; b++) {
      if (b === a) continue;
      const dx = points[a * 3] - points[b * 3];
      const dy = points[a * 3 + 1] - points[b * 3 + 1];
      const dz = points[a * 3 + 2] - points[b * 3 + 2];
      const distance = dx * dx + dy * dy + dz * dz;

      if (nearest.length < neighbours) {
        nearest.push({ index: b, distance });
        nearest.sort(byDistance);
      } else if (distance < nearest[neighbours - 1].distance) {
        nearest[neighbours - 1] = { index: b, distance };
        nearest.sort(byDistance);
      }
    }

    for (const { index } of nearest) {
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

type BuildOptions = {
  count: number;
  /** Null when the logo could not be loaded: the globe then carries no mark. */
  logoMask: LogoMask | null;
  seed?: number;
};

export function buildFormations({ count, logoMask, seed = 7 }: BuildOptions): Formations {
  const random = seededRandom(seed);
  const unit = unitSphere(count, random);
  const logoCount = logoMask ? Math.round(count * LOGO_SHARE) : 0;
  const logo = logoMask && logoCount > 0 ? sampleLogo(logoMask, logoCount, random) : null;
  const corners = CLUSTER_CORNERS.map(normalise);

  const sphere = new Float32Array(count * 3);
  const globe = new Float32Array(count * 3);
  const clusters = new Float32Array(count * 3);
  const gallery = new Float32Array(count * 3);
  const ring = new Float32Array(count * 3);
  const stagger = new Float32Array(count);

  // Each node joins the cluster whose corner it points toward, so neighbours on the sphere stay together.
  const cluster = new Uint8Array(count);
  const rank = new Uint16Array(count);
  const sizes = new Array<number>(corners.length).fill(0);
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
  const blockSize = Math.ceil(count / GALLERY_CENTRES.length);
  const blockColumns = Math.max(1, Math.round(Math.sqrt(blockSize * GALLERY_ASPECT)));
  const blockRows = Math.ceil(blockSize / blockColumns);

  for (let i = 0; i < count; i++) {
    const ux = unit[i * 3];
    const uy = unit[i * 3 + 1];
    const uz = unit[i * 3 + 2];
    sphere.set([ux * SPHERE_RADIUS, uy * SPHERE_RADIUS, uz * SPHERE_RADIUS], i * 3);

    if (logo && i < logoCount) {
      globe.set([logo[i * 3], logo[i * 3 + 1], logo[i * 3 + 2]], i * 3);
    } else {
      globe.set([ux * SPHERE_RADIUS, uy * SPHERE_RADIUS, uz * SPHERE_RADIUS], i * 3);
    }

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

    const block = i % GALLERY_CENTRES.length;
    const cell = Math.floor(i / GALLERY_CENTRES.length);
    const column = cell % blockColumns;
    const row = Math.floor(cell / blockColumns);
    const [bx, by] = GALLERY_CENTRES[block];
    const gx = bx + (blockColumns > 1 ? column / (blockColumns - 1) - 0.5 : 0) * GALLERY_BLOCK_WIDTH;
    const gy = by + (0.5 - (blockRows > 1 ? row / (blockRows - 1) : 0)) * GALLERY_BLOCK_HEIGHT;
    gallery.set([gx, gy, gy * 0.2], i * 3);

    const angle = (i / count) * Math.PI * 2;
    const radius = RING_RADIUS + (random() - 0.5) * RING_JITTER * 2;
    ring.set([Math.cos(angle) * radius, (random() - 0.5) * RING_JITTER * 2, Math.sin(angle) * radius], i * 3);

    stagger[i] = random();
  }

  const globeEdges = nearestNeighbourEdges(globe, EDGE_NEIGHBOURS);
  const logoEdges = Uint8Array.from({ length: globeEdges.length / 2 }, (_, e) =>
    globeEdges[e * 2] < logoCount && globeEdges[e * 2 + 1] < logoCount ? 1 : 0,
  );

  return {
    count,
    logoCount,
    list: [
      { positions: globe, edges: globeEdges, logoEdges },
      ...[sphere, clusters, gallery, ring].map((positions) => ({
        positions,
        edges: nearestNeighbourEdges(positions, EDGE_NEIGHBOURS),
      })),
    ],
    cluster,
    stagger,
  };
}

/** Splits a continuous formation value into the segment it lies in and the progress through that segment. */
export function segmentAt(form: number, formCount: number): { segment: number; local: number } {
  const value = clamp(form, 0, formCount - 1);
  const segment = Math.min(Math.floor(value), formCount - 2);
  return { segment, local: value - segment };
}

/**
 * Writes node positions for a continuous formation value, from 0 (globe) to FORMATION_COUNT - 1 (ring).
 * Between two formations each node moves on its own stagger, so the shape reforms in a wave.
 */
export function morphPositions(formations: Formations, form: number, out: Float32Array): void {
  const { segment, local } = segmentAt(form, formations.list.length);
  const from = formations.list[segment].positions;
  const to = formations.list[segment + 1].positions;

  for (let i = 0; i < formations.count; i++) {
    const start = formations.stagger[i] * STAGGER;
    const t = easeInOutCubic((local - start) / (1 - STAGGER));
    for (let axis = 0; axis < 3; axis++) {
      const index = i * 3 + axis;
      out[index] = from[index] + (to[index] - from[index]) * t;
    }
  }
}
