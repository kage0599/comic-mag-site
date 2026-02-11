// app/components/useServices.ts
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type Service = {
  service_id?: string;
  magazine_id?: string;
  内容?: string;
  応募方法?: string;
  締切?: string;
};

// ✅ 環境変数に統一（.env.local に NEXT_PUBLIC_GAS_URL を設定）
const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL!;

// キャッシュTTL（例：10分）
const CACHE_TTL_MS = 10 * 60 * 1000;

// バージョンを変えるとキャッシュが自動で作り直される
const CACHE_VERSION = "v2";

type CachePayload = {
  v: string;
  savedAt: number;
  data: Service[];
};

function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function makeCacheKey(gasUrl: string) {
  return `services_cache_${CACHE_VERSION}_${encodeURIComponent(gasUrl)}`;
}

export function useServices(options?: { forceRefresh?: boolean }) {
  const forceRefresh = !!options?.forceRefresh;

  const cacheKey = useMemo(() => makeCacheKey(GAS_URL), []);
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ StrictMode(開発)でeffectが2回走っても多重fetchしない
  const fetchedOnceRef = useRef(false);

  useEffect(() => {
    if (fetchedOnceRef.current) return;
    fetchedOnceRef.current = true;

    const controller = new AbortController();

    // ✅ 15秒タイムアウト
    const timeout = setTimeout(() => controller.abort(), 15000);

    // 1) キャッシュがあれば即表示
    let cacheUsed = false;
    try {
      const raw = sessionStorage.getItem(cacheKey) || localStorage.getItem(cacheKey);
      if (raw) {
        const payload = safeJsonParse<CachePayload>(raw);
        if (payload && payload.v === CACHE_VERSION && Array.isArray(payload.data)) {
          setItems(payload.data);
          cacheUsed = true;

          const freshEnough = Date.now() - payload.savedAt < CACHE_TTL_MS;
          if (freshEnough && !forceRefresh) {
            setLoading(false);
          }
        }
      }
    } catch {}

    // 2) TTL内なら fetch 省略（forceRefresh時は必ず取りに行く）
    if (!forceRefresh) {
      try {
        const raw = sessionStorage.getItem(cacheKey) || localStorage.getItem(cacheKey);
        const payload = raw ? safeJsonParse<CachePayload>(raw) : null;
        const freshEnough = payload ? Date.now() - payload.savedAt < CACHE_TTL_MS : false;
        if (freshEnough) {
          clearTimeout(timeout);
          return () => controller.abort();
        }
      } catch {}
    }

    if (!cacheUsed) setLoading(true);
    setError("");

    (async () => {
      try {
        const url = `${GAS_URL}?type=services`;
        const res = await fetch(url, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const arr: Service[] = Array.isArray(data) ? data : [];

        if (!controller.signal.aborted) {
          setItems(arr);

          const payload: CachePayload = {
            v: CACHE_VERSION,
            savedAt: Date.now(),
            data: arr,
          };

          // sessionStorage優先、ダメならlocalStorage
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(payload));
          } catch {
            try {
              localStorage.setItem(cacheKey, JSON.stringify(payload));
            } catch {}
          }
        }
      } catch {
        if (controller.signal.aborted) return;
        setError("全プレデータ取得に失敗しました（GAS デプロイ/権限/URL を確認）");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
        clearTimeout(timeout);
      }
    })();

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [cacheKey, forceRefresh]);

  return { items, loading, error };
}
