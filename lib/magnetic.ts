/** Fraction of the pointer's offset from the control's centre that the control follows. */
const LEAN_STRENGTH = 0.25;

type Lean = {
  element: HTMLElement;
  rect: DOMRect;
};

/**
 * Leans `[data-magnetic]` controls toward a fine mouse pointer. Touch and reduced-motion visitors get no lean.
 * Returns a cleanup function that removes the listeners and resets the active control.
 */
export function startMagneticLean(): () => void {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!finePointer.matches || reducedMotion.matches) return () => undefined;

  let current: Lean | null = null;

  const rest = (element: HTMLElement): void => {
    element.style.removeProperty("--magnet-x");
    element.style.removeProperty("--magnet-y");
  };

  const onPointerOver = (event: PointerEvent): void => {
    if (event.pointerType !== "mouse" || !(event.target instanceof Element)) return;
    const element = event.target.closest<HTMLElement>("[data-magnetic]");
    if (!element || element === current?.element) return;
    if (current) rest(current.element);
    // Measured while the control is at rest; the lean is reset on leave, so this never includes an offset.
    current = { element, rect: element.getBoundingClientRect() };
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (!current || event.pointerType !== "mouse") return;
    const { element, rect } = current;
    const x = (event.clientX - rect.left - rect.width / 2) * LEAN_STRENGTH;
    const y = (event.clientY - rect.top - rect.height / 2) * LEAN_STRENGTH;
    element.style.setProperty("--magnet-x", `${x.toFixed(2)}px`);
    element.style.setProperty("--magnet-y", `${y.toFixed(2)}px`);
  };

  const onPointerOut = (event: PointerEvent): void => {
    if (!current) return;
    const next = event.relatedTarget;
    if (next instanceof Node && current.element.contains(next)) return;
    rest(current.element);
    current = null;
  };

  document.addEventListener("pointerover", onPointerOver);
  document.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("pointerout", onPointerOut);

  return () => {
    document.removeEventListener("pointerover", onPointerOver);
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerout", onPointerOut);
    if (current) rest(current.element);
  };
}
