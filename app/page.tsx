import { ArrowDownRight, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { QuoteForm } from "@/components/QuoteForm";
import { Reveal } from "@/components/Reveal";
import { ScrollParallax } from "@/components/ScrollParallax";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ServicesList } from "@/components/ServicesList";
import { SiteNav } from "@/components/SiteNav";

const projects = [
  {
    name: "Pak Tribal Furniture",
    category: "Furniture catalogue",
    body: "A product-led catalogue for solid-wood furniture, custom enquiries, and Pakistani craft.",
    image: "/images/projects/pak-tribal-furniture.png",
    url: "http://paktribalfurniture.com/",
  },
  {
    name: "OptiSource PK",
    category: "B2B optical supply",
    body: "A wholesale catalogue and trade-inquiry system for lenses, frames, lab supplies, and equipment.",
    image: "/images/projects/optisource-pk.png",
    url: "https://www.optisourcepk.com/",
  },
  {
    name: "Divers Optics",
    category: "Retail and discovery",
    body: "A visual retail experience for eyewear and accessories, designed around discovery and WhatsApp conversion.",
    image: "/images/projects/divers-optics.png",
    url: "https://www.diversoptics.com/",
  },
  {
    name: "Bubish Artificer",
    category: "Landscape and interiors",
    body: "An immersive studio site for landscape, irrigation, and interiors with a patient brand narrative.",
    image: "/images/projects/bubish.png",
    url: "https://bubish.vercel.app/",
  },
];

const products = [
  {
    name: "Test Shift",
    category: "AI QA agents",
    body: "Rent an AI QA team by the hour. Four agents test your site across dev, staging, UAT and prod, then hand you the bug report.",
    url: "https://testshift.musme.co/",
  },
  {
    name: "Citable",
    category: "AI search visibility",
    body: "See your site the way AI search does. Scan any page to find which content AI crawlers can actually read, and which only appears after JavaScript.",
    url: "https://citable.musme.co/",
  },
  {
    name: "PDFDesk",
    category: "PDF tools",
    body: "Edit PDFs like a Word document. Change text, add images and signatures, reorder pages, and convert between PDF and Word, free and with no account.",
    url: "https://pdfdesk.musme.co/",
  },
  {
    name: "Dressify",
    category: "Tailoring marketplace",
    body: "Find skilled local tailors and women-led home ateliers, choose a design, share your measurements, and have your outfit collected, stitched, and delivered.",
    url: "https://dressify.musme.co/",
  },
];

const steps = [
  ["Observe", "Map the manual work, delays, and missed opportunities."],
  ["Design", "Shape a focused system around your team and customers."],
  ["Connect", "Build, integrate, test, and launch without operational chaos."],
  ["Improve", "Use real feedback and performance to make the system sharper."],
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="section-label">{children}</p>;
}

function OutlineMarquee({ text }: { text: string }) {
  return (
    <div className="outline-marquee" aria-hidden="true">
      <div className="outline-track">
        {[0, 1, 2, 3].map((i) => <span key={i}>{text}</span>)}
      </div>
    </div>
  );
}

const SITE = "https://www.musme.co";
const LAST_UPDATED = "2026-10-08";

const faqs = [
  [
    "Which industries does Musme work with?",
    "Musme focuses on healthcare and restaurants, and works with owner-led businesses more broadly. In healthcare we design patient intake, reminders, follow-ups, documentation, and internal routing. In restaurants we build AI menus, booking flows, guest messaging, content, reviews, and back-office automations that work together as one experience.",
  ],
  [
    "What can Musme build?",
    "Musme builds AI automation and workflow systems, custom AI tools, AI video and image generation, content and social media systems, websites, apps, AI restaurant menus, portals, and custom software. Each engagement starts with your real operation, then combines the right mix of automation, content, and software.",
  ],
  [
    "How does a Musme project start?",
    "Every engagement starts close to the operation. We map the manual work, delays, and missed opportunities, design a focused system around your team and customers, then build, integrate, test, and launch it. After launch we use real feedback and performance to keep improving it. To begin, email hello@musme.ai.",
  ],
  [
    "Does Musme have its own products?",
    "Yes. Test Shift rents an AI QA team by the hour, with four agents testing your site across dev, staging, UAT, and prod. Citable shows which content AI search crawlers can read. PDFDesk edits PDFs like a Word document and converts between PDF and Word. Dressify connects customers with local tailors and women-led home ateliers for bespoke clothing, from design selection through delivery. All four are listed in the products section.",
  ],
];

const comparison = [
  ["Automation", "Connects forms, inboxes, calls, records, follow-ups, and reports so routine work moves without being chased.", "Lead response, patient intake, bookings, reporting"],
  ["AI content engine", "Turns strategy, scripts, video, imagery, and publishing into one managed system.", "AI video, image systems, content, social media"],
  ["Digital products", "Fast websites, apps, AI menus, portals, and custom software with intelligence built in.", "Websites, apps, AI menus, custom software"],
  ["Growth operations", "Captures what works, surfaces the next action, and improves the customer journey over time.", "CRM, retention, analytics, optimisation"],
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: "Musme",
      url: `${SITE}/`,
      logo: `${SITE}/images/musme-logo-mark.png`,
      email: "hello@musme.ai",
      description:
        "Musme builds AI systems, content, and digital products for owner-led businesses, especially in healthcare and restaurants.",
      sameAs: ["https://linkedin.com/in/haiderjalal", "https://instagram.com/haider.jalals"],
      founder: { "@id": `${SITE}/#founder` },
    },
    {
      "@type": "Person",
      "@id": `${SITE}/#founder`,
      name: "Haider Jalal",
      jobTitle: "Founder",
      worksFor: { "@id": `${SITE}/#organization` },
      sameAs: ["https://linkedin.com/in/haiderjalal"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: `${SITE}/`,
      name: "Musme",
      publisher: { "@id": `${SITE}/#organization` },
    },
    {
      "@type": "WebPage",
      "@id": `${SITE}/#webpage`,
      url: `${SITE}/`,
      name: "Musme | AI systems for ambitious businesses",
      isPartOf: { "@id": `${SITE}/#website` },
      about: { "@id": `${SITE}/#organization` },
      author: { "@id": `${SITE}/#founder` },
      publisher: { "@id": `${SITE}/#organization` },
      dateModified: LAST_UPDATED,
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE}/#faq`,
      mainEntity: faqs.map(([q, a]) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ],
};

export default function Home() {
  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <a className="skip-link" href="#work">Skip to selected work</a>
      <ScrollProgress />
      <SiteNav />

      <section className="hero" id="top">
        <Reveal className="hero-copy" direction="left" amount={0.08}>
          <p className="hello"><span aria-hidden="true" />Hi there!</p>
          <h1>
            Less busywork.
            <br />
            More <span className="accent">business.</span>
          </h1>
          <p className="hero-sub">
            We build AI systems, content, and digital products that do the repetitive work for you.
          </p>
        </Reveal>
        <a className="circle-link hero-circle" href="#work" aria-label="See selected work">
          <ArrowDownRight size={30} weight="light" aria-hidden="true" />
        </a>
        <ScrollParallax className="hero-media" distance={42}>
          <Image
            src="/images/musme-sectors-brand.png"
            alt="A modern healthcare clinic and restaurant connected by a flowing system"
            fill
            priority
            sizes="(max-width: 780px) 100vw, 72vw"
          />
        </ScrollParallax>
      </section>

      <section className="formula section" id="about">
        <div className="shell-indent">
          <Reveal direction="left"><SectionLabel>Our formula</SectionLabel></Reveal>
          <Reveal delay={0.08}>
            <p className="statement">
              We automate <em>the work</em>, not the relationship. Every engagement starts <em>close to the operation</em>: we find the friction, <em>design the right system</em>, and improve it with <em>real use</em>.
            </p>
            <a className="arrow-link" href="#quote">
              Start a project
              <span className="arrow-ring"><ArrowRight size={20} weight="light" aria-hidden="true" /></span>
            </a>
          </Reveal>
        </div>
      </section>

      <section className="services section" id="services">
        <div className="shell-indent">
          <Reveal direction="left"><h2 className="section-label">What we do</h2></Reveal>
        </div>
        <ServicesList />
      </section>

      <section className="work section" id="work">
        <div className="shell-indent">
          <Reveal direction="left"><h2 className="section-label">Selected work</h2></Reveal>
        </div>
        <Reveal className="work-head" direction="scale" amount={0.08}>
          <OutlineMarquee text="selected work ·" />
          <a className="circle-link work-circle" href="#quote" aria-label="Start a project">
            <ArrowDownRight size={34} weight="light" aria-hidden="true" />
          </a>
        </Reveal>
        <div className="section-shell">
          <div className="work-grid">
            {projects.map((project, index) => (
              <Reveal
                className="work-card"
                key={project.name}
                delay={(index % 2) * 0.08}
                direction={index % 2 === 0 ? "left" : "right"}
                amount={0.12}
              >
                <a href={project.url} target="_blank" rel="noreferrer">
                  <div className="work-image">
                    <Image src={project.image} alt={`Homepage of ${project.name}`} fill sizes="(max-width: 780px) 94vw, 46vw" />
                  </div>
                  <p className="work-category">{project.category}</p>
                  <h3>{project.name}</h3>
                  <p className="work-body">{project.body}</p>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="products section" id="products">
        <div className="shell-indent">
          <Reveal direction="left"><SectionLabel>Our products</SectionLabel></Reveal>
          <Reveal delay={0.06}><h2 className="products-title">Software we build and run ourselves.</h2></Reveal>
          <ul className="product-list">
            {products.map((product, index) => (
              <Reveal as="li" key={product.name} direction="left" delay={index * 0.07} amount={0.3}>
                <a href={product.url} target="_blank" rel="noreferrer">
                  <span className="product-name">
                    {product.name}
                    <span className="product-slash" aria-hidden="true" />
                  </span>
                  <span className="product-meta">
                    <span className="work-category">{product.category}</span>
                    {product.body}
                  </span>
                </a>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <div className="light">
        <section className="industries section" id="industries">
          <div className="shell-indent industries-grid">
            <Reveal direction="left">
              <SectionLabel>Who we build for</SectionLabel>
              <h2>Built for businesses where every minute matters.</h2>
              <p className="lead-dark">
                Musme starts with the real operation, then chooses the right mix of automation, content, and software.
              </p>
              <a className="arrow-link" href="#quote">
                Tell us about yours
                <span className="arrow-ring"><ArrowRight size={20} weight="light" aria-hidden="true" /></span>
              </a>
            </Reveal>
            <div className="industry-notes">
              <Reveal as="article" direction="right" delay={0.08}>
                <h3>Healthcare</h3>
                <p>More time for care. Patient intake, reminders, follow-ups, documentation, and internal routing designed to reduce admin without losing the human touch.</p>
              </Reveal>
              <Reveal as="article" direction="right" delay={0.16}>
                <h3>Restaurants</h3>
                <p>Service that starts before the table. AI menus, booking flows, guest messaging, content, reviews, and back-office automations working as one experience.</p>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="process section" id="process">
          <div className="shell-indent">
            <Reveal direction="left"><SectionLabel>Process</SectionLabel></Reveal>
            <Reveal delay={0.06}><h2>How does a Musme project work?</h2></Reveal>
            <ol className="process-rows">
              {steps.map(([title, body], index) => (
                <Reveal as="li" key={title} direction="left" delay={index * 0.06} amount={0.45}>
                  <span className="process-num">{String(index + 1).padStart(2, "0")}</span>
                  <strong>{title}</strong>
                  <span>{body}</span>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section className="answers section" id="faq">
          <div className="shell-indent answers-shell">
            <Reveal direction="left">
              <SectionLabel>Answers</SectionLabel>
              <h2>What does Musme do?</h2>
              <p className="lead-dark">
                Musme builds AI systems, content, and digital products for owner-led businesses, especially in healthcare and restaurants. We automate repetitive work such as lead response, patient intake, bookings, and reporting, produce AI video and imagery, and design websites, apps, and AI menus, so your team spends less time on busywork and more on customers.
              </p>
            </Reveal>

            <Reveal delay={0.06}>
              <h2>Which Musme service solves which problem?</h2>
              <div className="answer-table-wrap">
                <table className="answer-table">
                <thead>
                  <tr><th>Service</th><th>What it does</th><th>Typical use</th></tr>
                </thead>
                <tbody>
                  {comparison.map(([service, what, use]) => (
                    <tr key={service}><th scope="row">{service}</th><td>{what}</td><td>{use}</td></tr>
                  ))}
                </tbody>
                </table>
              </div>
            </Reveal>

            <Reveal delay={0.06}>
              <h2>Frequently asked questions</h2>
              <div className="faq-list">
                {faqs.map(([q, a]) => (
                  <div key={q}>
                    <h3>{q}</h3>
                    <p>{a}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <OutlineMarquee text="enough of the busywork ·" />

        <section className="contact" id="quote">
          <Reveal className="contact-flank" direction="scale" amount={0.5}>
            <span>Let&apos;s build</span>
            <i />
            <Image src="/images/musme-logo-mark.png" alt="" width={56} height={41} />
            <i />
            <span>together!</span>
          </Reveal>
          <Reveal className="contact-card" direction="scale" amount={0.08}>
            <div className="quote-layout">
              <Reveal className="quote-intro">
                <SectionLabel>Request a quote</SectionLabel>
                <h2>Let&apos;s find the leverage.</h2>
                <p>Answer four quick questions. We will turn the messy part of your operation into a clear first move.</p>
                <a className="drop-line" href="mailto:hello@musme.ai">or drop us a line</a>
              </Reveal>
              <QuoteForm />
            </div>
          </Reveal>
        </section>

        <Reveal as="footer" className="site-footer" amount={0.35}>
          <a className="brand" href="#top" aria-label="Musme home">
            <Image className="brand-mark" src="/images/musme-logo-mark.png" alt="" width={40} height={29} />
            <span className="brand-name">musme</span>
          </a>
          <nav className="footer-links" aria-label="Social">
            <a href="/about">About</a>
            <a href="/services/ai-automation">Services</a>
            <a href="/case-studies">Work</a>
            <a href="/contact">Contact</a>
            <a href="https://linkedin.com/in/haiderjalal" target="_blank" rel="noreferrer">LinkedIn</a>
          </nav>
          <p>
            Written by Haider Jalal, Founder. Last updated{" "}
            <time dateTime={LAST_UPDATED}>8 October 2026</time>. ©2026 Musme.
          </p>
        </Reveal>
      </div>
    </main>
  );
}
