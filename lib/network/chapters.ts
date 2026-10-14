import { CLUSTER_COUNT } from "@/lib/network/formations";
import { clamp, smoothstep } from "@/lib/math";

/**
 * Connects the page's chapters to the network. Sections are measured once (on load and on resize), so the
 * per-frame work is pure arithmetic on the scroll position and never reads layout.
 */

type Span = { top: number; height: number };
type Anchor = { y: number; form: number };

export type ChapterLayout = {
  /** Scroll positions where a formation is fully reached (section centred in the viewport). */
  anchors: Anchor[];
  services: Span;
  /** Scroll position at which the light section covers the canvas. */
  coverTop: number;
};

export type FormationState = {
  /** 0 = sphere, 1 = clusters, 2 = disc. */
  form: number;
  /** Highlighted cluster as a continuous index, from 0 to CLUSTER_COUNT - 1. */
  highlight: number;
  /** False once the light section covers the canvas, so rendering can stop. */
  visible: boolean;
};

const IDLE_STATE: FormationState = { form: 0, highlight: 0, visible: true };

function readSpan(selector: string): Span | null {
  const element = document.querySelector(selector);
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return { top: rect.top + window.scrollY, height: rect.height };
}

export function measureChapters(): ChapterLayout | null {
  const hero = readSpan("#top");
  const services = readSpan("#services");
  const work = readSpan("#work");
  const products = readSpan("#products");
  const cover = readSpan(".light");
  if (!hero || !services || !work || !products) return null;

  const viewport = window.innerHeight;
  const centre = (span: Span): number => span.top + span.height / 2 - viewport / 2;

  return {
    anchors: [
      { y: centre(hero), form: 0 },
      { y: centre(services), form: 1 },
      { y: centre(work), form: 2 },
      { y: centre(products), form: 0 },
    ],
    services,
    coverTop: cover ? cover.top : Number.POSITIVE_INFINITY,
  };
}

function formAt(anchors: Anchor[], scrollY: number): number {
  const first = anchors[0];
  const last = anchors[anchors.length - 1];
  if (scrollY <= first.y) return first.form;
  if (scrollY >= last.y) return last.form;

  for (let i = 0; i < anchors.length - 1; i++) {
    const from = anchors[i];
    const to = anchors[i + 1];
    if (scrollY <= to.y) {
      const t = smoothstep((scrollY - from.y) / (to.y - from.y));
      return from.form + (to.form - from.form) * t;
    }
  }

  return last.form;
}

export function formationAt(layout: ChapterLayout | null, scrollY: number, viewportHeight: number): FormationState {
  if (!layout) return IDLE_STATE;

  // The services list is read from its top to its bottom, so each service lights a cluster in turn.
  const progress = clamp((scrollY + viewportHeight / 2 - layout.services.top) / layout.services.height);

  return {
    form: formAt(layout.anchors, scrollY),
    highlight: progress * (CLUSTER_COUNT - 1),
    visible: scrollY < layout.coverTop,
  };
}
