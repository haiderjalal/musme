"use client";

import { motion, useReducedMotion } from "motion/react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale";
  as?: "div" | "li" | "article" | "footer";
  amount?: number;
};

const motionTags = {
  div: motion.div,
  li: motion.li,
  article: motion.article,
  footer: motion.footer,
};

const hiddenTransform = {
  up: "translate3d(0, 32px, 0)",
  left: "translate3d(-38px, 0, 0)",
  right: "translate3d(38px, 0, 0)",
  scale: "scale(0.96)",
};

export function Reveal({ children, className, delay = 0, direction = "up", as = "div", amount = 0.18 }: RevealProps) {
  const reduce = useReducedMotion();
  const Component = motionTags[as] as typeof motion.div;

  return (
    <Component
      className={className}
      initial={{ opacity: 0, transform: reduce ? "translate3d(0, 0, 0)" : hiddenTransform[direction] }}
      whileInView={{ opacity: 1, transform: direction === "scale" ? "scale(1)" : "translate3d(0, 0, 0)" }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.7, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </Component>
  );
}
