import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

const BASE_URL = "https://mkstudiocollective.com";

const staticPages = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/catalogue", changefreq: "weekly", priority: "0.9" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/how-rental-works", changefreq: "monthly", priority: "0.7" },
  { path: "/list-with-us", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

router.get("/sitemap.xml", async (_req, res) => {
  try {
    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_public", true)
      .order("sort_order");

    const now = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}${page.path}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const product of products ?? []) {
      const lastmod = product.updated_at
        ? new Date(product.updated_at).toISOString()
        : now;
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/catalogue/${escapeXml(product.slug)}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    res.send(xml);
  } catch (err) {
    console.error("[Sitemap] Error generating sitemap:", err);
    res.status(500).send("Error generating sitemap");
  }
});

export default router;
