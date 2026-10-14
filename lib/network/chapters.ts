import { CLUSTER_COUNT, FORMATION } from "@/lib/network/formations";
import { clamp, smoothstep } from "@/lib/math";

/**
 * Connects the page's chapters to the network. Sections are measured once (on load and on resize), so the
 * per-frame work is pure arithmetic on the scroll position and never reads layout.
 */

type Span = { top: number; height: number };
type Anchor = { y: number; form: number };

export type ChapterLayout = {
  /** Scroll positions where each formation is fully reached, in increasing order. */
  anchors: Anchor[];
  services: Span;
  /** Scroll position at which the light section covers the canvas. */
  coverTop: number;
};

export type FormationState = {
  /** Continuous formation value, from FORMATION.globe to FORMATION.ring. */
  form: number;
  /** Highlighted cluster as a continuous index, from 0 to CLUSTER_COUNT - 1. */
  highlight: number;
  /** False once the light section covers the canvas, so rendering can stop. */
  visible: boolean;
};

const IDLE_STATE: FormationState = { form: FORMATION.globe, highlight: 0, visible: true };

/**
 * The work block's shape is positioned above its project cards, so it is visible while the cards are on screen.
 * This many viewport heights are subtracted from the section top.
 */
const WORK_LEAD_VIEWPORTS = 0.3;

function readSpan(selector: string): Span | null {
  const element = document.querySelector(selector);
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return { top: rect.top + window.scrollY, height: rect.height };
}

export function measureChapters(): ChapterLayout | null {
  const hero = readSpan("#top");
  const about = readSpan("#about");
  const services = readSpan("#services");
  const work = readSpan("#work");
  const products = readSpan("#products");
  const cover = readSpan(".light");
  if (!hero || !about || !services || !work || !products) return null;

  const viewport = window.innerHeight;
  const centre = (span: Span): number => span.top + span.height / 2 - viewport / 2;

  return {
    anchors: [
      { y: centre(hero), form: FORMATION.globe },
      { y: centre(about), form: FORMATION.network },
      { y: centre(services), form: FORMATION.clusters },
      { y: work.top - viewport * WORK_LEAD_VIEWPORTS, form: FORMATION.gallery },
      { y: centre(products), form: FORMATION.ring },
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
