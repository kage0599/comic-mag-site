"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type Magazine = {
  magazine_id?: string;
  発売日?: string;
  タイトル?: string;
  値段?: string | number;
  表紙画像?: string;
  AmazonURL?: string;
  電子版URL?: string;
  R18?: string | boolean | number;
};

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL; // ✅これに統一

const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_VERSION = "v2";

type CachePayload = { v: string; savedAt: number; data: Magazine[] };

function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function makeCacheKey(gasUrl: string) {
  return `magazines_cache_${CACHE_VERSION}_${encodeURIComponent(gasUrl)}`;
}

export function useMagazines(options?: { forceRefresh?: boolean }) {
  const resolvedGasUrl = GAS_URL || ""; // undefined対策（エラー表示に回す）
  const cacheKey = useMemo(() => makeCacheKey(resolvedGasUrl || "missing_gas_url"), [resolvedGasUrl]);

  const [items, setItems] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchedOnceRef = useRef(false);

  useEffect(() => {
    if (fetchedOnceRef.current) return;
    fetchedOnceRef.current = true;

    if (!resolvedGasUrl) {
      setLoading(false);
      setError("GAS URL が未設定です（NEXT_PUBLIC_GAS_URL を環境変数に設定してください）");
      return;
    }

    const controller = new AbortController();

    // 1) cache即表示
    let cacheUsed = false;
    try {
      const raw = sessionStorage.getItem(cacheKey) || localStorage.getItem(cacheKey);
      if (raw) {
        const payload = safeJsonParse<CachePayload>(raw);
        if (payload && payload.v === CACHE_VERSION && Array.isArray(payload.data)) {
          setItems(payload.data);
          cacheUsed = true;

          const freshEnough = Date.now() - payload.savedAt < CACHE_TTL_MS;
          if (freshEnough && !options?.forceRefresh) setLoading(false);
        }
      }
    } catch {}

    // 2) TTL内ならfetch省略
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
        const url = `${resolvedGasUrl}?type=magazines`;
        const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const arr: Magazine[] = Array.isArray(data) ? data : [];

        if (!controller.signal.aborted) {
          setItems(arr);

          const payload: CachePayload = { v: CACHE_VERSION, savedAt: Date.now(), data: arr };

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
        setError("データ取得に失敗しました（GAS デプロイ/権限/URL を確認）");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [cacheKey, options?.forceRefresh, resolvedGasUrl]);

  return { items, loading, error };
}
