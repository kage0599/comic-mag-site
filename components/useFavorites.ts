// app/components/useFavorites.ts
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "comic_mag_fav_v1";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setFavorites(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggle = useCallback((title: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  const has = useCallback((title: string) => favorites.has(title), [favorites]);

  return { has, toggle, list: Array.from(favorites) };
}