import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://ribali.advize.gr";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

// Every route that ships in both locales. Each entry emits two <url> blocks
// (el default + en alternate) cross-linked with xhtml:link hreflang.
const ROUTES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/models", changefreq: "monthly", priority: "0.9" },
  { path: "/models/odyssey", changefreq: "monthly", priority: "0.8" },
  { path: "/models/alu", changefreq: "monthly", priority: "0.8" },
  { path: "/models/r-520", changefreq: "monthly", priority: "0.7" },
  { path: "/models/r-680", changefreq: "monthly", priority: "0.7" },
  { path: "/models/r-950", changefreq: "monthly", priority: "0.7" },
  { path: "/stock", changefreq: "weekly", priority: "0.8" },
  { path: "/configurator", changefreq: "monthly", priority: "0.7" },
  { path: "/dealers", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "yearly", priority: "0.6" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const enPath = (p: string) => (p === "/" ? "/en" : `/en${p}`);
        const blocks: string[] = [];
        for (const e of ROUTES) {
          for (const locPath of [e.path, enPath(e.path)]) {
            blocks.push(
              [
                `  <url>`,
                `    <loc>${BASE_URL}${locPath}</loc>`,
                `    <xhtml:link rel="alternate" hreflang="el" href="${BASE_URL}${e.path}" />`,
                `    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}${enPath(e.path)}" />`,
                `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${e.path}" />`,
                e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
                e.priority ? `    <priority>${e.priority}</priority>` : null,
                `  </url>`,
              ].filter(Boolean).join("\n"),
            );
          }
        }
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
          ...blocks,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
