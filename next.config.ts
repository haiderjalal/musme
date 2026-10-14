import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

// 'unsafe-inline' stays in script-src on purpose. Next.js inline bootstrap scripts and the pre-paint
// script in app/layout.tsx cannot run under a strict CSP without a per-request nonce, and a nonce
// would force every page to render dynamically (no static or CDN caching). Revisit with a proxy.ts
// nonce once that trade-off is approved. JSON-LD (application/ld+json) is never executed, so CSP
// does not apply to it.
const contentSecurityPolicy = `
  default-src 'self';
  base-uri 'self';
  object-src 'none';
  frame-ancestors 'none';
  form-action 'self';
  script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com https://*.doubleclick.net https://*.adtrafficquality.google;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https:;
  font-src 'self' data:;
  connect-src 'self' https://*.google.com https://*.googleadservices.com https://*.googlesyndication.com https://*.doubleclick.net https://*.adtrafficquality.google;
  frame-src https://*.google.com https://*.googlesyndication.com https://*.doubleclick.net https://*.adtrafficquality.google;
  media-src 'self';
  worker-src 'self' blob:;
  manifest-src 'self';
  ${isDevelopment ? "" : "upgrade-insecure-requests;"}
`.replace(/\s{2,}/g, " ").trim();

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Agents sending Accept: text/markdown get the markdown version of the home page.
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          has: [{ type: "header", key: "accept", value: ".*text/markdown.*" }],
          destination: "/index.md",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Only same-origin callers (the quote form) should read API responses. Scoped to /api
        // because a site-wide value would stop other sites embedding the logo and images.
        source: "/api/:path*",
        headers: [{ key: "Cross-Origin-Resource-Policy", value: "same-origin" }],
      },
      {
        source: "/",
        headers: [
          { key: "Vary", value: "Accept" },
          { key: "Link", value: '</index.md>; rel="alternate"; type="text/markdown"' },
        ],
      },
    ];
  },
};

export default nextConfig;
