import Link from "next/link";

import { Reveal } from "@/components/Reveal";

const sectors = [
  {
    title: "Healthcare",
    body: "Much of clinic administration is repeated: forms, reminders, and handoffs between staff. We design those routine steps as a system, so the team keeps its time for patients while approvals stay with people. Patient education and reminder content is reviewed for accuracy, privacy, and appropriate claims before it goes out.",
    items: [
      "Patient intake and document collection",
      "Appointment reminders and follow-ups",
      "Internal referral and task routing",
      "Approved summaries and operational reporting",
    ],
  },
  {
    title: "Restaurants",
    body: "Guest experience starts before the table. Bookings, menus, messages, and reviews work better when the front of house and the back office share one set of information. Menus and offers stay simple for restaurant teams to update.",
    items: [
      "Booking confirmations and guest messaging",
      "Review requests and response workflows",
      "Menu, inventory, and supplier updates",
      "AI menus with live availability and reservation links",
    ],
  },
] as const;

const relatedLinks = [
  { href: "/services/ai-automation", label: "AI automation for clinics and restaurants" },
  { href: "/services/web-development", label: "Websites, apps, and AI menus" },
  { href: "/services/ai-content", label: "AI video and image content systems" },
  { href: "/case-studies", label: "Selected client websites and products" },
];

/** Healthcare and restaurant workflows on the homepage, linking each one to the service that delivers it. */
export function IndustryWorkflows() {
  return (
    <section className="workflows section" id="workflows" aria-labelledby="workflows-title">
      <div className="shell-indent industries-grid">
        <Reveal direction="left">
          <p className="section-label">Workflows</p>
          <h2 id="workflows-title">Where the repeated work sits in healthcare and restaurants.</h2>
          <p className="lead-dark">
            Most projects begin with one task your team still does by hand. These are the workflows we design most often in our two core sectors. Each one keeps approvals and sensitive decisions with the people responsible for them.
          </p>
          <ul className="workflow-links">
            {relatedLinks.map(({ href, label }) => (
              <li key={href}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
          <p className="workflow-note">
            Not sure which workflow fits? <Link href="/contact">Describe the operation on our contact page</Link>, and we will recommend a focused first move.
          </p>
        </Reveal>
        <div className="industry-notes">
          {sectors.map(({ title, body, items }, index) => (
            <Reveal as="article" key={title} direction="right" delay={0.08 * (index + 1)}>
              <h3>{title}</h3>
              <p>{body}</p>
              <ul>
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
