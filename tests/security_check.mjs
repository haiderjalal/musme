import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_BASE_URL || "http://127.0.0.1:3012";

async function request(path, init = {}) {
  return fetch(`${BASE_URL}${path}`, { redirect: "manual", ...init });
}

const home = await request("/");
assert.equal(home.status, 200);
assert.equal(home.headers.get("x-powered-by"), null, "Framework fingerprint header must be disabled");
assert.equal(home.headers.get("x-content-type-options"), "nosniff");
assert.equal(home.headers.get("x-frame-options"), "DENY");
assert.match(home.headers.get("content-security-policy") || "", /frame-ancestors 'none'/);
assert.match(home.headers.get("permissions-policy") || "", /camera=\(\)/);

const admin = await request("/admin");
assert.equal(admin.status, 404, "No admin surface should be exposed");

for (const sensitivePath of ["/.env", "/.git/config", "/package.json", "/CLAUDE.md", "/tsconfig.tsbuildinfo"]) {
  const response = await request(sensitivePath);
  assert.equal(response.status, 404, `${sensitivePath} must not be publicly exposed`);
}

const crossOrigin = await request("/api/quote", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Origin: "https://attacker.example",
    "Sec-Fetch-Site": "cross-site",
  },
  body: "{}",
});
assert.equal(crossOrigin.status, 403);
assert.equal(crossOrigin.headers.get("access-control-allow-origin"), null);

const preflight = await request("/api/quote", {
  method: "OPTIONS",
  headers: { Origin: "https://attacker.example", "Sec-Fetch-Site": "cross-site" },
});
assert.equal(preflight.status, 403);
assert.equal(preflight.headers.get("access-control-allow-origin"), null);

const wrongContentType = await request("/api/quote", {
  method: "POST",
  headers: { "Content-Type": "text/plain", "X-Forwarded-For": "203.0.113.10" },
  body: "{}",
});
assert.equal(wrongContentType.status, 415);

const malformed = await request("/api/quote", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Forwarded-For": "203.0.113.11" },
  body: "{",
});
assert.equal(malformed.status, 400);

const oversized = await request("/api/quote", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Forwarded-For": "203.0.113.12" },
  body: JSON.stringify({ details: "x".repeat(17_000) }),
});
assert.equal(oversized.status, 413);

const injection = "<img src=x onerror=alert(1)>";
const invalidChoice = await request("/api/quote", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Forwarded-For": "203.0.113.13" },
  body: JSON.stringify({
    services: [injection],
    name: injection,
    email: "security@example.com",
    budget: injection,
    timeline: injection,
    details: injection,
  }),
});
assert.equal(invalidChoice.status, 400);
assert.equal((await invalidChoice.text()).includes(injection), false, "Rejected input must never be reflected");

for (let attempt = 1; attempt <= 6; attempt += 1) {
  const limited = await request("/api/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Forwarded-For": "203.0.113.99" },
    body: "{}",
  });
  if (attempt <= 5) assert.equal(limited.status, 400);
  else {
    assert.equal(limited.status, 429);
    assert.ok(Number(limited.headers.get("retry-after")) > 0);
  }
}

console.log("Security checks passed: headers, admin exposure, CORS, payload validation, XSS reflection, and rate limiting.");
