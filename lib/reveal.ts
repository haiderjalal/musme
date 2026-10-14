/** Reveal line: content starts revealing a little before it reaches the bottom edge of the viewport. */
const ROOT_MARGIN = "0px 0px -10% 0px";

/** Fine-grained steps so one observer can honour each element's own `data-reveal-amount`. */
const THRESHOLDS = Array.from({ length: 51 }, (_, step) => step / 50);

const DEFAULT_AMOUNT = 0.18;

/** Elements that reveal once: whole blocks (`data-reveal`) and headings that split into words (`data-split="view"`). */
const REVEAL_SELECTOR = "[data-reveal]:not([data-in]), [data-split='view']:not([data-in])";

/**
 * Sets `data-in` on each revealing element once it enters the viewport.
 * Returns a cleanup function that stops observing and removes the scroll listener.
 */
export function startRevealObserver(): () => void {
  const pending = new Set<HTMLElement>();
  let frame = 0;

  const reveal = (element: HTMLElement): void => {
    element.setAttribute("data-in", "");
    pending.delete(element);
    observer.unobserve(element);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const amount = Number(entry.target.getAttribute("data-reveal-amount") ?? DEFAULT_AMOUNT);
        if (entry.isIntersecting && entry.intersectionRatio >= amount) {
          reveal(entry.target as HTMLElement);
        }
      }
    },
    { rootMargin: ROOT_MARGIN, threshold: THRESHOLDS },
  );

  // An observer never reports elements the visitor scrolled past (for example after a hash link jump),
  // so anything already above the viewport is revealed on the next scroll frame.
  const sweep = (): void => {
    frame = 0;
    pending.forEach((element) => {
      if (element.getBoundingClientRect().bottom < 0) reveal(element);
    });
  };

  const onScroll = (): void => {
    if (frame === 0 && pending.size > 0) frame = requestAnimationFrame(sweep);
  };

  document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((element) => {
    pending.add(element);
    observer.observe(element);
  });
  window.addEventListener("scroll", onScroll, { passive: true });

  return () => {
    window.removeEventListener("scroll", onScroll);
    cancelAnimationFrame(frame);
    observer.disconnect();
    pending.clear();
  };
}
