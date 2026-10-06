import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
