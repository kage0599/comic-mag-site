import MagazineDetailClient from "./MagazineDetailClient";

export const revalidate = 3600;

/* ===========================
  SEO metadata
=========================== */
export async function generateMetadata({ params }: any) {
  const id = decodeURIComponent(params.magazine_id || "");

  return {
    title: `${id} 懸賞・アンケート・応募者全員サービスまとめ`,
    description: `${id}の懸賞情報、アンケートプレゼント、応募者全員サービスを掲載。締切や応募方法、AmazonやKindleの購入リンクも確認できます。`,
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
export default function Page() {
  // データの取得は MagazineDetailClient の中で行うようになったため、
  // ここではコンポーネントを呼び出すだけでOKです！
  return <MagazineDetailClient />;
}