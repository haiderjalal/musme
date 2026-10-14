/** Maximum rotation, in degrees, on either axis. Kept small so cards tilt rather than flip. */
const MAX_TILT_DEGREES = 5;

type ActiveTilt = {
  element: HTMLElement;
  rect: DOMRect;
};

/**
 * Tilts `[data-tilt]` cards toward a fine mouse pointer and moves a soft light with the pointer.
 * Touch and reduced-motion visitors get no tilt. Returns a cleanup function.
 */
export function startTilt(): () => void {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!finePointer.matches || reducedMotion.matches) return () => undefined;

  let active: ActiveTilt | null = null;

  const reset = (element: HTMLElement): void => {
    element.style.removeProperty("--tilt-x");
    element.style.removeProperty("--tilt-y");
    element.style.removeProperty("--spot-x");
    element.style.removeProperty("--spot-y");
    element.removeAttribute("data-tilt-active");
  };

  const onPointerOver = (event: PointerEvent): void => {
    if (event.pointerType !== "mouse" || !(event.target instanceof Element)) return;
    const element = event.target.closest<HTMLElement>("[data-tilt]");
    if (!element || element === active?.element) return;
    if (active) reset(active.element);
    // Measured at rest: the tilt is cleared on leave, so the rect never includes a rotation.
    active = { element, rect: element.getBoundingClientRect() };
    element.setAttribute("data-tilt-active", "");
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (!active || event.pointerType !== "mouse") return;
    const { element, rect } = active;
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    element.style.setProperty("--tilt-x", `${((0.5 - y) * 2 * MAX_TILT_DEGREES).toFixed(2)}deg`);
    element.style.setProperty("--tilt-y", `${((x - 0.5) * 2 * MAX_TILT_DEGREES).toFixed(2)}deg`);
    element.style.setProperty("--spot-x", `${(x * 100).toFixed(1)}%`);
    element.style.setProperty("--spot-y", `${(y * 100).toFixed(1)}%`);
  };

  const onPointerOut = (event: PointerEvent): void => {
    if (!active) return;
    const next = event.relatedTarget;
    if (next instanceof Node && active.element.contains(next)) return;
    reset(active.element);
    active = null;
  };

  document.addEventListener("pointerover", onPointerOver);
  document.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("pointerout", onPointerOut);

  return () => {
    document.removeEventListener("pointerover", onPointerOver);
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerout", onPointerOut);
    if (active) reset(active.element);
  };
}
