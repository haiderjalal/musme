import { clamp } from "@/lib/math";
import { subscribeToScroll } from "@/lib/scroll";

const LINK_SELECTOR = "[data-scroll-link], [data-scroll-exit]";

/**
 * Writes scroll progress into CSS custom properties so styles can respond to scrolling without React state.
 * - `data-scroll-link`: `--p` runs 0 → 1 while the element travels up through the viewport.
 * - `data-scroll-exit`: `--out` runs 0 → 1 while the element leaves the top of the viewport.
 * Layout is read for every element first and styles are written afterwards, so each frame reads once.
 */
export function startScrollLinks(): () => void {
  const elements = Array.from(document.querySelectorAll<HTMLElement>(LINK_SELECTOR));
  if (elements.length === 0) return () => undefined;

  const update = (): void => {
    const viewport = window.innerHeight;
    const measured = elements.map((element) => ({
      element,
      exit: element.hasAttribute("data-scroll-exit"),
      rect: element.getBoundingClientRect(),
    }));

    for (const { element, exit, rect } of measured) {
      if (exit) {
        element.style.setProperty("--out", clamp(-rect.top / (viewport * 0.5)).toFixed(3));
      } else {
        const progress = (viewport * 0.82 - rect.top) / (rect.height + viewport * 0.42);
        element.style.setProperty("--p", clamp(progress).toFixed(3));
      }
    }
  };

  const unsubscribe = subscribeToScroll(update);
  window.addEventListener("resize", update);

  return () => {
    unsubscribe();
    window.removeEventListener("resize", update);
  };
}
