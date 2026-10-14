type ScrollListener = () => void;

const listeners = new Set<ScrollListener>();
let frame = 0;

function flush(): void {
  frame = 0;
  listeners.forEach((listener) => listener());
}

function handleScroll(): void {
  if (frame === 0) frame = requestAnimationFrame(flush);
}

/**
 * Runs `listener` once per animation frame in which the page has scrolled, and once immediately.
 * Listeners share a single scroll handler, so scroll-linked effects never add their own.
 */
export function subscribeToScroll(listener: ScrollListener): () => void {
  if (listeners.size === 0) window.addEventListener("scroll", handleScroll, { passive: true });
  listeners.add(listener);
  listener();

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}
