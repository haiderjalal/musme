import {
  ArrowDown,
  ArrowUpRight,
  Check,
  CirclesThreePlus,
  DeviceMobile,
  ForkKnife,
  Heartbeat,
  Images,
  Lightning,
  Megaphone,
  Monitor,
  Robot,
  VideoCamera,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { CapabilityStack } from "@/components/CapabilityStack";
import { HeroScene } from "@/components/HeroScene";
import { ProjectsShowcase } from "@/components/ProjectsShowcase";
import { QuoteForm } from "@/components/QuoteForm";
import { Reveal } from "@/components/Reveal";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SectorStory } from "@/components/SectorStory";

const serviceGroups = [
  {
    title: "Intelligence",
    items: [
      [Robot, "AI automation"],
      [Lightning, "Workflow systems"],
      [CirclesThreePlus, "Custom AI tools"],
    ],
  },
  {
    title: "Content",
    items: [
      [VideoCamera, "AI video generation"],
      [Images, "Image generation"],
      [Megaphone, "Content and social"],
    ],
  },
  {
    title: "Products",
    items: [
      [Monitor, "Website development"],
      [DeviceMobile, "App development"],
      [ForkKnife, "AI restaurant menus"],
    ],
  },
];

const products = [
  {
    name: "Test Shift",
    category: "AI QA agents",
    body: "Rent an AI QA team by the hour. Four agents test your site across dev, staging, UAT and prod, then hand you the bug report.",
    image: "/images/projects/testshift.png",
    url: "https://testshift.musme.co/",
  },
  {
    name: "Citable",
    category: "AI search visibility",
    body: "See your site the way AI search does. Scan any page to find which content AI crawlers can actually read, and which only appears after JavaScript.",
    image: "/images/projects/citable.png",
    url: "https://aeogeo.musme.co/",
  },
];

export default function Home() {
  return (
    <main id="main-content">
      <a className="skip-link" href="#projects">Skip to selected work</a>
      <ScrollProgress />
      <nav className="site-nav" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Musme home">
          <Image
            className="brand-mark"
            src="/images/musme-logo-mark.png"
            alt=""
            width={44}
            height={32}
            priority
          />
          <span className="brand-name">musme<span aria-hidden="true">.</span></span>
        </a>
        <div className="nav-links">
          <a href="#projects">Projects</a>
          <a href="#products">Products</a>
          <a href="#capabilities">Capabilities</a>
          <a href="#industries">Industries</a>
          <a href="#approach">Approach</a>
        </div>
        <a className="nav-cta" href="#quote">
          Start a project <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
        </a>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">AI systems for ambitious businesses</p>
          <h1>
            Less busywork.
            <br />
            More <em>business.</em>
          </h1>
          <p className="hero-sub">
            We build AI systems, content, and digital products that do the repetitive work for you.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#quote">
              Start a project <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
            </a>
            <a className="button button-secondary" href="#projects">
              View selected work <ArrowDown size={17} weight="bold" aria-hidden="true" />
            </a>
          </div>
        </div>
        <HeroScene />
      </section>

      <section className="friction section" aria-label="Common operational friction">
        <Reveal className="friction-heading">
          <Heartbeat size={28} weight="light" aria-hidden="true" />
          <h2>Your team is doing work software should handle.</h2>
        </Reveal>
        <div className="marquee" aria-label="Examples of work that can be automated">
          <div className="marquee-track">
            {[...Array(2)].flatMap((_, loop) =>
              ["Lead response", "Patient intake", "Bookings", "Follow-ups", "Content production", "Menu updates", "Reporting", "Review management"].map((item) => (
                <span key={`${loop}-${item}`}>{item}</span>
              )),
            )}
          </div>
        </div>
      </section>

      <ProjectsShowcase />

      <section className="products section" id="products">
        <div className="section-shell">
          <Reveal className="section-intro">
            <p className="eyebrow">Our products</p>
            <h2>Software we build and run ourselves.</h2>
          </Reveal>
          {products.map((product) => (
            <Reveal key={product.name}>
              <a className="product-card" href={product.url} target="_blank" rel="noreferrer">
                <div className="product-image">
                  <Image
                    src={product.image}
                    alt={`Homepage of ${product.name}`}
                    fill
                    sizes="(max-width: 780px) 94vw, 60vw"
                  />
                </div>
                <div className="product-copy">
                  <p className="project-category">{product.category}</p>
                  <h3>{product.name}</h3>
                  <p>{product.body}</p>
                  <span className="text-link">
                    Try {product.name} <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="capabilities section" id="capabilities">
        <div className="section-shell">
          <Reveal className="section-intro capabilities-intro">
            <h2>One partner. The whole intelligent layer.</h2>
            <p>
              Strategy, systems, and execution stay connected, so every part of the business compounds the next.
            </p>
          </Reveal>
          <CapabilityStack />
        </div>
      </section>

      <SectorStory />

      <section className="approach section" id="approach">
        <div className="section-shell approach-grid">
          <Reveal className="approach-copy">
            <h2>We automate the work, not the relationship.</h2>
            <p>
              Every engagement starts close to the operation. We find the friction, design the right system, and improve it with real use.
            </p>
            <a className="text-link" href="#quote">
              Start a project <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
            </a>
          </Reveal>

          <div className="process-list">
            {[
              ["Observe", "Map the manual work, delays, and missed opportunities."],
              ["Design", "Shape a focused system around your team and customers."],
              ["Connect", "Build, integrate, test, and launch without operational chaos."],
              ["Improve", "Use real feedback and performance to make the system sharper."],
            ].map(([title, body], index) => (
              <Reveal className="process-item" delay={index * 0.07} key={title}>
                <div className="process-check"><Check size={16} weight="bold" aria-hidden="true" /></div>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="service-index section" aria-labelledby="service-index-title">
        <div className="section-shell">
          <Reveal className="service-index-heading">
            <h2 id="service-index-title">What Musme can build.</h2>
          </Reveal>
          <div className="service-groups">
            {serviceGroups.map((group) => (
              <div className="service-group" key={group.title}>
                <h3>{group.title}</h3>
                {group.items.map(([Icon, label]) => (
                  <div className="service-item" key={label as string}>
                    <Icon size={22} weight="light" aria-hidden="true" />
                    <span>{label as string}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="quote-section section" id="quote">
        <div className="quote-ambient" aria-hidden="true"><span /><span /><span /></div>
        <div className="section-shell quote-layout">
          <Reveal className="quote-intro">
            <p className="eyebrow">Request a quote</p>
            <h2>Let&apos;s find the leverage.</h2>
            <p>Answer four quick questions. We will turn the messy part of your operation into a clear first move.</p>
            <div className="quote-promise">
              <span>01</span>
              <p>No generic proposal. A considered response within one business day.</p>
            </div>
          </Reveal>
          <QuoteForm />
        </div>
      </section>

      <footer className="site-footer">
        <a className="brand" href="#top" aria-label="Musme home">
          <Image
            className="brand-mark"
            src="/images/musme-logo-mark.png"
            alt=""
            width={52}
            height={38}
          />
          <span className="brand-name">musme<span aria-hidden="true">.</span></span>
        </a>
        <p>AI systems, content, and digital products.</p>
        <a href="mailto:hello@musme.ai">hello@musme.ai</a>
      </footer>
    </main>
  );
}
