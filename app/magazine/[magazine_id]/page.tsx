// app/magazine/[magazine_id]/page.tsx

import MagazineDetailClient from "./MagazineDetailClient";

export const revalidate = 3600;


/* ===========================
  GASから全データ取得
=========================== */

async function getFullData() {

  const gasUrl =
    process.env.NEXT_PUBLIC_GAS_MAGAZINE_URL ||
    process.env.NEXT_PUBLIC_GAS_URL;

  if (!gasUrl) {
    return { mags: [], prizes: [], services: [] };
  }

  try {

    const res = await fetch(gasUrl, {
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      return { mags: [], prizes: [], services: [] };
    }

    const data = await res.json();

    return {
      mags: data.mags || [],
      prizes: data.prizes || [],
      services: data.services || []
    };

  } catch {

    return { mags: [], prizes: [], services: [] };

  }

}


/* ===========================
  SEO metadata
=========================== */

export async function generateMetadata({ params }: any) {

  const id = decodeURIComponent(params.magazine_id || "");

  return {

    title: `${id} 懸賞・アンケート・応募者全員サービスまとめ`,

    description:
      `${id}の懸賞情報、アンケートプレゼント、応募者全員サービスを掲載。締切や応募方法、AmazonやKindleの購入リンクも確認できます。`,

    keywords: [
      `${id} 懸賞`,
      `${id} アンケート`,
      `${id} プレゼント`,
      `${id} 応募者全員サービス`,
      `${id} 全プレ`
    ]

  };

}


/* ===========================
  Page
=========================== */

export default async function Page({ params }: any) {

  const id = decodeURIComponent(params.magazine_id || "");

  const data = await getFullData();

return (
  <MagazineDetailClient
    allData={data}
    magazineId={id}
  />
);

}