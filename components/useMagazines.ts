"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  "https://script.google.com/macros/s/AKfycbxchM93nj5pVK_sGz-gaMjOnxDBYIJ5DAbKkUoyj1iveZy3UVul3fZcuGyJkHT6aYuLsw/exec";

// キャッシュTTL（例：10分） ※更新頻度に合わせて調整OK
const CACHE_TTL_MS = 10 * 60 * 1000;

// バージョンを変えるとキャッシュが自動で作り直される
const CACHE_VERSION = "v2";

// storageに入れる形
type CachePayload = {
  v: string;
  savedAt: number;
  data: Magazine[];
};

function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function makeCacheKey(gasUrl: string) {
  // GASのURLが変わってもキャッシュが混ざらないようにする
  return `magazines_cache_${CACHE_VERSION}_${encodeURIComponent(gasUrl)}`;
}

export function useMagazines(options?: { forceRefresh?: boolean }) {
  const cacheKey = useMemo(() => makeCacheKey(GAS_URL), []);
  const [items, setItems] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // StrictMode(開発)でeffectが2回走っても多重fetchしないため
  const fetchedOnceRef = useRef(false);

  useEffect(() => {
    // 開発環境StrictModeの二重実行対策
    if (fetchedOnceRef.current) return;
    fetchedOnceRef.current = true;

    const controller = new AbortController();

    // 1) まずキャッシュがあれば即表示（体感速度UP）
    let cacheUsed = false;
    try {
      const raw = sessionStorage.getItem(cacheKey) || localStorage.getItem(cacheKey);
      if (raw) {
        const payload = safeJsonParse<CachePayload>(raw);
        if (payload && payload.v === CACHE_VERSION && Array.isArray(payload.data)) {
          setItems(payload.data);
          cacheUsed = true;

          const freshEnough = Date.now() - payload.savedAt < CACHE_TTL_MS;
          // キャッシュが十分新しければ、読み込み中を短くする
          if (freshEnough && !options?.forceRefresh) {
            setLoading(false);
          }
        }
      }
    } catch {
      // 何もしない（ストレージが使えない環境でも動かす）
    }

    // 2) 裏で最新を取得して差し替え（SWR）
    // TTL内で forceRefresh でもないなら fetchを省略してOK
    if (!options?.forceRefresh) {
      try {
        const raw = sessionStorage.getItem(cacheKey) || localStorage.getItem(cacheKey);
        const payload = raw ? safeJsonParse<CachePayload>(raw) : null;
        const freshEnough = payload ? Date.now() - payload.savedAt < CACHE_TTL_MS : false;
        if (freshEnough) return () => controller.abort();
      } catch {}
    }

    if (!cacheUsed) setLoading(true);
    setError("");

    (async () => {
      try {
        // cache: "no-store" で「ブラウザが古いレスポンスを握り続ける」を防止
        const url = `${GAS_URL}?type=magazines`;
        const res = await fetch(url, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const arr: Magazine[] = Array.isArray(data) ? data : [];

        if (!controller.signal.aborted) {
          setItems(arr);

          const payload: CachePayload = {
            v: CACHE_VERSION,
            savedAt: Date.now(),
            data: arr,
          };

          // sessionStorage優先（高速・容量も十分）、失敗したらlocalStorageへ
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(payload));
          } catch {
            try {
              localStorage.setItem(cacheKey, JSON.stringify(payload));
            } catch {}
          }
        }
      } catch (e) {
        if (controller.signal.aborted) return;
        setError("データ取得に失敗しました（GAS デプロイ/権限/URL を確認）");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [cacheKey, options?.forceRefresh]);

  return { items, loading, error };
}
