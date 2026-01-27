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

const GAS_URL = "https://script.google.com/macros/s/AKfycbxchM93nj5pVK_sGz-gaMjOnxDBYIJ5DAbKkUoyj1iveZy3UVul3fZcuGyJkHT6aYuLsw/exec";
const CACHE_KEY = "prizes_cache_v1";

export function usePrizes() {
  const [items, setItems] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) setItems(JSON.parse(cached));
    } catch {}

    setLoading(true);
    setError("");

    fetch(`${GAS_URL}?type=prizes`)
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setItems(arr);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(arr));
        } catch {}
      })
      .catch(() => setError("懸賞データ取得に失敗しました（GAS デプロイ/権限 を確認）"))
      .finally(() => setLoading(false));
  }, []);

  return { items, loading, error };
}
