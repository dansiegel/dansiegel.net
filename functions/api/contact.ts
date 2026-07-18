interface Env {
  PUBLIC_SITE_ENV?: string;
  TURNSTILE_SECRET_KEY?: string;
  POSTMARK?: string;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_RATE_LIMIT?: KVNamespace;
}

const ALLOWED_ORIGINS = new Set([
  "https://dansiegel.net",
  "https://www.dansiegel.net",
  "https://dansiegel-net.pages.dev",
]);
const TURNSTILE_HOSTNAMES = new Set([
  "dansiegel.net",
  "www.dansiegel.net",
  "dansiegel-net.pages.dev",
  "localhost",
]);
const SUBJECTS = new Set(["Consulting", "Roatán team retreat", "Speaking", "Open source", "Other"]);

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

const clean = (value: FormDataEntryValue | null, max: number) => String(value ?? "").trim().slice(0, max);
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);

async function verifyTurnstile(token: string, ip: string, secret: string): Promise<boolean> {
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  if (!response.ok) return false;
  const result = await response.json() as { success?: boolean; hostname?: string; action?: string };
  return result.success === true
    && result.action === "contact"
    && !!result.hostname
    && TURNSTILE_HOSTNAMES.has(result.hostname);
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const origin = request.headers.get("origin");
  const production = env.PUBLIC_SITE_ENV === "production";
  if (production && (!origin || !ALLOWED_ORIGINS.has(origin))) return json({ error: "This request origin is not allowed." }, 403);

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("form-data") && !contentType.includes("urlencoded")) return json({ error: "Unsupported form submission." }, 415);

  const form = await request.formData();
  const name = clean(form.get("name"), 100);
  const email = clean(form.get("email"), 254).toLowerCase();
  const subject = clean(form.get("subject"), 50);
  const message = clean(form.get("message"), 5000);
  const honeypot = clean(form.get("company_website"), 200);
  const startedAt = Number(form.get("startedAt"));
  const token = clean(form.get("cf-turnstile-response"), 2048);
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";

  if (honeypot) return json({ ok: true });
  if (!startedAt || Date.now() - startedAt < 2500 || Date.now() - startedAt > 7_200_000) return json({ error: "Please refresh the page and try again." }, 400);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !SUBJECTS.has(subject) || message.length < 20) return json({ error: "Please complete every field with a valid email and message." }, 400);

  if (env.CONTACT_RATE_LIMIT) {
    const key = `contact:${ip}`;
    const attempts = Number(await env.CONTACT_RATE_LIMIT.get(key) ?? 0);
    if (attempts >= 5) return json({ error: "Too many messages were sent from this connection. Please try again later." }, 429);
    await env.CONTACT_RATE_LIMIT.put(key, String(attempts + 1), { expirationTtl: 3600 });
  }

  if (production && !env.TURNSTILE_SECRET_KEY) return json({ error: "The contact form is temporarily unavailable. Please try again later." }, 503);
  if (production && !token) return json({ error: "Please complete the spam check." }, 400);
  if (env.TURNSTILE_SECRET_KEY && !(await verifyTurnstile(token, ip, env.TURNSTILE_SECRET_KEY))) return json({ error: "The spam check failed. Please try again." }, 400);
  if (!env.POSTMARK || !env.CONTACT_TO_EMAIL || !env.CONTACT_FROM_EMAIL) {
    return json({ error: "Message delivery is temporarily unavailable. Please try again later." }, 503);
  }

  const response = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-postmark-server-token": env.POSTMARK,
    },
    body: JSON.stringify({
      From: env.CONTACT_FROM_EMAIL,
      To: env.CONTACT_TO_EMAIL,
      ReplyTo: email,
      Subject: `[dansiegel.net] ${subject}: ${name}`,
      HtmlBody: `<h2>New website message</h2><p><strong>Name:</strong> ${escapeHtml(name)}<br><strong>Email:</strong> ${escapeHtml(email)}<br><strong>Topic:</strong> ${escapeHtml(subject)}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
      TextBody: `Name: ${name}\nEmail: ${email}\nTopic: ${subject}\n\n${message}`,
      Tag: "website-contact",
      MessageStream: "outbound",
    }),
  });
  if (!response.ok) {
    console.error("Postmark rejected a contact message.", { status: response.status });
    return json({ error: "The message could not be delivered. Please try again later." }, 502);
  }
  return json({ ok: true });
};

export const onRequestGet: PagesFunction<Env> = async () => json({ error: "Method not allowed." }, 405);
