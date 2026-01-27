"use client";

import { useEffect, useState } from "react";

export type Service = {
  service_id?: string;
  magazine_id?: string;
  内容?: string;
  応募方法?: string;
  締切?: string;
};

const GAS_URL = "https://script.google.com/macros/s/AKfycbxchM93nj5pVK_sGz-gaMjOnxDBYIJ5DAbKkUoyj1iveZy3UVul3fZcuGyJkHT6aYuLsw/exec";
const CACHE_KEY = "services_cache_v1";

export function useServices() {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) setItems(JSON.parse(cached));
    } catch {}

    setLoading(true);
    setError("");

    fetch(`${GAS_URL}?type=services`)
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
