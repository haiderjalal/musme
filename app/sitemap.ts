import type { MetadataRoute } from "next";
import { SITE_URL } from "@/components/ContentPage";

const routes = [
  ["", 1],
  ["/about", 0.8],
  ["/services/ai-automation", 0.9],
  ["/services/web-development", 0.9],
  ["/services/ai-content", 0.9],
  ["/case-studies", 0.8],
  ["/contact", 0.8],
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(([path, priority]) => ({
    url: `${SITE_URL}${path}`,
    lastModified: "2026-10-08",
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority,
  }));
}
