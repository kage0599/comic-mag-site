"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useFavorites } from "../components/useFavorites";
import A8Ad from "../components/A8Ad";

/** 雑誌名から号数やVol、季節などを除去して「誌名」だけにする関数 */
const getBaseName = (s: string) => {
  return s
    .replace(/\s*(\d+年|\d+号|Vol\..*|No\..*|\d+[\-/]\d+|WINTER|SPRING|SUMMER|AUTUMN|増刊|新年|特別).*$/i, "")
    .replace(/\(.*\)|（.*）/g, "")
    .trim();
};

function clean(v: unknown) { return String(v ?? "").trim(); }
function toYmd(v?: string) { return clean(v).replace(/\//g, "-").slice(0, 10); }
function toMonthKey(ymd: string) { return ymd.slice(0, 7); }
function ymNow() { return new Date().toISOString().slice(0, 7); }
function getHighRes(url?: string) {
  const s = clean(url);
  if (s.includes("amazon.com")) return s.replace(/\._S[LX]\d+_\./, "._SL500_.");
  if (s.includes("rakuten.co.jp")) return s.replace(/\?_ex=\d+x\d+/, "?_ex=500x500");
  return s;
}

export default function HomeClient({ initialItems }: { initialItems: any[] }) {
  const fav = useFavorites();
  const [monthKey, setMonthKey] = useState(ymNow());
  const [filterMag, setFilterMag] = useState("");
  const [q, setQ] = useState("");

  // ✅ 誌名だけで重複排除したリスト（絞り込み用）
  const magOptions = useMemo(() => {
    const names = initialItems.map(m => getBaseName(clean(m.タイトル || m.雑誌名)));
    return Array.from(new Set(names)).filter(Boolean).sort();
  }, [initialItems]);

  const filtered = useMemo(() => {
    return initialItems.filter(m => {
      const full = clean(m.タイトル || m.雑誌名);
      const base = getBaseName(full);
      const matchMonth = toMonthKey(toYmd(m.発売日)) === monthKey;
      const matchMag = filterMag ? base === filterMag : true;
      const matchSearch = q ? full.toLowerCase().includes(q.toLowerCase()) : true;
      return matchMonth && matchMag && matchSearch;
    }).sort((a, b) => toYmd(a.発売日).localeCompare(toYmd(b.発売日)));
  }, [initialItems, monthKey, filterMag, q]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px 40px" }}>
      <header style={{ padding: "24px 0" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>コミック誌発売日＆懸賞情報まとめ</h1>
        
        <div style={filterBar}>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="month" value={monthKey} onChange={(e) => setMonthKey(e.target.value)} style={selectBox} />
            <select value={filterMag} onChange={(e) => setFilterMag(e.target.value)} style={selectBox}>
              <option value="">全ての雑誌</option>
              {magOptions.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="誌名検索..." style={searchInput} />
        </div>
      </header>

      <div className="magGrid">
        {filtered.map((m, i) => {
          const title = clean(m.タイトル || m.雑誌名);
          return (
            <article key={i} style={card}>
              <Link href={`/magazine/${encodeURIComponent(m.magazine_id || title)}`} style={{ width: 85, flexShrink: 0 }}>
                <div style={imgWrap}>
                  <img src={getHighRes(m.表紙画像)} alt={title} style={imgStyle} loading="lazy" />
                </div>
              </Link>
              <div style={infoArea}>
                <div style={titleStyle}>{title}</div>
                <div style={metaStyle}>{toYmd(m.発売日)} / {m.値段}</div>
                <div style={btnRow}>
                  <button onClick={() => fav.toggle(title)} style={starBtn(fav.has(title))}>{fav.has(title) ? "★" : "☆"}</button>
                  {m.AmazonURL && <a href={m.AmazonURL} target="_blank" style={buyBtn}>Amazon</a>}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <style jsx>{`
        .magGrid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        @media (min-width: 800px) { .magGrid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
      `}</style>
    </div>
  );
}

const filterBar: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 };
const selectBox: React.CSSProperties = { padding: "8px", borderRadius: 8, border: "1px solid #ddd", fontWeight: 900, fontSize: 13, background: "#fff" };
const searchInput: React.CSSProperties = { flex: 1, minWidth: 150, padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13 };
const card: React.CSSProperties = { background: "#fff", borderRadius: 14, padding: 12, display: "flex", gap: 12, border: "1px solid #eee", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" };
const imgWrap: React.CSSProperties = { width: 85, aspectRatio: "3/4", borderRadius: 6, overflow: "hidden", border: "1px solid #f0f0f0" };
const imgStyle: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };
const infoArea: React.CSSProperties = { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" };
const titleStyle: React.CSSProperties = { fontSize: 13, fontWeight: 900, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" };
const metaStyle: React.CSSProperties = { fontSize: 11, color: "#888", marginTop: 4 };
const btnRow: React.CSSProperties = { display: "flex", gap: 6, marginTop: 8, alignItems: "center" };
const buyBtn: React.CSSProperties = { padding: "5px 10px", background: "#111", color: "#fff", borderRadius: 6, fontSize: 10, textDecoration: "none", fontWeight: 900 };
const starBtn = (a: boolean): React.CSSProperties => ({ width: 30, height: 30, borderRadius: 6, border: "1px solid #ddd", background: a ? "#111" : "#fff", color: a ? "#fff" : "#111", fontSize: 14, cursor: "pointer" });