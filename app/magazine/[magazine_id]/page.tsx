// app/magazine/[magazine_id]/page.tsx
import MagazineDetailClient from "./MagazineDetailClient";

export const revalidate = 3600;
// GASから全データを一括取得する関数
async function getFullData() {
  const gasUrl = process.env.NEXT_PUBLIC_GAS_MAGAZINE_URL || process.env.NEXT_PUBLIC_GAS_URL;
  if (!gasUrl) return { mags: [], prizes: [], services: [] };

  try {
    const res = await fetch(gasUrl, { next: { revalidate: 3600 } });
    if (!res.ok) return { mags: [], prizes: [], services: [] };
    const data = await res.json();
    // 雑誌サイトの場合、JSONの構造に合わせて mags, prizes, services 等に分かれている前提
    // もし単一の配列なら適宜フィルターするロジックをここに書けますが、
    // クライアント側にまるごと渡して処理するのが最も確実です。
    return data;
  } catch (error) {
    return { mags: [], prizes: [], services: [] };
  }
}

export default async function Page() {
  const data = await getFullData();
  return <MagazineDetailClient allData={data} />;
}