"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { startMagneticLean } from "@/lib/magnetic";
import { startRevealObserver } from "@/lib/reveal";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Page-wide motion controller. Renders nothing: it marks hydration as complete and wires the shared
 * observers once per route, so individual components never need their own client-side motion logic.
 */
export function PageEffects() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add("ready");
    const stopReveals = startRevealObserver();
    const stopMagnetic = startMagneticLean();

    return () => {
      stopReveals();
      stopMagnetic();
    };
  }, [pathname]);

  useEffect(() => {
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    const syncReducedMotion = (): void => {
      document.documentElement.classList.toggle("rm", query.matches);
    };

    syncReducedMotion();
    query.addEventListener("change", syncReducedMotion);
    return () => query.removeEventListener("change", syncReducedMotion);
  }, []);

  return null;
}
