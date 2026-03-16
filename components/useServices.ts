"use client";

import { useEffect, useMemo, useState } from "react";

export type Service = {
  service_id?: string;
  magazine_id?: string;
  内容?: string;
  応募方法?: string;
  締切?: string;
};

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL;
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_VERSION = "v2_services"; // キャッシュのバージョンを更新

type CachePayload = { v: string; savedAt: number; data: Service[] };

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
  const resolvedGasUrl = GAS_URL || "";
  const cacheKey = useMemo(() => makeCacheKey(resolvedGasUrl || "missing_gas_url"), [resolvedGasUrl]);

  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!resolvedGasUrl) {
      setLoading(false);
      setError("GAS URL が未設定です");
      return;
    }

    const controller = new AbortController();

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
          if (freshEnough && !options?.forceRefresh) {
            setLoading(false);
          }
        }
      }
    } catch {}

    // 2) キャッシュが新しければ通信をスキップ
    if (!options?.forceRefresh) {
      try {
        const raw = sessionStorage.getItem(cacheKey) || localStorage.getItem(cacheKey);
        const payload = raw ? safeJsonParse<CachePayload>(raw) : null;
        const freshEnough = payload ? Date.now() - payload.savedAt < CACHE_TTL_MS : false;
        if (freshEnough) {
          return () => controller.abort();
        }
      } catch {}
    }

    if (!cacheUsed) setLoading(true);
    setError("");

    // 3) GASからデータを取得
    (async () => {
      try {
        const url = `${resolvedGasUrl}?type=services`;
        const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        
        // ★最大の修正ポイント：データが { services: [...] } だった場合に対応
        const arr: Service[] = Array.isArray(data) ? data : (data.services || []);

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
      } catch (err) {
        if (controller.signal.aborted) return;
        setError("全プレデータ取得に失敗しました");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [cacheKey, options?.forceRefresh, resolvedGasUrl]);

  return { items, loading, error };
}