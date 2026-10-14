import * as THREE from "three";

import { damp, clamp, lerp } from "@/lib/math";
import { formationAt, measureChapters, type ChapterLayout } from "@/lib/network/chapters";
import { buildFormations, morphPositions, type Formations } from "@/lib/network/formations";

const MINT = new THREE.Color("#6befbc");
const SILVER = new THREE.Color("#a1a89d");
const PACKET = new THREE.Color("#d9fff1");

const NODE_COUNT = 180;
const COMPACT_NODE_COUNT = 110;
const COMPACT_BREAKPOINT = 780;
const PACKET_COUNT = 18;
const RING_SEGMENTS = 96;
const RING_RADIUS = 1.7;
const FIELD_OF_VIEW = 36;
const CAMERA_DISTANCE = 7;
const MAX_PIXEL_RATIO = 1.75;
const MAX_STEP_SECONDS = 0.05;

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
 * Builds the hero network on `canvas`. Throws if WebGL is unavailable, so the caller can hide the canvas.
 * The scene reads the page's chapter layout and morphs between the sphere, clusters, and disc as the visitor scrolls.
 */
export function createNetwork(canvas: HTMLCanvasElement, options: NetworkOptions): NetworkHandle {
  const nodeCount = window.innerWidth < COMPACT_BREAKPOINT ? COMPACT_NODE_COUNT : NODE_COUNT;
  const formations: Formations = buildFormations(nodeCount);
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
  const nodeGeometry = new THREE.BufferGeometry();
  const nodePositionAttribute = new THREE.BufferAttribute(positions, 3);
  nodeGeometry.setAttribute("position", nodePositionAttribute);
  nodeGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const nodeMaterial = new THREE.PointsMaterial({
    size: 0.105,
    map: glow,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
  });
  spin.add(new THREE.Points(nodeGeometry, nodeMaterial));

  const edgeCount = formations.edges.length / 2;
  const linePositions = new Float32Array(edgeCount * 6);
  const edgeGeometry = new THREE.BufferGeometry();
  const edgePositionAttribute = new THREE.BufferAttribute(linePositions, 3);
  edgeGeometry.setAttribute("position", edgePositionAttribute);
  const edgeMaterial = new THREE.LineBasicMaterial({ color: MINT, transparent: true, opacity: 0.34, depthWrite: false });
  spin.add(new THREE.LineSegments(edgeGeometry, edgeMaterial));

  const packetEdge = Uint32Array.from({ length: PACKET_COUNT }, (_, p) => (p * 37) % edgeCount);
  const packetSpeed = Float32Array.from({ length: PACKET_COUNT }, (_, p) => 0.12 + ((p * 0.618) % 1) * 0.22);
  const packetPhase = Float32Array.from({ length: PACKET_COUNT }, (_, p) => (p * 0.381) % 1);
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

  const ringPoints: THREE.Vector3[] = [];
  for (let s = 0; s < RING_SEGMENTS; s++) {
    const angle = (s / RING_SEGMENTS) * Math.PI * 2;
    ringPoints.push(new THREE.Vector3(Math.cos(angle) * RING_RADIUS, Math.sin(angle) * RING_RADIUS, 0));
  }
  const ringGeometry = new THREE.BufferGeometry().setFromPoints(ringPoints);
  const ringMaterial = new THREE.LineBasicMaterial({ color: MINT, transparent: true, opacity: 0.24, depthWrite: false });
  const ring = new THREE.LineLoop(ringGeometry, ringMaterial);
  ring.rotation.set(1.05, 0.3, 0.2);
  spin.add(ring);

  const haloMaterial = new THREE.SpriteMaterial({
    map: glow,
    color: MINT,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const halo = new THREE.Sprite(haloMaterial);
  halo.scale.set(5, 5, 1);
  root.add(halo);

  let layout: ChapterLayout | null = measureChapters();
  const smoothed = { form: 0, highlight: 0, pointerX: 0, pointerY: 0 };
  const pointer = { x: 0, y: 0 };
  let lastTime = performance.now();
  let frameId = 0;
  let running = false;

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
    root.position.set(wide ? halfWidth * 0.5 : 0, wide ? halfHeight * 0.4 : halfHeight * 0.42, 0);
    root.scale.setScalar(wide ? 1 : 0.8);
    layout = measureChapters();
    if (!options.animate) render(performance.now(), true);
  };

  const updateColours = (seconds: number): void => {
    const clusterWeight = clamp(1 - Math.abs(smoothed.form - 1));
    for (let i = 0; i < formations.count; i++) {
      const focus = clamp(1 - Math.abs(smoothed.highlight - formations.cluster[i]));
      const clustered = lerp(0.35, 1, focus);
      const twinkle = 0.86 + 0.14 * Math.sin(seconds * 1.4 + formations.stagger[i] * Math.PI * 2);
      const brightness = Math.min(1, lerp(0.85, clustered, clusterWeight) * twinkle);
      colors[i * 3] = SILVER.r + (MINT.r - SILVER.r) * brightness;
      colors[i * 3 + 1] = SILVER.g + (MINT.g - SILVER.g) * brightness;
      colors[i * 3 + 2] = SILVER.b + (MINT.b - SILVER.b) * brightness;
    }
    nodeGeometry.attributes.color.needsUpdate = true;
  };

  const updateEdges = (): void => {
    for (let e = 0; e < edgeCount; e++) {
      const a = formations.edges[e * 2] * 3;
      const b = formations.edges[e * 2 + 1] * 3;
      for (let axis = 0; axis < 3; axis++) {
        linePositions[e * 6 + axis] = positions[a + axis];
        linePositions[e * 6 + 3 + axis] = positions[b + axis];
      }
    }
    edgePositionAttribute.needsUpdate = true;
  };

  const updatePackets = (seconds: number): void => {
    for (let p = 0; p < PACKET_COUNT; p++) {
      const progress = (seconds * packetSpeed[p] + packetPhase[p]) % 1;
      const a = formations.edges[packetEdge[p] * 2] * 3;
      const b = formations.edges[packetEdge[p] * 2 + 1] * 3;
      for (let axis = 0; axis < 3; axis++) {
        packetPositions[p * 3 + axis] = lerp(positions[a + axis], positions[b + axis], progress);
      }
    }
    packetPositionAttribute.needsUpdate = true;
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

    morphPositions(formations, smoothed.form, positions);
    nodePositionAttribute.needsUpdate = true;
    updateColours(seconds);
    updateEdges();
    updatePackets(seconds);

    spin.rotation.set(
      0.18 + smoothed.pointerY * 0.12 + scrollY * 0.00025,
      seconds * 0.05 + smoothed.pointerX * 0.25 + scrollY * 0.0006,
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
      nodeGeometry.dispose();
      edgeGeometry.dispose();
      packetGeometry.dispose();
      ringGeometry.dispose();
      nodeMaterial.dispose();
      edgeMaterial.dispose();
      packetMaterial.dispose();
      ringMaterial.dispose();
      haloMaterial.dispose();
      glow.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
