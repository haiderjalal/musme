import type { Metadata } from "next";
import Image from "next/image";
import { BreadcrumbSchema, ContentPage, LAST_UPDATED, SITE_URL } from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "Website & Digital Product Case Studies | Musme",
  description: "Selected Musme projects across furniture, optical supply, eyewear retail, landscaping, AI quality assurance, AI visibility, PDF tools, and bespoke tailoring.",
  alternates: { canonical: "/case-studies" },
  openGraph: { title: "Selected Musme Work", description: "Websites and digital products designed around real business journeys.", url: "/case-studies" },
};

const projects = [
  {
    name: "Pak Tribal Furniture",
    sector: "Furniture catalogue",
    summary: "A product-led catalogue for solid-wood furniture, Pakistani craft, and custom enquiries.",
    focus: "Clear product discovery, craft storytelling, responsive browsing, and direct enquiry paths.",
    image: "/images/projects/pak-tribal-furniture.png",
    url: "http://paktribalfurniture.com/",
  },
  {
    name: "OptiSource PK",
    sector: "B2B optical supply",
    summary: "A wholesale catalogue and trade-enquiry experience for lenses, frames, lab supplies, and equipment.",
    focus: "Organising a broad technical range and helping professional buyers reach the right enquiry path.",
    image: "/images/projects/optisource-pk.png",
    url: "https://www.optisourcepk.com/",
  },
  {
    name: "Divers Optics",
    sector: "Eyewear retail",
    summary: "A visual retail website for eyewear and accessories, designed around discovery and WhatsApp conversion.",
    focus: "Editorial product presentation, mobile browsing, brand confidence, and low-friction customer contact.",
    image: "/images/projects/divers-optics.png",
    url: "https://www.diversoptics.com/",
  },
  {
    name: "Bubish Artificer",
    sector: "Landscape and interiors",
    summary: "An immersive studio site for landscape, irrigation, and interiors with a patient brand narrative.",
    focus: "Service clarity, atmospheric visual storytelling, project credibility, and enquiry generation.",
    image: "/images/projects/bubish.png",
    url: "https://bubish.vercel.app/",
  },
];

const products = [
  ["Test Shift", "AI quality assurance", "Four AI agents test websites across development, staging, UAT, and production, then produce a structured bug report.", "https://testshift.musme.co/"],
  ["Citable", "AI search visibility", "A page scanner that shows which content AI search crawlers can read and which content only appears after JavaScript.", "https://citable.musme.co/"],
  ["PDFDesk", "PDF productivity", "A browser-based editor for changing PDF text, adding images and signatures, reordering pages, and converting PDF and Word files.", "https://pdfdesk.musme.co/"],
  ["Dressify", "Tailoring marketplace", "A platform for finding local tailors and women-led home ateliers, selecting designs, sharing measurements, and arranging delivery.", "https://dressify.musme.co/"],
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/case-studies#webpage`,
      url: `${SITE_URL}/case-studies`,
      name: "Website & Digital Product Case Studies | Musme",
      description: "Selected websites and digital products designed and developed by Musme.",
      dateModified: LAST_UPDATED,
      author: { "@id": `${SITE_URL}/#founder` },
    },
    {
      "@type": "ItemList",
      name: "Selected Musme projects",
      itemListElement: [...projects, ...products.map(([name, sector, summary, url]) => ({ name, sector, summary, url }))].map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: project.name,
        url: project.url,
      })),
    },
  ],
};

export default function CaseStudiesPage() {
  return (
    <ContentPage
      eyebrow="Case studies"
      title="Digital work shaped around real customer journeys."
      intro="These selected websites and Musme products show how we combine strategy, design, engineering, automation, and AI. We describe the scope and project focus without inventing performance claims that have not been independently measured."
      schema={schema}
    >
      <BreadcrumbSchema items={[["Home", ""], ["Case studies", "/case-studies"]]} />
      <section>
        <h2>Selected client websites</h2>
        <div className="case-grid">
          {projects.map((project) => (
            <article className="case-card" key={project.name}>
              <a href={project.url} target="_blank" rel="noreferrer" aria-label={`Visit ${project.name}`}>
                <div className="case-image"><Image src={project.image} alt={`${project.name} website homepage`} fill sizes="(max-width: 760px) 100vw, 50vw" /></div>
                <p className="content-kicker">{project.sector}</p>
                <h3>{project.name}</h3>
              </a>
              <p>{project.summary}</p>
              <p><strong>Project focus:</strong> {project.focus}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Products built and operated by Musme</h2>
        <div className="product-case-list">
          {products.map(([name, sector, summary, url]) => (
            <article key={name}>
              <div><p className="content-kicker">{sector}</p><h3><a href={url} target="_blank" rel="noreferrer">{name}</a></h3></div>
              <p>{summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Need a similar system?</h2>
        <p>Read about <a href="/services/ai-automation">AI automation</a>, <a href="/services/web-development">website and software development</a>, or <a href="/services/ai-content">AI content production</a>, then tell us about the operation you want to improve.</p>
      </section>
    </ContentPage>
  );
}
