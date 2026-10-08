import type { Metadata } from "next";
import { BreadcrumbSchema, ContentPage, LAST_UPDATED, SITE_URL } from "@/components/ContentPage";
import { FounderPortrait } from "@/components/FounderPortrait";

export const metadata: Metadata = {
  title: "About Musme | AI systems for owner-led businesses",
  description: "Meet Musme and founder Haider Jalal. Learn how we build AI automation, content systems, websites, apps, and custom software for healthcare, restaurants, and owner-led businesses.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Musme",
    description: "AI systems designed around real operations, not hype.",
    url: "/about",
    images: [{ url: "/images/founder-haider-jalal.png", width: 1915, height: 821, alt: "Haider Jalal, founder of Musme" }],
  },
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${SITE_URL}/about#webpage`,
      url: `${SITE_URL}/about`,
      name: "About Musme",
      description: "Musme is an AI agency founded by Haider Jalal that builds automation, content systems, websites, apps, and custom software.",
      dateModified: LAST_UPDATED,
      about: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#founder` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Musme",
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/images/musme-logo-mark.png`,
      email: "hello@musme.ai",
      founder: { "@id": `${SITE_URL}/#founder` },
      sameAs: ["https://linkedin.com/in/haiderjalal", "https://instagram.com/haider.jalals"],
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#founder`,
      name: "Haider Jalal",
      jobTitle: "Founder of Musme",
      image: `${SITE_URL}/images/founder-haider-jalal.png`,
      worksFor: { "@id": `${SITE_URL}/#organization` },
      sameAs: ["https://linkedin.com/in/haiderjalal"],
    },
  ],
};

export default function AboutPage() {
  return (
    <ContentPage
      eyebrow="About Musme"
      title="AI should remove the busywork, not the human touch."
      intro="Musme is an AI agency founded by Haider Jalal. We design practical systems that help healthcare teams, restaurants, and owner-led businesses respond faster, operate more clearly, and spend less time on repetitive work."
      schema={schema}
    >
      <BreadcrumbSchema items={[["Home", ""], ["About", "/about"]]} />
      <section>
        <h2>What is Musme?</h2>
        <p>Musme is a strategy, automation, content, and software partner. We study how a business currently works, identify the manual steps that create delays or errors, and build a focused system around the people who will actually use it. That system may combine AI automation, integrations, content production, a website, an app, or custom software.</p>
        <p>Our work is deliberately practical. The goal is not to add AI everywhere. The goal is to give teams back time, make customer journeys smoother, and create infrastructure that can improve as the business grows.</p>
      </section>

      <section className="content-grid">
        <article>
          <p className="content-kicker">Healthcare</p>
          <h2>More time for care.</h2>
          <p>We design patient intake, appointment reminders, follow-ups, documentation, internal routing, and communication workflows that reduce administration while keeping people in control.</p>
        </article>
        <article>
          <p className="content-kicker">Restaurants</p>
          <h2>Better service, front to back.</h2>
          <p>We connect AI menus, reservations, guest messaging, reviews, content, and back-office workflows so the customer experience and the operation support each other.</p>
        </article>
      </section>

      <section className="founder-section" aria-labelledby="founder-heading">
        <FounderPortrait />
        <div className="founder-copy">
          <p className="content-kicker">Founder</p>
          <h2 id="founder-heading">Haider Jalal</h2>
          <p>Musme was founded by Haider Jalal, a builder focused on using automation, design, and software to solve operational problems for growing businesses. Haider leads strategy and product direction, working from the business problem outward rather than starting with a particular tool.</p>
          <p>Connect with Haider on <a href="https://linkedin.com/in/haiderjalal" target="_blank" rel="noreferrer">LinkedIn</a> or email <a href="mailto:hello@musme.ai">hello@musme.ai</a>.</p>
        </div>
      </section>

      <section>
        <h2>How we work</h2>
        <ol className="content-steps">
          <li><strong>Observe.</strong> Map the manual work, delays, risks, and missed opportunities.</li>
          <li><strong>Design.</strong> Shape the smallest useful system around your team and customers.</li>
          <li><strong>Connect.</strong> Build, integrate, test, and launch without disrupting the operation.</li>
          <li><strong>Improve.</strong> Use real feedback and performance to sharpen the system.</li>
        </ol>
      </section>
    </ContentPage>
  );
}
