// app/sitemap.ts
import { MetadataRoute } from 'next';

// ✅ 雑誌サイトのドメイン
const SITE_URL = 'https://manga-tokuten.online';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const gasUrl = process.env.NEXT_PUBLIC_GAS_MAGAZINE_URL || process.env.NEXT_PUBLIC_GAS_URL;
  let magazineIds: string[] = [];

  if (gasUrl) {
    try {
      // 1. GASから全雑誌データを取得
      const res = await fetch(gasUrl, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        // 雑誌データ（mags）からIDを抽出して重複を削除
        const mags = Array.isArray(data) ? data : (data.mags || []);
        magazineIds = Array.from(
          new Set(mags.map((m: any) => String(m.magazine_id || '').trim()).filter(Boolean))
        );
      }
    } catch (e) {
      console.error("サイトマップ生成中のエラー:", e);
    }
  }

  // 2. 雑誌詳細ページのURLリストを生成 (/magazine/xxx)
  const magazineDetailUrls: MetadataRoute.Sitemap = magazineIds.map((id) => ({
    url: `${SITE_URL}/magazine/${encodeURIComponent(id)}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // 3. 全てのページを合体させて提出
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/prizes`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...magazineDetailUrls, // ✅ ここで全雑誌のURLを追加！
  ];
}