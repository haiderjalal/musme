"use client";

import { ArrowUpRight } from "@phosphor-icons/react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

export function SectorStory() {
  const section = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: section, offset: ["start end", "end start"] });
  const imageTransform = useTransform(
    scrollYProgress,
    [0, 1],
    reduce
      ? ["translate3d(0, 0, 0)", "translate3d(0, 0, 0)"]
      : ["translate3d(0, -28px, 0)", "translate3d(0, 28px, 0)"],
  );

  return (
    <section className="sectors section" id="industries" ref={section}>
      <div className="section-shell">
        <div className="section-intro">
          <h2>Built for businesses where every minute matters.</h2>
          <p>
            Musme starts with the real operation, then chooses the right mix of automation, content, and software.
          </p>
        </div>

        <div className="sector-layout">
          <motion.div className="sector-image" style={{ transform: imageTransform }}>
            <Image
              src="/images/musme-sectors-brand.png"
              alt="A modern healthcare clinic and restaurant connected by a flowing system"
              fill
              sizes="(max-width: 768px) 100vw, 58vw"
              priority={false}
            />
          </motion.div>

          <div className="sector-notes">
            <article className="sector-note">
              <span>Healthcare</span>
              <h3>More time for care.</h3>
              <p>
                Patient intake, reminders, follow-ups, documentation, and internal routing designed to reduce admin without losing the human touch.
              </p>
              <ArrowUpRight size={22} weight="light" aria-hidden="true" />
            </article>
            <article className="sector-note">
              <span>Restaurants</span>
              <h3>Service that starts before the table.</h3>
              <p>
                AI menus, booking flows, guest messaging, content, reviews, and back-office automations working as one experience.
              </p>
              <ArrowUpRight size={22} weight="light" aria-hidden="true" />
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
