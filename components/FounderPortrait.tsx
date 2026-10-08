"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import founderPortrait from "@/public/images/founder-haider-jalal.png";

export function FounderPortrait() {
  const frame = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: frame,
    offset: ["start end", "end start"],
  });
  const transform = useTransform(
    scrollYProgress,
    [0, 1],
    reduce
      ? ["translate3d(0, 0, 0) scale(1)", "translate3d(0, 0, 0) scale(1)"]
      : ["translate3d(0, 18px, 0) scale(1.015)", "translate3d(0, -18px, 0) scale(1.035)"],
  );

  return (
    <motion.figure
      ref={frame}
      className="founder-portrait"
      initial={{ opacity: 0, transform: reduce ? "translate3d(0, 0, 0)" : "translate3d(0, 30px, 0)" }}
      whileInView={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
    >
      <motion.div className="founder-portrait-media" style={{ transform }}>
        <Image
          src={founderPortrait}
          alt="Haider Jalal, founder of Musme, seated at his studio with the Musme logo illuminated behind him"
          placeholder="blur"
          sizes="(max-width: 820px) calc(100vw - 40px), 1120px"
        />
      </motion.div>
      <figcaption>
        <span>Portrait 01</span>
        <span>Founder · Musme</span>
      </figcaption>
    </motion.figure>
  );
}
