import type { Metadata } from "next";
import { BreadcrumbSchema, ContentPage, LAST_UPDATED, SITE_URL } from "@/components/ContentPage";
import { QuoteForm } from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Contact Musme | Request an AI or Software Project Quote",
  description: "Contact Musme about AI automation, AI content, websites, apps, AI restaurant menus, or custom software. Email hello@musme.ai or send a project brief.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact Musme", description: "Tell us where the work gets stuck and receive a focused first recommendation.", url: "/contact" },
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      "@id": `${SITE_URL}/contact#webpage`,
      url: `${SITE_URL}/contact`,
      name: "Contact Musme",
      dateModified: LAST_UPDATED,
      about: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Musme",
      url: `${SITE_URL}/`,
      email: "hello@musme.ai",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales and project enquiries",
        email: "hello@musme.ai",
        availableLanguage: "English",
      },
    },
  ],
};

export default function ContactPage() {
  return (
    <ContentPage
      eyebrow="Contact Musme"
      title="Start with the problem, not the technology."
      intro="Tell us about the repetitive work, customer journey, content challenge, or product idea you want to improve. Haider will review your brief and reply personally."
      schema={schema}
      showCta={false}
    >
      <BreadcrumbSchema items={[["Home", ""], ["Contact", "/contact"]]} />
      <section className="contact-details">
        <div>
          <p className="content-kicker">Email</p>
          <h2><a href="mailto:hello@musme.ai">hello@musme.ai</a></h2>
          <p>Best for project enquiries, partnerships, and questions about Musme services. Include your company, the problem, and your preferred timeline.</p>
        </div>
        <div>
          <p className="content-kicker">Founder</p>
          <h2>Haider Jalal</h2>
          <p>Connect on <a href="https://linkedin.com/in/haiderjalal" target="_blank" rel="noreferrer">LinkedIn</a>. Project briefs sent through this page are delivered directly to Haider.</p>
        </div>
      </section>

      <section>
        <h2>Request a project quote</h2>
        <p>Answer four short questions about the scope, your team, investment range, and desired outcome. If the form is unavailable, email the same details to <a href="mailto:hello@musme.ai">hello@musme.ai</a>.</p>
        <div className="content-form-card"><QuoteForm /></div>
      </section>

      <section>
        <h2>What happens next?</h2>
        <ol className="content-steps">
          <li><strong>Review.</strong> Haider reads the brief and checks whether Musme is a useful fit.</li>
          <li><strong>Conversation.</strong> We clarify the workflow, audience, constraints, and outcome.</li>
          <li><strong>Recommendation.</strong> You receive a focused first scope, not a bundle of unnecessary features.</li>
        </ol>
      </section>
    </ContentPage>
  );
}
