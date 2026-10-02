"use client";

import { ArrowUpRight } from "@phosphor-icons/react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

const projects = [
  {
    name: "Pak Tribal Furniture",
    category: "Furniture catalogue",
    title: "Craft, framed for the screen.",
    body: "A product-led catalogue for solid-wood furniture, custom enquiries, and Pakistani craft.",
    image: "/images/projects/pak-tribal-furniture.png",
    url: "http://paktribalfurniture.com/",
    tone: "earth",
  },
  {
    name: "OptiSource PK",
    category: "B2B optical supply",
    title: "Complex stock, made easy to request.",
    body: "A wholesale catalogue and trade-inquiry system for lenses, frames, lab supplies, and equipment.",
    image: "/images/projects/optisource-pk.png",
    url: "https://www.optisourcepk.com/",
    tone: "blue",
  },
  {
    name: "Divers Optics",
    category: "Retail and discovery",
    title: "An editorial storefront with personality.",
    body: "A visual retail experience for eyewear and accessories, designed around discovery and WhatsApp conversion.",
    image: "/images/projects/divers-optics.png",
    url: "https://www.diversoptics.com/",
    tone: "ink",
  },
  {
    name: "Bubish Artificer",
    category: "Landscape and interiors",
    title: "Thirty years of work, told cinematically.",
    body: "An immersive studio site for landscape, irrigation, and interiors with a patient brand narrative.",
    image: "/images/projects/bubish.png",
    url: "https://bubish.vercel.app/",
    tone: "green",
  },
];

export function ProjectsShowcase() {
  const scrollArea = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: scrollArea,
    offset: ["start start", "end end"],
  });
  const trackTransform = useTransform(
    scrollYProgress,
    [0, 1],
    reduce
      ? ["translate3d(0%, 0, 0)", "translate3d(0%, 0, 0)"]
      : ["translate3d(0%, 0, 0)", "translate3d(-75%, 0, 0)"],
  );
  const progressTransform = useTransform(scrollYProgress, [0, 1], ["scaleX(0)", "scaleX(1)"]);

  return (
    <section className={`projects section${reduce ? " projects-reduced" : ""}`} id="projects">
      <div className="section-shell projects-intro">
        <p className="eyebrow">Selected work</p>
        <h2>Digital work made to move real businesses.</h2>
        <p>
          Four distinct brands, each shaped around the way its customers browse, decide, and get in touch.
        </p>
      </div>

      <div className="projects-scroll" ref={scrollArea}>
        <div className="projects-sticky">
          <motion.div className="projects-track" style={{ transform: trackTransform }}>
            {projects.map((project, index) => (
              <article className={`project-slide project-${project.tone}`} key={project.name}>
                <div className="project-frame">
                  <Image
                    src={project.image}
                    alt={`Homepage of ${project.name}`}
                    fill
                    sizes="(max-width: 780px) 94vw, 76vw"
                    className="project-image"
                  />
                  <span className="project-index" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="project-copy">
                  <div>
                    <p className="project-category">{project.category}</p>
                    <h3>{project.title}</h3>
                  </div>
                  <div className="project-detail">
                    <p>{project.body}</p>
                    <a href={project.url} target="_blank" rel="noreferrer">
                      Visit {project.name} <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </motion.div>

          <div className="projects-progress" aria-hidden="true">
            <motion.span style={{ transform: progressTransform }} />
          </div>
        </div>
      </div>
    </section>
  );
}
