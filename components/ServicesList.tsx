"use client";

import { CaretRight } from "@phosphor-icons/react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const services = [
  {
    title: "Automation",
    body: "We connect forms, inboxes, calls, records, follow-ups, and reports so routine work moves without being chased.",
    items: ["Lead response", "Patient intake", "Bookings", "Reporting", "Workflow systems", "Custom AI tools"],
  },
  {
    title: "Content",
    body: "Strategy, scripts, video, imagery, and publishing become one managed system instead of five disconnected tasks.",
    items: ["AI video generation", "Image generation", "Content strategy", "Social media"],
  },
  {
    title: "Products",
    body: "We design fast websites, useful apps, AI menus, portals, and custom software with the intelligence built in.",
    items: ["Website development", "App development", "AI restaurant menus", "Portals", "Custom software"],
  },
  {
    title: "Growth",
    body: "Your systems capture what works, surface the next action, and improve the customer journey over time.",
    items: ["CRM", "Retention", "Analytics", "Optimisation"],
  },
];

function ServiceItem({
  service,
  index,
  active,
  onActive,
}: {
  service: (typeof services)[number];
  index: number;
  active: boolean;
  onActive: (index: number) => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });

  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  return (
    <motion.li
      ref={ref}
      className={`service-row${active ? " is-active" : ""}`}
      initial={{ opacity: 0, transform: reduce ? "translate3d(0, 0, 0)" : "translate3d(-34px, 0, 0)" }}
      whileInView={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, delay: index * 0.06, ease: [0.23, 1, 0.32, 1] }}
    >
      <span className="service-num">{String(index + 1).padStart(2, "0")}</span>
      <div>
        <h3>{service.title}</h3>
        <p>{service.body}</p>
        <ul className="service-tags service-tags-inline">
          {service.items.map((item) => (
            <li key={item}><CaretRight size={12} weight="bold" aria-hidden="true" />{item}</li>
          ))}
        </ul>
      </div>
    </motion.li>
  );
}

export function ServicesList() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  return (
    <div className="services-layout">
      <ol className="services-list">
        {services.map((service, index) => (
          <ServiceItem
            key={service.title}
            service={service}
            index={index}
            active={active === index}
            onActive={setActive}
          />
        ))}
      </ol>
      <motion.div
        className="services-panel"
        aria-hidden="true"
        initial={{ opacity: 0, transform: reduce ? "translate3d(0, 0, 0)" : "translate3d(34px, 0, 0)" }}
        whileInView={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
      >
        <motion.ul
          className="service-tags"
          key={active}
          initial={{ opacity: 0, transform: reduce ? "translate3d(0, 0, 0)" : "translate3d(0, 10px, 0)" }}
          animate={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
          transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
        >
          {services[active].items.map((item) => (
            <li key={item}><CaretRight size={13} weight="bold" />{item}</li>
          ))}
        </motion.ul>
      </motion.div>
    </div>
  );
}
