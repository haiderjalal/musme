"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

type ScrollParallaxProps = {
  children: React.ReactNode;
  className?: string;
  distance?: number;
};

export function ScrollParallax({ children, className, distance = 56 }: ScrollParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const transform = useTransform(
    scrollYProgress,
    [0, 1],
    reduce
      ? ["translate3d(0, 0, 0)", "translate3d(0, 0, 0)"]
      : [`translate3d(0, ${distance}px, 0)`, `translate3d(0, ${-distance}px, 0)`],
  );

  return (
    <motion.div ref={ref} className={className} style={{ transform }}>
      {children}
    </motion.div>
  );
}
