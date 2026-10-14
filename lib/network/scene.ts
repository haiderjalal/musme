import * as THREE from "three";

import { clamp, damp, lerp } from "@/lib/math";
import { measureChapters, formationAt, type ChapterLayout } from "@/lib/network/chapters";
import {
  FORMATION,
  FORMATION_COUNT,
  buildFormations,
  morphPositions,
  segmentAt,
  type Formations,
} from "@/lib/network/formations";
import { loadLogoMask } from "@/lib/network/logo";

const LOGO_SRC = "/images/musme-logo-mark.png";
const MINT = new THREE.Color("#6befbc");
const SILVER = new THREE.Color("#a1a89d");
const PACKET = new THREE.Color("#d9fff1");

const NODE_COUNT = 380;
const COMPACT_NODE_COUNT = 230;
const COMPACT_BREAKPOINT = 780;
const PACKET_COUNT = 22;
const RING_SEGMENTS = 96;
const RING_RADIUS = 1.7;
const FIELD_OF_VIEW = 36;
const CAMERA_DISTANCE = 7;
const MAX_PIXEL_RATIO = 1.75;
const MAX_STEP_SECONDS = 0.05;
const EDGE_OPACITY = 0.34;
const DIM_EDGE_SHADE = 0.2;
const LOGO_DOT_SIZE = 0.1;
const SPHERE_DOT_SIZE = 0.055;
/** Brightness of the sphere's own dots while the globe shows the mark. */
const RECEDED_NODE_BRIGHTNESS = 0.3;
const HALO_OPACITY = 0.22;
/** How far the mark sways either side of facing the camera, in radians. Keeps it readable as a logo. */
const LOGO_SWAY = 0.3;

export type NetworkOptions = {
  /** False renders one still frame and stops, for visitors who asked for reduced motion. */
  animate: boolean;
};

export type NetworkHandle = {
  destroy: () => void;
};

/** A soft radial sprite, drawn once. Used for nodes, packets, and the halo, so no shaders are needed. */
function createGlowTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("2D canvas is unavailable.");

  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.35, "rgba(255, 255, 255, 0.55)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

/**
 * Builds the hero network on `canvas`. Rejects if WebGL is unavailable, so the caller can hide the canvas.
 * The globe carries the Musme mark; as the visitor scrolls it reforms into the network, the service clusters,
 * the project gallery, and the product ring.
 */
export async function createNetwork(canvas: HTMLCanvasElement, options: NetworkOptions): Promise<NetworkHandle> {
  const count = window.innerWidth < COMPACT_BREAKPOINT ? COMPACT_NODE_COUNT : NODE_COUNT;
  const logoMask = await loadLogoMask(LOGO_SRC);
  const formations: Formations = buildFormations({ count, logoMask });

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FIELD_OF_VIEW, 1, 0.1, 100);
  camera.position.z = CAMERA_DISTANCE;

  const root = new THREE.Group();
  const spin = new THREE.Group();
  root.add(spin);
  scene.add(root);

  const glow = createGlowTexture();

  const positions = new Float32Array(formations.count * 3);
  const colors = new Float32Array(formations.count * 3);
  // The logo dots and the rest of the sphere are separate point layers, so the mark can be drawn larger.
  // Both layers are views into the shared arrays above.
  const logoSplit = formations.logoCount * 3;
  const logoGeometry = new THREE.BufferGeometry();
  const logoPositionAttribute = new THREE.BufferAttribute(positions.subarray(0, logoSplit), 3);
  const logoColorAttribute = new THREE.BufferAttribute(colors.subarray(0, logoSplit), 3);
  logoGeometry.setAttribute("position", logoPositionAttribute);
  logoGeometry.setAttribute("color", logoColorAttribute);
  const logoMaterial = new THREE.PointsMaterial({
    size: LOGO_DOT_SIZE,
    map: glow,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
  });
  spin.add(new THREE.Points(logoGeometry, logoMaterial));

  const nodeGeometry = new THREE.BufferGeometry();
  const nodePositionAttribute = new THREE.BufferAttribute(positions.subarray(logoSplit), 3);
  const nodeColorAttribute = new THREE.BufferAttribute(colors.subarray(logoSplit), 3);
  nodeGeometry.setAttribute("position", nodePositionAttribute);
  nodeGeometry.setAttribute("color", nodeColorAttribute);
  const nodeMaterial = new THREE.PointsMaterial({
    size: SPHERE_DOT_SIZE,
    map: glow,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
  });
  spin.add(new THREE.Points(nodeGeometry, nodeMaterial));

  // One edge set per formation. Two are visible at a time while the nodes morph between them.
  const edgeLines = formations.list.map((formation) => {
    const edgeCount = formation.edges.length / 2;
    const linePositions = new Float32Array(edgeCount * 6);
    const geometry = new THREE.BufferGeometry();
    const attribute = new THREE.BufferAttribute(linePositions, 3);
    geometry.setAttribute("position", attribute);

    // Edges between logo dots are full strength; the rest of the globe's edges are dimmed, so the mark reads clearly.
    const shades = new Float32Array(edgeCount * 6);
    for (let e = 0; e < edgeCount; e++) {
      const shade = formation.logoEdges && formation.logoEdges[e] === 0 ? DIM_EDGE_SHADE : 1;
      shades.fill(shade, e * 6, e * 6 + 6);
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(shades, 3));

    const material = new THREE.LineBasicMaterial({
      color: MINT,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const line = new THREE.LineSegments(geometry, material);
    line.visible = false;
    spin.add(line);
    return { line, geometry, material, attribute, linePositions };
  });

  const packetPositions = new Float32Array(PACKET_COUNT * 3);
  const packetGeometry = new THREE.BufferGeometry();
  const packetPositionAttribute = new THREE.BufferAttribute(packetPositions, 3);
  packetGeometry.setAttribute("position", packetPositionAttribute);
  const packetMaterial = new THREE.PointsMaterial({
    color: PACKET,
    size: 0.08,
    map: glow,
    transparent: true,
    depthWrite: false,
  });
  spin.add(new THREE.Points(packetGeometry, packetMaterial));
  const packetSpeed = Float32Array.from({ length: PACKET_COUNT }, (_, p) => 0.12 + ((p * 0.618) % 1) * 0.22);
  const packetPhase = Float32Array.from({ length: PACKET_COUNT }, (_, p) => (p * 0.381) % 1);

  const ringPoints: THREE.Vector3[] = [];
  for (let s = 0; s < RING_SEGMENTS; s++) {
    const angle = (s / RING_SEGMENTS) * Math.PI * 2;
    ringPoints.push(new THREE.Vector3(Math.cos(angle) * RING_RADIUS, Math.sin(angle) * RING_RADIUS, 0));
  }
  const ringGeometry = new THREE.BufferGeometry().setFromPoints(ringPoints);
  const ringMaterial = new THREE.LineBasicMaterial({ color: MINT, transparent: true, opacity: 0.24, depthWrite: false });
  const orbit = new THREE.LineLoop(ringGeometry, ringMaterial);
  orbit.rotation.set(1.05, 0.3, 0.2);
  spin.add(orbit);

  const haloMaterial = new THREE.SpriteMaterial({
    map: glow,
    color: MINT,
    transparent: true,
    opacity: HALO_OPACITY,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const halo = new THREE.Sprite(haloMaterial);
  halo.scale.set(5, 5, 1);
  root.add(halo);

  let layout: ChapterLayout | null = measureChapters();
  const smoothed = { form: FORMATION.globe as number, highlight: 0, pointerX: 0, pointerY: 0 };
  const pointer = { x: 0, y: 0 };
  const startedAt = performance.now();
  let lastTime = startedAt;
  let frameId = 0;
  let running = false;

  const writeEdges = (index: number): void => {
    const { edges } = formations.list[index];
    const { linePositions, attribute } = edgeLines[index];
    for (let e = 0; e < edges.length / 2; e++) {
      const a = edges[e * 2] * 3;
      const b = edges[e * 2 + 1] * 3;
      for (let axis = 0; axis < 3; axis++) {
        linePositions[e * 6 + axis] = positions[a + axis];
        linePositions[e * 6 + 3 + axis] = positions[b + axis];
      }
    }
    attribute.needsUpdate = true;
  };

  const updateColours = (seconds: number, clusterWeight: number, logoWeight: number): void => {
    for (let i = 0; i < formations.count; i++) {
      const focus = clamp(1 - Math.abs(smoothed.highlight - formations.cluster[i]));
      const clustered = lerp(0.35, 1, focus);
      const twinkle = 0.86 + 0.14 * Math.sin(seconds * 1.4 + formations.stagger[i] * Math.PI * 2);
      const base = lerp(0.85, clustered, clusterWeight);
      // On the globe the mark is brightest and the rest of the sphere recedes, so the logo reads clearly.
      const emphasis = i < formations.logoCount ? lerp(base, 1, logoWeight) : lerp(base, RECEDED_NODE_BRIGHTNESS, logoWeight);
      const brightness = Math.min(1, emphasis * twinkle);
      colors[i * 3] = SILVER.r + (MINT.r - SILVER.r) * brightness;
      colors[i * 3 + 1] = SILVER.g + (MINT.g - SILVER.g) * brightness;
      colors[i * 3 + 2] = SILVER.b + (MINT.b - SILVER.b) * brightness;
    }
    logoColorAttribute.needsUpdate = true;
    nodeColorAttribute.needsUpdate = true;
  };

  const updatePackets = (seconds: number, primary: number): void => {
    const edges = formations.list[primary].edges;
    const edgeTotal = edges.length / 2;
    for (let p = 0; p < PACKET_COUNT; p++) {
      const edge = (p * 37 + Math.floor(seconds * 0.1) * 11) % edgeTotal;
      const a = edges[edge * 2] * 3;
      const b = edges[edge * 2 + 1] * 3;
      const progress = (seconds * packetSpeed[p] + packetPhase[p]) % 1;
      for (let axis = 0; axis < 3; axis++) {
        packetPositions[p * 3 + axis] = lerp(positions[a + axis], positions[b + axis], progress);
      }
    }
    packetPositionAttribute.needsUpdate = true;
  };

  const resize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // Wide screens place the network beside the hero copy; narrow screens centre it above the copy.
    const halfHeight = Math.tan(THREE.MathUtils.degToRad(FIELD_OF_VIEW / 2)) * CAMERA_DISTANCE;
    const halfWidth = halfHeight * camera.aspect;
    const wide = camera.aspect > 1;
    root.position.set(wide ? halfWidth * 0.41 : 0, wide ? halfHeight * 0.4 : halfHeight * 0.42, 0);
    root.scale.setScalar(wide ? 0.85 : 0.8);
    layout = measureChapters();
    if (!options.animate) render(performance.now(), true);
  };

  /** Draws one frame. Returns false when the canvas is covered by the light section, so no GPU work is done. */
  const render = (timeMs: number, force: boolean): boolean => {
    const deltaSeconds = Math.min((timeMs - lastTime) / 1000, MAX_STEP_SECONDS);
    const seconds = timeMs / 1000;
    lastTime = timeMs;
    const scrollY = window.scrollY;
    const state = formationAt(layout, scrollY, window.innerHeight);

    smoothed.form = damp(smoothed.form, state.form, 4, deltaSeconds);
    smoothed.highlight = damp(smoothed.highlight, state.highlight, 6, deltaSeconds);
    smoothed.pointerX = damp(smoothed.pointerX, pointer.x, 3, deltaSeconds);
    smoothed.pointerY = damp(smoothed.pointerY, pointer.y, 3, deltaSeconds);

    if (!state.visible && !force) return false;

    const { segment, local } = segmentAt(smoothed.form, FORMATION_COUNT);
    morphPositions(formations, smoothed.form, positions);
    logoPositionAttribute.needsUpdate = true;
    nodePositionAttribute.needsUpdate = true;

    edgeLines.forEach((edge, index) => {
      const weight = index === segment ? 1 - local : index === segment + 1 ? local : 0;
      edge.line.visible = weight > 0.01;
      if (edge.line.visible) {
        edge.material.opacity = weight * EDGE_OPACITY;
        writeEdges(index);
      }
    });

    const clusterWeight = clamp(1 - Math.abs(smoothed.form - FORMATION.clusters));
    const logoWeight = clamp(1 - Math.abs(smoothed.form - FORMATION.globe));
    updateColours(seconds, clusterWeight, logoWeight);
    updatePackets(seconds, local < 0.5 ? segment : segment + 1);

    // While the mark is showing it sways gently in front of the camera rather than turning away from it,
    // in line with the logo guidelines. Once the globe leaves the logo it turns freely.
    const elapsed = (timeMs - startedAt) / 1000;
    const sway = Math.sin(elapsed * 0.3) * LOGO_SWAY;
    const drift = elapsed * 0.05;
    const turn = lerp(sway, drift, 1 - logoWeight);
    const calm = 1 - 0.7 * logoWeight;
    spin.rotation.set(
      0.18 + smoothed.pointerY * 0.12 * calm + scrollY * 0.00025 * calm,
      turn + (smoothed.pointerX * 0.25 + scrollY * 0.0006) * calm,
      0,
    );
    renderer.render(scene, camera);
    return true;
  };

  const loop = (time: number): void => {
    frameId = requestAnimationFrame(loop);
    render(time, false);
  };

  const start = (): void => {
    if (running || !options.animate) return;
    running = true;
    lastTime = performance.now();
    frameId = requestAnimationFrame(loop);
  };

  const stop = (): void => {
    running = false;
    cancelAnimationFrame(frameId);
  };

  const onVisibilityChange = (): void => (document.hidden ? stop() : start());
  const onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType !== "mouse") return;
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
  };
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const resizeObserver = new ResizeObserver(() => {
    layout = measureChapters();
  });

  resize();
  window.addEventListener("resize", resize);
  resizeObserver.observe(document.body);
  if (finePointer) window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);

  if (options.animate) {
    start();
  } else {
    render(performance.now(), true);
  }

  return {
    destroy: () => {
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      resizeObserver.disconnect();
      logoGeometry.dispose();
      logoMaterial.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      edgeLines.forEach((edge) => {
        edge.geometry.dispose();
        edge.material.dispose();
      });
      packetGeometry.dispose();
      packetMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      haloMaterial.dispose();
      glow.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
