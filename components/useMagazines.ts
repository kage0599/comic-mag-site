"use client";

import { useEffect, useState } from "react";

export type Magazine = {
  magazine_id?: string;
  発売日?: string; // "yyyy-mm-dd" or "yyyy/mm/dd" など
  タイトル?: string;
  値段?: string | number;
  表紙画像?: string;
  AmazonURL?: string;
  電子版URL?: string;
  R18?: string | boolean | number; // true/1/"TRUE"/"R18" など想定
};

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbxchM93nj5pVK_sGz-gaMjOnxDBYIJ5DAbKkUoyj1iveZy3UVul3fZcuGyJkHT6aYuLsw/exec"; // ←ここをあなたのGASに変更（末尾/execまで）

const CACHE_KEY = "magazines_cache_v1";

export function useMagazines() {
  const [items, setItems] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 先にキャッシュ表示
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) setItems(JSON.parse(cached));
    } catch {}

    setLoading(true);
    setError("");

    fetch(`${GAS_URL}?type=magazines`)
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setItems(arr);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(arr));
        } catch {}
      })
      .catch(() => setError("データ取得に失敗しました（GAS デプロイ/権限 を確認）"))
      .finally(() => setLoading(false));
  }, []);

  return { items, loading, error };
}
