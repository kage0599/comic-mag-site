"use client";

import { useEffect, useMemo, useState } from "react";
import { clean } from "./text";

const KEY = "applied_prizes_v1";

export function useAppliedPrizes() {
  const [set, setSet] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      setSet(new Set(arr.map(clean)));
    } catch {
      setSet(new Set());
    } finally {
      setReady(true);
    }
  }, []);

  function save(next: Set<string>) {
    setSet(new Set(next));
    try {
      localStorage.setItem(KEY, JSON.stringify(Array.from(next)));
    } catch {}
  }

  const api = useMemo(() => {
    return {
      ready,
      has: (id: string) => set.has(clean(id)),
      toggle: (id: string) => {
        const k = clean(id);
        if (!k) return;
        const next = new Set(set);
        if (next.has(k)) next.delete(k);
        else next.add(k);
        save(next);
      },
      clearAll: () => save(new Set()),
      count: set.size,
    };
  }, [ready, set]);

  return api;
}
