import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // ここを必ず「https://manga-tokuten.com」に固定します
  const baseUrl = 'https://manga-tokuten.com'

  return [
    {
      url: `${baseUrl}`, // これで https://manga-tokuten.com になります
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/book`, // これで https://manga-tokuten.com/book になります
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/survey`, // これで https://manga-tokuten.com/survey になります
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]
}