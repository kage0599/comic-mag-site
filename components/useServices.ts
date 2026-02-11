"use client";

import { useEffect, useState } from "react";

export type Service = {
  service_id?: string;
  magazine_id?: string;
  内容?: string;
  応募方法?: string;
  締切?: string;
};

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL;
const CACHE_KEY = "services_cache_v1";

export function useServices() {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!GAS_URL) {
      setLoading(false);
      setError("GAS URL が未設定です（NEXT_PUBLIC_GAS_URL を環境変数に設定してください）");
      return;
    }

    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) setItems(JSON.parse(cached));
    } catch {}

    setLoading(true);
    setError("");

    fetch(`${GAS_URL}?type=services`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setItems(arr);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(arr));
        } catch {}
      })
      .catch(() => setError("全プレデータ取得に失敗しました（GAS デプロイ/権限 を確認）"))
      .finally(() => setLoading(false));
  }, []);

  return { items, loading, error };
}
