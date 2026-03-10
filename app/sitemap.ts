import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://manga-tokuten.com'

  // 1. 固定のページ（トップ、お問い合わせ、プライバシーポリシーなど）
  const staticPaths: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  // 2. 動的なページ（漫画詳細ページなど）がある場合
  // ここでデータベースなどからIDやスラッグを取得する処理を書きます
  // 例: const mangas = await getMangaList() 
  
  const dynamicPaths: MetadataRoute.Sitemap = [
    // もし個別の漫画ページなどがあれば、ここに追加していきます
    /*
    {
      url: `${baseUrl}/manga/example-id`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    */
  ]

  return [...staticPaths, ...dynamicPaths]
}