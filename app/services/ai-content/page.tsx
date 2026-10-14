import type { Metadata } from "next";
import { BreadcrumbSchema, buildPageMetadata, ContentPage, LAST_UPDATED, SITE_URL } from "@/components/ContentPage";

export const metadata: Metadata = buildPageMetadata({
  title: "AI Content, Video & Image Generation Services | Musme",
  description: "Musme builds managed AI content systems for strategy, scripts, image generation, video generation, social media, publishing, and performance improvement.",
  path: "/services/ai-content",
  og: {
    title: "AI Content Services | Musme",
    description: "AI video, imagery, copy, and social publishing shaped into one repeatable system.",
  },
});

const faqs = [
  [
    "What does an AI content system include?",
    "You receive content strategy and channel priorities, brand voice and visual direction, a content calendar, and campaign concepts. Musme then produces AI-assisted scripts and copy, generated and edited images and video, and an approval and publishing workflow, followed by performance review and iteration.",
  ],
  [
    "Does AI-generated content still need human review?",
    "Yes. AI speeds up production, while strategy and human review protect quality, accuracy, and brand judgment. Healthcare content goes through careful review for accuracy, privacy, and appropriate claims. Approval steps are built into the workflow, so content reaches your audience only after approval.",
  ],
  [
    "Which businesses is the AI content service built for?",
    "Musme focuses on healthcare and restaurants. For healthcare, that means patient education, service explainers, clinic updates, and reminder content. For restaurants, it means menu launches, dish visuals, offers, events, and review-led ideas produced at a consistent pace. Owner-led businesses outside those sectors can use the same system.",
  ],
];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": `${SITE_URL}/services/ai-content#service`,
      name: "AI content, video, and image generation services",
      serviceType: "AI content production and social media management",
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed: "Worldwide",
      description: "A managed content system spanning strategy, scripting, AI image generation, AI video generation, copy, approvals, publishing, and performance review.",
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/services/ai-content#webpage`,
      url: `${SITE_URL}/services/ai-content`,
      name: "AI Content, Video & Image Generation Services | Musme",
      dateModified: LAST_UPDATED,
      about: { "@id": `${SITE_URL}/services/ai-content#service` },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
    },
  ],
};

export default function AiContentPage() {
  return (
    <ContentPage
      eyebrow="AI content systems"
      title="A repeatable content engine, not a pile of prompts."
      intro="Musme combines strategy, human direction, AI video and image generation, copy, publishing, and performance review into a content system your brand can sustain."
      schema={schema}
    >
      <BreadcrumbSchema items={[["Home", ""], ["AI content", "/services/ai-content"]]} />
      <section>
        <h2>What is an AI content system?</h2>
        <p>An AI content system is a repeatable workflow for turning business goals into approved, on-brand content. It connects research, ideas, scripts, image and video generation, editing, review, publishing, and measurement. AI accelerates production, while strategy and human review protect quality, accuracy, and brand judgment.</p>
      </section>

      <section className="content-grid content-grid-three">
        <article><p className="content-kicker">Visuals</p><h2>AI image generation</h2><p>Campaign concepts, product visuals, editorial imagery, social assets, and reusable visual systems directed to match your brand rather than a generic AI aesthetic.</p></article>
        <article><p className="content-kicker">Motion</p><h2>AI video generation</h2><p>Short-form videos, explainers, product stories, branded scenes, and social variations planned around a message, format, and distribution goal.</p></article>
        <article><p className="content-kicker">Distribution</p><h2>Social media management</h2><p>Content calendars, writing, creative production, approvals, scheduling, community workflows, and reporting designed as one operating rhythm.</p></article>
      </section>

      <section>
        <h2>How the content workflow works</h2>
        <ol className="content-steps">
          <li><strong>Direction.</strong> Define the audience, offer, voice, visual world, channels, and success measure.</li>
          <li><strong>System.</strong> Create repeatable formats, prompt structures, templates, review rules, and a publishing cadence.</li>
          <li><strong>Production.</strong> Generate and edit copy, images, and video with human creative direction and quality control.</li>
          <li><strong>Learning.</strong> Review performance, customer questions, and sales feedback to improve the next cycle.</li>
        </ol>
      </section>

      <section className="content-grid">
        <article><h2>For healthcare</h2><p>Patient education, service explainers, clinic updates, team stories, and reminder content—with careful review for accuracy, privacy, and appropriate claims.</p></article>
        <article><h2>For restaurants</h2><p>Menu launches, dish visuals, chef stories, offers, events, behind-the-scenes content, guest questions, and review-led ideas produced at a consistent pace.</p></article>
      </section>

      <section>
        <h2>What you receive</h2>
        <ul className="content-columns">
          <li>Content strategy and channel priorities</li>
          <li>Brand voice and visual direction</li>
          <li>Content calendar and campaign concepts</li>
          <li>AI-assisted scripts and copy</li>
          <li>Generated and edited image assets</li>
          <li>Generated and edited video assets</li>
          <li>Approval and publishing workflow</li>
          <li>Performance review and iteration</li>
        </ul>
      </section>

      <section>
        <h2>AI content questions</h2>
        <div className="content-faq">
          {faqs.map(([question, answer]) => <article key={question}><h3>{question}</h3><p>{answer}</p></article>)}
        </div>
      </section>
    </ContentPage>
  );
}
