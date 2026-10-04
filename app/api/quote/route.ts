const RECIPIENT = "haiderjalal1555@gmail.com";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const requests = new Map<string, { count: number; resetAt: number }>();

type QuotePayload = {
  services?: unknown;
  name?: unknown;
  company?: unknown;
  email?: unknown;
  phone?: unknown;
  budget?: unknown;
  timeline?: unknown;
  details?: unknown;
  website?: unknown;
};

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function limited(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || "local";
  const now = Date.now();
  const current = requests.get(ip);
  if (!current || current.resetAt < now) {
    requests.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return false;
  }
  current.count += 1;
  return current.count > 5;
}

export async function POST(request: Request) {
  if (limited(request)) {
    return Response.json({ message: "Too many requests. Please try again in a few minutes." }, { status: 429 });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured.");
    return Response.json({ message: "Email delivery is not configured yet." }, { status: 503 });
  }

  let input: QuotePayload;
  try {
    input = (await request.json()) as QuotePayload;
  } catch {
    return Response.json({ message: "Invalid request." }, { status: 400 });
  }

  if (text(input.website, 200)) {
    return Response.json({ ok: true });
  }

  const name = text(input.name, 100);
  const company = text(input.company, 120);
  const email = text(input.email, 160).toLowerCase();
  const phone = text(input.phone, 80);
  const budget = text(input.budget, 80);
  const timeline = text(input.timeline, 80);
  const details = text(input.details, 4000);
  const services = Array.isArray(input.services)
    ? input.services.filter((item): item is string => typeof item === "string").slice(0, 10).map((item) => item.slice(0, 80))
    : [];

  if (!name || !EMAIL_PATTERN.test(email) || services.length === 0 || !budget || !timeline || details.length < 20) {
    return Response.json({ message: "Please complete all required fields." }, { status: 400 });
  }

  const safe = {
    name: escapeHtml(name),
    company: escapeHtml(company || "Not provided"),
    email: escapeHtml(email),
    phone: escapeHtml(phone || "Not provided"),
    budget: escapeHtml(budget),
    timeline: escapeHtml(timeline),
    details: escapeHtml(details).replaceAll("\n", "<br />"),
    services: services.map(escapeHtml).join(" · "),
  };

  const fallbackSender = "Musme Website <onboarding@resend.dev>";
  const configuredSender = process.env.RESEND_FROM_EMAIL?.trim();
  const preferredSender = configuredSender && !configuredSender.includes("your-verified-domain.com")
    ? configuredSender
    : fallbackSender;
  const emailBody = {
      to: [RECIPIENT],
      reply_to: email,
      subject: `New Musme brief — ${name}${company ? ` / ${company}` : ""}`.replaceAll(/[\r\n]/g, " "),
      html: `
        <div style="background:#0d0f0c;padding:40px 20px;font-family:Arial,sans-serif;color:#f2f4ee">
          <div style="max-width:640px;margin:0 auto;border:1px solid #30352f;border-radius:18px;overflow:hidden;background:#151815">
            <div style="padding:34px 38px;border-bottom:1px solid #30352f">
              <p style="margin:0 0 12px;color:#6befbc;font-size:12px;letter-spacing:2px;text-transform:uppercase">New project brief</p>
              <h1 style="margin:0;font-size:30px;font-weight:500">${safe.name}${company ? ` from ${safe.company}` : ""}</h1>
            </div>
            <div style="padding:30px 38px">
              <p style="margin:0 0 8px;color:#8e978c;font-size:12px;text-transform:uppercase;letter-spacing:1px">Interested in</p>
              <p style="margin:0 0 28px;font-size:18px;color:#6befbc">${safe.services}</p>
              <table style="width:100%;border-collapse:collapse;margin-bottom:28px;color:#f2f4ee">
                <tr><td style="padding:10px 0;color:#8e978c">Email</td><td style="padding:10px 0;text-align:right">${safe.email}</td></tr>
                <tr><td style="padding:10px 0;color:#8e978c">Phone</td><td style="padding:10px 0;text-align:right">${safe.phone}</td></tr>
                <tr><td style="padding:10px 0;color:#8e978c">Budget</td><td style="padding:10px 0;text-align:right">${safe.budget}</td></tr>
                <tr><td style="padding:10px 0;color:#8e978c">Timeline</td><td style="padding:10px 0;text-align:right">${safe.timeline}</td></tr>
              </table>
              <p style="margin:0 0 10px;color:#8e978c;font-size:12px;text-transform:uppercase;letter-spacing:1px">The brief</p>
              <p style="margin:0;color:#dce2d9;font-size:16px;line-height:1.7">${safe.details}</p>
            </div>
          </div>
        </div>`,
  };

  async function sendWith(sender: string) {
    return fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `musme-quote-${crypto.randomUUID()}`,
      },
      body: JSON.stringify({ ...emailBody, from: sender }),
    });
  }

  let response = await sendWith(preferredSender);
  let errorText = response.ok ? "" : await response.text();

  const senderWasRejected = /domain|sender|from address|verify|verified/i.test(errorText);
  if (!response.ok && preferredSender !== fallbackSender && senderWasRejected) {
    console.warn("Configured Resend sender was rejected; retrying with onboarding sender.");
    response = await sendWith(fallbackSender);
    errorText = response.ok ? "" : await response.text();
  }

  if (!response.ok) {
    console.error("Resend error:", response.status, errorText);
    const publicMessage = /testing emails|own email address|verify a domain/i.test(errorText)
      ? "Resend is still in testing mode. Verify a sending domain, or send to the email used by your Resend account."
      : /api key|unauthorized|invalid[_ ]?key/i.test(errorText)
        ? "The email service credentials need to be updated."
        : /domain|sender|from address|verify|verified/i.test(errorText)
          ? "The sender domain is not verified in Resend."
          : "We could not send your brief. Please try again.";
    return Response.json({ message: publicMessage }, { status: 502 });
  }

  return Response.json({ ok: true });
}
