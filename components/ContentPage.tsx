import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";

export const SITE_URL = "https://www.musme.co";
export const LAST_UPDATED = "2026-10-08";

const primaryLinks = [
  ["About", "/about"],
  ["AI automation", "/services/ai-automation"],
  ["Web & software", "/services/web-development"],
  ["AI content", "/services/ai-content"],
  ["Case studies", "/case-studies"],
  ["Contact", "/contact"],
];

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function ContentPage({
  eyebrow,
  title,
  intro,
  children,
  schema,
  showCta = true,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
  schema: object;
  showCta?: boolean;
}) {
  return (
    <main className="content-page" id="main-content">
      <JsonLd data={schema} />
      <a className="skip-link" href="#content">Skip to content</a>

      <nav className="content-nav" aria-label="Primary navigation">
        <Link className="brand" href="/" aria-label="Musme home">
          <Image className="brand-mark" src="/images/musme-logo-mark.png" alt="" width={40} height={29} priority />
          <span className="brand-name">musme</span>
        </Link>
        <div className="content-nav-links">
          <Link href="/about">About</Link>
          <Link href="/services/ai-automation">Services</Link>
          <Link href="/case-studies">Work</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </nav>

      <header className="content-hero">
        <p className="section-label">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </header>

      <div className="content-body" id="content">
        {children}
      </div>

      {showCta && (
        <aside className="content-cta" aria-labelledby="content-cta-title">
          <p className="section-label">Start a project</p>
          <h2 id="content-cta-title">Tell us where the work gets stuck.</h2>
          <p>We will map the friction and recommend a focused first move—automation, content, software, or a combination.</p>
          <Link className="content-button" href="/contact">
            Request a quote <ArrowRight size={20} weight="light" aria-hidden="true" />
          </Link>
        </aside>
      )}

      <footer className="content-footer">
        <Link className="brand" href="/" aria-label="Musme home">
          <Image className="brand-mark" src="/images/musme-logo-mark.png" alt="" width={40} height={29} />
          <span className="brand-name">musme</span>
        </Link>
        <nav aria-label="Footer navigation">
          {primaryLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <p>Haider Jalal, Founder · <a href="mailto:hello@musme.ai">hello@musme.ai</a> · Updated 8 October 2026</p>
      </footer>
    </main>
  );
}

export function BreadcrumbSchema({ items }: { items: Array<[string, string]> }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map(([name, path], index) => ({
          "@type": "ListItem",
          position: index + 1,
          name,
          item: `${SITE_URL}${path}`,
        })),
      }}
    />
  );
}
