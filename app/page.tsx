// app/page.tsx
import HomeClient from "./HomeClient";

// 💡 1時間ごとに裏側でデータを更新（ISR）
export const revalidate = 1800;

async function getMagazines() {
  const gasUrl = process.env.NEXT_PUBLIC_GAS_MAGAZINE_URL || process.env.NEXT_PUBLIC_GAS_URL;
  if (!gasUrl) return [];

  try {
    const res = await fetch(gasUrl, { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    return [];
  }
}

export default async function Page() {
  const initialItems = await getMagazines();
  // データを画面側のコンポーネントに渡す
  return <HomeClient initialItems={initialItems} />;
}