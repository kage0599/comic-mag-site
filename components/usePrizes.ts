// app/components/usePrizes.ts
"use client";

import { useEffect, useState } from "react";

export type Prize = {
  prize_id?: string;
  magazine_id?: string;
  懸賞名?: string;
  内容?: string;
  応募方法?: string;
  締切?: string;
  応募URL?: string;
};

// ✅ 他のhooksと統一：環境変数を使う
const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL!;
const CACHE_KEY = "prizes_cache_v2"; // v1→v2にして壊れたキャッシュを避ける

function safeJsonParse<T>(s: string): T | null {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

export function usePrizes() {
  const [items, setItems] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1) 先にキャッシュがあれば即表示（体感速度UP）
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const arr = safeJsonParse<Prize[]>(cached);
        if (Array.isArray(arr)) setItems(arr);
      }
    } catch {}

    // 2) 裏で最新取得（タイムアウト/キャンセル対応）
    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), 15000); // 15秒で中断

    (async () => {
      try {
        setLoading(true);
        setError("");

        // ✅ 必ず type=prizes を付ける
        const url = `${GAS_URL}?type=prizes`;

        const res = await fetch(url, {
          cache: "no-store",
          signal: ac.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];

        setItems(arr);

        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(arr));
        } catch {}
      } catch (e: any) {
        // Abort（タイムアウト/画面遷移）なら静かに
        if (e?.name === "AbortError") return;
        setError("懸賞データ取得に失敗しました（GAS URL / デプロイ / 権限 を確認）");
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    })();

    return () => {
      clearTimeout(timeout);
      ac.abort();
    };
  }, []);

  return { items, loading, error };
}
