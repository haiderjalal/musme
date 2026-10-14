"use client";

import { useEffect, useRef } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const IDLE_TIMEOUT_MS = 1500;
const FALLBACK_DELAY_MS = 400;

/** Runs `callback` when the browser is idle, so the 3D bundle never competes with first paint. */
function whenIdle(callback: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback, { timeout: IDLE_TIMEOUT_MS });
    return () => window.cancelIdleCallback(id);
  }

  const id = window.setTimeout(callback, FALLBACK_DELAY_MS);
  return () => window.clearTimeout(id);
}

/**
 * The 3D network behind the page. three.js and the logo are loaded only after the browser is idle. If WebGL is
 * unavailable the canvas is hidden and the rest of the page is unaffected.
 */
export function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let network: { destroy: () => void } | null = null;

    const cancelIdle = whenIdle(() => {
      const animate = !window.matchMedia(REDUCED_MOTION_QUERY).matches;

      import("@/lib/network/scene")
        .then(({ createNetwork }) => createNetwork(canvas, { animate }))
        .then((created) => {
          // The visitor may have left the page while the scene was loading.
          if (cancelled) {
            created.destroy();
            return;
          }
          network = created;
          canvas.dataset.state = "ready";
        })
        .catch(() => {
          canvas.dataset.state = "off";
        });
    });

    return () => {
      cancelled = true;
      cancelIdle();
      network?.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className="network-canvas" data-state="idle" aria-hidden="true" />;
}
