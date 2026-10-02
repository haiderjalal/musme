"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const transform = useTransform(scrollYProgress, [0, 1], ["scaleX(0)", "scaleX(1)"]);

  if (reduce) return null;

  return <motion.div className="page-progress" style={{ transform }} aria-hidden="true" />;
}
