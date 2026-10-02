"use client";

import {
  ArrowUpRight,
  Browser,
  FlowArrow,
  ImagesSquare,
  TrendUp,
} from "@phosphor-icons/react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

const capabilities = [
  {
    icon: FlowArrow,
    title: "Automation that removes the handoffs",
    body: "We connect forms, inboxes, calls, records, follow-ups, and reports so routine work moves without being chased.",
    tags: ["Lead response", "Patient intake", "Bookings", "Reporting"],
  },
  {
    icon: ImagesSquare,
    title: "An AI content engine with taste",
    body: "Strategy, scripts, video, imagery, and publishing become one managed system instead of five disconnected tasks.",
    tags: ["AI video", "Image systems", "Content", "Social media"],
  },
  {
    icon: Browser,
    title: "Digital products people enjoy using",
    body: "We design fast websites, useful apps, AI menus, portals, and custom software with the intelligence built in.",
    tags: ["Websites", "Apps", "AI menus", "Custom software"],
  },
  {
    icon: TrendUp,
    title: "Growth operations that keep learning",
    body: "Your systems capture what works, surface the next action, and improve the customer journey over time.",
    tags: ["CRM", "Retention", "Analytics", "Optimisation"],
  },
];

function CapabilityPanel({
  item,
  index,
}: {
  item: (typeof capabilities)[number];
  index: number;
}) {
  const panel = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: panel,
    offset: ["start end", "end start"],
  });
  const transform = useTransform(
    scrollYProgress,
    [0, 1],
    reduce
      ? ["translate3d(0, 0, 0)", "translate3d(0, 0, 0)"]
      : ["translate3d(0, 48px, 0)", "translate3d(0, -32px, 0)"],
  );
  const Icon = item.icon;

  return (
    <motion.article ref={panel} className={`capability-panel capability-${index}`} style={{ transform }}>
      <div className="capability-icon" aria-hidden="true">
        <Icon size={30} weight="light" />
      </div>
      <div className="capability-copy">
        <h3>{item.title}</h3>
        <p>{item.body}</p>
      </div>
      <div className="capability-tags" aria-label="Examples">
        {item.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <ArrowUpRight className="capability-arrow" size={24} weight="light" aria-hidden="true" />
    </motion.article>
  );
}

export function CapabilityStack() {
  return (
    <div className="capability-stack">
      {capabilities.map((item, index) => (
        <CapabilityPanel item={item} index={index} key={item.title} />
      ))}
    </div>
  );
}
