import type { MetadataRoute } from "next";

const SITE = "https://comic-manga-site.vercel.app";
const GAS_URL = process.env.GAS_URL!;

async function getMagIds(): Promise<string[]> {
  const res = await fetch(`${GAS_URL}?type=magazines`, { next: { revalidate: 3600 } });
  const arr = (await res.json()) as any[];
  return arr.map((m) => String(m.magazine_id || "").trim()).filter(Boolean);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ids = await getMagIds();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/prizes`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/services`, changeFrequency: "daily", priority: 0.9 },
  ];

  const magUrls: MetadataRoute.Sitemap = ids.map((id) => ({
    url: `${SITE}/magazine/${encodeURIComponent(id)}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticUrls, ...magUrls];
}
