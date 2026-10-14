export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

export function smoothstep(t: number): number {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
}

export function easeInOutCubic(t: number): number {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/** Frame-rate independent exponential smoothing. `lambda` is the response rate in 1/s. */
export function damp(current: number, target: number, lambda: number, deltaSeconds: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * deltaSeconds));
}
