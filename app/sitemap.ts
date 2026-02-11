// app/sitemap.ts
import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://comic-manga-site.vercel.app";

// GAS_URL は「無いこともある」前提で安全に扱う
const GAS_URL =
  process.env.GAS_URL ||
  process.env.NEXT_PUBLIC_GAS_URL || // もしNEXT_PUBLICで管理してるなら拾う
  "";

type Magazine = { magazine_id?: string };

async function getMagIds(): Promise<string[]> {
  if (!GAS_URL) return []; // ✅ ここが重要：無ければ詳細ページ分は生成しない

  const res = await fetch(`${GAS_URL}?type=magazines`, {
    // ビルド時に失敗してもサイトマップ生成を止めないため、強キャッシュも無し
    cache: "no-store",
  });

  if (!res.ok) return [];

  const arr = (await res.json()) as Magazine[];
  if (!Array.isArray(arr)) return [];

  return arr
    .map((m) => String(m?.magazine_id ?? "").trim())
    .filter(Boolean);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/prizes`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/services`, changeFrequency: "daily", priority: 0.9 },
  ];

  const ids = await getMagIds();

  const magUrls: MetadataRoute.Sitemap = ids.map((id) => ({
    url: `${SITE}/magazine/${encodeURIComponent(id)}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticUrls, ...magUrls];
}
