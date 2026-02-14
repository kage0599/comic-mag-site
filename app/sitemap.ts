import type { MetadataRoute } from "next";

const SITE = "https://comic-manga-site.vercel.app";
const GAS_URL = process.env.GAS_URL; // ← undefinedでも落とさない

async function getMagIdsSafe(): Promise<string[]> {
  if (!GAS_URL) return []; // ✅ ここで防ぐ

  try {
    const res = await fetch(`${GAS_URL}?type=magazines`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const arr = (await res.json()) as any[];
    return arr.map((m) => String(m?.magazine_id || "").trim()).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ids = await getMagIdsSafe();

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
