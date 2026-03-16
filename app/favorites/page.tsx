// app/favorites/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useMagazines, type Magazine } from "../../components/useMagazines";
import { useFavorites } from "../../components/useFavorites";

function clean(v: unknown) { return String(v ?? "").trim(); }

function getHighRes(url?: string) {
  const s = clean(url);
  if (s.includes("amazon.com")) return s.replace(/\._S[LX]\d+_\./, "._SL500_.");
  if (s.includes("rakuten.co.jp")) return s.replace(/\?_ex=\d+x\d+/, "?_ex=500x500");
  return s;
}

function dateNum(v?: string) {
  const t = Date.parse(clean(v).replace(/\//g, "-"));
  return Number.isFinite(t) ? t : 0;
}

export default function FavoritesPage() {

  const { items, loading } = useMagazines();
  const fav = useFavorites();

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"new" | "old">("new");

  const favoriteItems = useMemo(() => {

    let arr = items.filter((m: Magazine) => {
      const mAny = m as any;
      const title = clean(mAny.タイトル || mAny.雑誌名);
      return fav.has(title);
    });

    if (query) {
      arr = arr.filter((m: Magazine) => {
        const mAny = m as any;
        const title = clean(mAny.タイトル || mAny.雑誌名);
        return title.includes(query);
      });
    }

    arr.sort((a: Magazine, b: Magazine) => {
      const aAny = a as any;
      const bAny = b as any;
      const diff = dateNum(bAny.発売日) - dateNum(aAny.発売日);
      return sort === "new" ? diff : -diff;
    });

    return arr;

  }, [items, fav, query, sort]);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "10px 16px 40px" }}>

      <header style={{ padding: "24px 0" }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>★ お気に入り雑誌</h1>

        <div style={{ marginTop: 6, fontSize: 13, color: "#555", fontWeight: 900 }}>
          登録数：<b>{favoriteItems.length}</b> 件
        </div>

        <div style={toolBar}>
          <input
            placeholder="お気に入り検索"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={search}
          />

          <select value={sort} onChange={(e) => setSort(e.target.value as any)} style={select}>
            <option value="new">発売日（新しい順）</option>
            <option value="old">発売日（古い順）</option>
          </select>
        </div>
      </header>

      {loading ? (
        <div style={{ padding: 20, color: "#888" }}>読み込み中...</div>

      ) : favoriteItems.length === 0 ? (

        <div style={emptyBox}>
          <p style={{ margin: 0, color: "#666" }}>お気に入りに登録された雑誌はありません。</p>

          <Link
            href="/"
            style={{
              display: "inline-block",
              marginTop: 12,
              color: "#2b6cff",
              fontWeight: 900,
              textDecoration: "none"
            }}
          >
            発売日一覧から探す →
          </Link>
        </div>

      ) : (

        <div className="magGrid">

          {favoriteItems.map((m: Magazine, i: number) => {

            const mAny = m as any;

            const title = clean(mAny.タイトル || mAny.雑誌名);
            const img = clean(mAny.表紙画像);
            const amazonUrl = clean(mAny.AmazonURL);

            return (

              <article key={i} style={card}>

                <Link
                  href={`/magazine/${encodeURIComponent(mAny.magazine_id || title)}`}
                  style={{ width: 100, flexShrink: 0 }}
                >

                  <div style={imgWrap}>
                    <img
                      src={getHighRes(img)}
                      alt={title}
                      style={imgStyle}
                      loading="lazy"
                    />
                  </div>

                </Link>

                <div style={infoArea}>

                  <div style={titleStyle}>{title}</div>

                  <div style={metaStyle}>
                    {clean(mAny.発売日)} / {clean(mAny.値段)}
                  </div>

                  <div style={btnRow}>

                    <button
                      onClick={() => fav.toggle(title)}
                      style={starBtn}
                    >
                      ★
                    </button>

                    {amazonUrl && (
                      <a
                        href={amazonUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={buyBtn}
                      >
                        Amazon
                      </a>
                    )}

                  </div>

                </div>

              </article>

            );

          })}

        </div>

      )}

      <style jsx>{`
        .magGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 768px) {
          .magGrid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

    </main>
  );
}

/* UI */

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 14,
  display: "flex",
  gap: 14,
  border: "1px solid #eee",
  boxShadow: "0 3px 10px rgba(0,0,0,0.04)"
};

const imgWrap: React.CSSProperties = {
  width: 100,
  aspectRatio: "3/4",
  borderRadius: 8,
  overflow: "hidden",
  border: "1px solid #eee"
};

const imgStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

const infoArea: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between"
};

const titleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 900,
  lineHeight: 1.35,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden"
};

const metaStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#777",
  marginTop: 4
};

const btnRow: React.CSSProperties = {
  display: "flex",
  gap: 8,
  marginTop: 10,
  alignItems: "center"
};

const buyBtn: React.CSSProperties = {
  padding: "6px 12px",
  background: "#111",
  color: "#fff",
  borderRadius: 6,
  fontSize: 11,
  textDecoration: "none",
  fontWeight: 900
};

const starBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 6,
  border: "1px solid #ddd",
  background: "#111",
  color: "#fff",
  fontSize: 15,
  cursor: "pointer"
};

const toolBar: React.CSSProperties = {
  marginTop: 12,
  display: "flex",
  gap: 10,
  flexWrap: "wrap"
};

const search: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: 13
};

const select: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: 13,
  fontWeight: 900
};

const emptyBox: React.CSSProperties = {
  padding: "40px 20px",
  textAlign: "center",
  background: "#fff",
  borderRadius: 16,
  border: "1px dashed #ccc"
};