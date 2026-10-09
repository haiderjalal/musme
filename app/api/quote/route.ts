import "server-only";

const DEFAULT_RECIPIENT = "haiderjalal1555@gmail.com";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_BODY_BYTES = 16_384;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RESEND_TIMEOUT_MS = 8_000;
const requests = new Map<string, { count: number; resetAt: number }>();

const ALLOWED_SERVICES = new Set([
  "AI automation",
  "Website",
  "Custom software",
  "AI video & images",
  "Social media",
  "AI restaurant menu",
  "Mobile app",
  "Not sure yet",
]);
const ALLOWED_BUDGETS = new Set(["Under $2k", "$2k–$5k", "$5k–$10k", "$10k+", "Let’s discuss"]);
const ALLOWED_TIMELINES = new Set(["Immediately", "Within a month", "1–3 months", "Just exploring"]);

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
  return typeof value === "string"
    ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, maxLength)
    : "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clientKey(request: Request) {
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function rateLimit(request: Request) {
  const key = clientKey(request);
  const now = Date.now();

  if (requests.size > 1_000) {
    for (const [entryKey, entry] of requests) {
      if (entry.resetAt <= now) requests.delete(entryKey);
    }
  }

  const current = requests.get(key);
  if (!current || current.resetAt <= now) {
    requests.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { limited: false, retryAfter: 0 };
  }

  current.count += 1;
  return {
    limited: current.count > RATE_LIMIT,
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

function json(body: object, status = 200, extraHeaders?: HeadersInit) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    },
  });
}

function isCrossOrigin(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return true;

  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    return new URL(origin).origin !== new URL(request.url).origin;
  } catch {
    return true;
  }
}

export function OPTIONS(request: Request) {
  if (isCrossOrigin(request)) return json({ message: "Forbidden." }, 403);
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
      "Cache-Control": "no-store, max-age=0",
      "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();

  if (isCrossOrigin(request)) {
    return json({ message: "Forbidden." }, 403);
  }

  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json({ message: "Content-Type must be application/json." }, 415);
  }

  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return json({ message: "Request is too large." }, 413);
  }

  const limit = rateLimit(request);
  if (limit.limited) {
    return json(
      { message: "Too many requests. Please try again in a few minutes." },
      429,
      { "Retry-After": String(limit.retryAfter) },
    );
  }

  let input: QuotePayload;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return json({ message: "Request is too large." }, 413);
    }
    input = JSON.parse(rawBody) as QuotePayload;
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid body");
  } catch {
    return json({ message: "Invalid request." }, 400);
  }

  if (text(input.website, 200)) {
    return json({ ok: true });
  }

  const name = text(input.name, 100);
  const company = text(input.company, 120);
  const email = text(input.email, 160).toLowerCase();
  const phone = text(input.phone, 80);
  const budget = text(input.budget, 80);
  const timeline = text(input.timeline, 80);
  const details = text(input.details, 4000);
  const services = Array.isArray(input.services)
    ? [...new Set(input.services.filter((item): item is string => typeof item === "string").map((item) => text(item, 80)))]
        .filter((item) => ALLOWED_SERVICES.has(item))
        .slice(0, ALLOWED_SERVICES.size)
    : [];

  if (
    !name ||
    !EMAIL_PATTERN.test(email) ||
    email.length > 160 ||
    services.length === 0 ||
    !ALLOWED_BUDGETS.has(budget) ||
    !ALLOWED_TIMELINES.has(timeline) ||
    details.length < 20
  ) {
    return json({ message: "Please complete all required fields." }, 400);
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error("quote_delivery_configuration_error", { requestId, code: "missing_resend_api_key" });
    return json({ message: "We could not send your brief. Please try again later.", requestId }, 503);
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
  const recipient = process.env.QUOTE_RECIPIENT_EMAIL?.trim() || DEFAULT_RECIPIENT;
  const preferredSender = configuredSender && !configuredSender.includes("your-verified-domain.com")
    ? configuredSender
    : fallbackSender;
  const emailBody = {
      to: [recipient],
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
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `musme-quote-${crypto.randomUUID()}`,
      },
      body: JSON.stringify({ ...emailBody, from: sender }),
      cache: "no-store",
      signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
    });
  }

  try {
    let response = await sendWith(preferredSender);
    let errorText = response.ok ? "" : await response.text();

    const senderWasRejected = /domain|sender|from address|verify|verified/i.test(errorText);
    if (!response.ok && preferredSender !== fallbackSender && senderWasRejected) {
      console.warn("quote_delivery_sender_rejected", { requestId, status: response.status });
      response = await sendWith(fallbackSender);
      errorText = response.ok ? "" : await response.text();
    }

    if (!response.ok) {
      console.error("quote_delivery_provider_error", { requestId, status: response.status });
      return json({ message: "We could not send your brief. Please try again later.", requestId }, 502);
    }

    return json({ ok: true, requestId });
  } catch (error) {
    console.error("quote_delivery_network_error", {
      requestId,
      code: error instanceof Error && error.name === "TimeoutError" ? "timeout" : "network_error",
    });
    return json({ message: "We could not send your brief. Please try again later.", requestId }, 502);
  }
}
