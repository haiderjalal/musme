import type { Metadata } from "next";
import { BreadcrumbSchema, ContentPage, LAST_UPDATED, SITE_URL } from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "AI Automation Services | Musme",
  description: "AI automation for healthcare, restaurants, and owner-led businesses: lead response, intake, bookings, follow-ups, reporting, integrations, and custom workflows.",
  alternates: { canonical: "/services/ai-automation" },
  openGraph: { title: "AI Automation Services | Musme", description: "Practical workflows and integrations that remove repetitive work.", url: "/services/ai-automation" },
};

const faqs = [
  ["What can AI automation handle?", "AI automation can handle repetitive, rules-based work such as lead capture, qualification, appointment reminders, intake, document routing, follow-ups, review requests, reporting, and moving data between business systems."],
  ["Will automation replace our team?", "Musme designs automation to remove repetitive coordination and data entry, while keeping approvals, sensitive decisions, and customer relationships with the people responsible for them."],
  ["Can Musme connect our existing tools?", "Yes. A typical project connects forms, email, messaging, calendars, spreadsheets, CRM systems, booking platforms, databases, and internal software through APIs and controlled workflows."],
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": `${SITE_URL}/services/ai-automation#service`,
      name: "AI automation services",
      serviceType: "AI automation and workflow integration",
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed: "Worldwide",
      audience: { "@type": "BusinessAudience", audienceType: "Healthcare, restaurant, and owner-led businesses" },
      description: "Workflow automation, integrations, intelligent routing, follow-ups, and reporting designed around real business operations.",
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/services/ai-automation#webpage`,
      url: `${SITE_URL}/services/ai-automation`,
      name: "AI Automation Services | Musme",
      dateModified: LAST_UPDATED,
      about: { "@id": `${SITE_URL}/services/ai-automation#service` },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
    },
  ],
};

export default function AiAutomationPage() {
  return (
    <ContentPage
      eyebrow="AI automation"
      title="Turn repetitive work into a reliable system."
      intro="Musme designs AI automation around the way your operation actually works. We connect the tools you already use, remove avoidable handoffs, and keep people in control where judgment matters."
      schema={schema}
    >
      <BreadcrumbSchema items={[["Home", ""], ["AI automation", "/services/ai-automation"]]} />
      <section>
        <h2>What is AI automation for business?</h2>
        <p>AI automation combines workflow rules, integrations, and language or vision models to complete repetitive work across forms, inboxes, calendars, records, and reports. A useful automation does more than generate text: it detects an event, understands the context, takes an approved action, and records what happened.</p>
      </section>

      <section>
        <h2>What Musme can automate</h2>
        <div className="content-grid content-grid-three">
          <article><p className="content-kicker">Revenue</p><h3>Leads and follow-up</h3><p>Capture enquiries, qualify intent, send immediate replies, schedule the next step, update your CRM, and alert a person when a lead needs attention.</p></article>
          <article><p className="content-kicker">Operations</p><h3>Intake and routing</h3><p>Collect structured information, check completeness, create records, route requests, and keep each team member informed without copying data by hand.</p></article>
          <article><p className="content-kicker">Visibility</p><h3>Reporting and alerts</h3><p>Combine data from your systems, generate recurring summaries, flag unusual activity, and deliver the right information to the right owner.</p></article>
        </div>
      </section>

      <section className="content-grid">
        <article>
          <h2>Healthcare automation examples</h2>
          <ul>
            <li>Patient intake and document collection</li>
            <li>Appointment reminders and follow-ups</li>
            <li>Internal referral and task routing</li>
            <li>Approved summaries and operational reporting</li>
          </ul>
        </article>
        <article>
          <h2>Restaurant automation examples</h2>
          <ul>
            <li>Booking confirmations and guest messaging</li>
            <li>Review requests and response workflows</li>
            <li>Menu, inventory, and supplier updates</li>
            <li>Lead capture for events and catering</li>
          </ul>
        </article>
      </section>

      <section>
        <h2>How an automation project works</h2>
        <ol className="content-steps">
          <li><strong>Workflow audit.</strong> We document the trigger, current steps, exceptions, owners, and desired result.</li>
          <li><strong>System design.</strong> We decide which steps should be automated, assisted, approved, or left manual.</li>
          <li><strong>Build and test.</strong> We connect the tools, test normal and edge cases, and add logs and failure alerts.</li>
          <li><strong>Launch and improve.</strong> We monitor real use and refine the workflow using evidence from the operation.</li>
        </ol>
      </section>

      <section>
        <h2>AI automation questions</h2>
        <div className="content-faq">
          {faqs.map(([question, answer]) => <article key={question}><h3>{question}</h3><p>{answer}</p></article>)}
        </div>
      </section>
    </ContentPage>
  );
}
