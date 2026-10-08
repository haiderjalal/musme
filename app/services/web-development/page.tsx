import type { Metadata } from "next";
import { BreadcrumbSchema, ContentPage, LAST_UPDATED, SITE_URL } from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "Website, App & Custom Software Development | Musme",
  description: "Musme designs and develops fast websites, web apps, AI menus, portals, and custom software for healthcare, restaurants, and growing businesses.",
  alternates: { canonical: "/services/web-development" },
  openGraph: { title: "Web and Software Development | Musme", description: "Websites and software with intelligence built into the workflow.", url: "/services/web-development" },
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": `${SITE_URL}/services/web-development#service`,
      name: "Website, app, and custom software development",
      serviceType: "Web development and custom software development",
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed: "Worldwide",
      description: "Strategy, UX design, development, integrations, deployment, and improvement for websites, apps, portals, AI menus, and custom software.",
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/services/web-development#webpage`,
      url: `${SITE_URL}/services/web-development`,
      name: "Website, App & Custom Software Development | Musme",
      dateModified: LAST_UPDATED,
      about: { "@id": `${SITE_URL}/services/web-development#service` },
    },
  ],
};

export default function WebDevelopmentPage() {
  return (
    <ContentPage
      eyebrow="Websites, apps & software"
      title="Digital products built around the job they need to do."
      intro="Musme designs and develops fast, accessible websites and custom software that connect customer experience with the operation behind it."
      schema={schema}
    >
      <BreadcrumbSchema items={[["Home", ""], ["Web development", "/services/web-development"]]} />
      <section>
        <h2>What does Musme develop?</h2>
        <p>Musme builds marketing websites, web applications, customer and staff portals, AI restaurant menus, internal tools, and custom software. Each project combines clear information architecture, responsive interface design, maintainable engineering, analytics, and the integrations needed to make the product useful after launch.</p>
      </section>

      <section className="content-grid content-grid-three">
        <article><p className="content-kicker">Websites</p><h2>Clear, fast, credible.</h2><p>Conversion-focused websites with semantic HTML, search-ready content, responsive design, accessible interactions, analytics, and clean technical foundations.</p></article>
        <article><p className="content-kicker">Applications</p><h2>Useful from day one.</h2><p>Focused web apps and portals for customers, teams, bookings, intake, records, reporting, and AI-assisted workflows.</p></article>
        <article><p className="content-kicker">Custom systems</p><h2>Built for your operation.</h2><p>Software for processes that do not fit an off-the-shelf tool, with APIs, permissions, automation, and clear ownership of data.</p></article>
      </section>

      <section>
        <h2>AI menus for restaurants</h2>
        <p>An AI menu can do more than display dishes. Musme can build searchable, multilingual menus with dietary and allergen guidance, live availability, recommendations, upsell logic, table ordering, reservation links, and analytics. The experience is designed to help guests decide while making updates easier for restaurant teams.</p>
      </section>

      <section>
        <h2>What is included?</h2>
        <ul className="content-columns">
          <li>Product and content strategy</li>
          <li>User journeys and information architecture</li>
          <li>Interface and responsive design</li>
          <li>Frontend and backend development</li>
          <li>CMS, API, CRM, and payment integrations</li>
          <li>Performance, accessibility, and technical SEO</li>
          <li>Testing, deployment, and documentation</li>
          <li>Post-launch measurement and improvement</li>
        </ul>
      </section>

      <section>
        <h2>See the work</h2>
        <p>Review selected website projects and products on the <a href="/case-studies">Musme case studies page</a>, including Pak Tribal Furniture, OptiSource PK, Divers Optics, and Bubish Artificer.</p>
      </section>
    </ContentPage>
  );
}
