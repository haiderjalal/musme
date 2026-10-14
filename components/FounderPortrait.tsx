"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { getRevealProps } from "@/components/Reveal";
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
    <figure ref={frame} className="founder-portrait" {...getRevealProps({ amount: 0.18 })}>
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
    </figure>
  );
}
