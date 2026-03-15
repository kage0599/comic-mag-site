"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useFavorites } from "../components/useFavorites";
import A8Ad from "../components/A8Ad";

/** 補助関数 */
const clean = (v: any) => String(v ?? "").trim();
const toYmd = (v?: string) => clean(v).replace(/\//g, "-").slice(0, 10);
const toMonthKey = (ymd: string) => ymd.slice(0, 7);
const ymNow = () => new Date().toISOString().slice(0, 7);
const addMonths = (ym: string, d: number) => {
  const [y, m] = ym.split("-").map(Number);
  const dt = new Date(y, m - 1 + d, 1);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
};
const getHighRes = (url?: string) => {
  const s = clean(url);
  if (s.includes("amazon.com")) return s.replace(/\._S[LX]\d+_\./, "._SL500_.");
  if (s.includes("rakuten.co.jp")) return s.replace(/\?_ex=\d+x\d+/, "?_ex=500x500");
  return s;
};

export default function HomeClient({ initialItems }: { initialItems: any[] }) {
  const fav = useFavorites();
  const [monthKey, setMonthKey] = useState(ymNow());
  const [q, setQ] = useState("");
  const [searchAll, setSearchAll] = useState(false);

  const filtered = useMemo(() => {
    return initialItems.filter(m => {
      const matchMonth = searchAll || toMonthKey(toYmd(m.発売日)) === monthKey;
      const matchSearch = q ? clean(m.タイトル).toLowerCase().includes(q.toLowerCase()) : true;
      return matchMonth && matchSearch;
    }).sort((a, b) => toYmd(a.発売日).localeCompare(toYmd(b.発売日)));
  }, [initialItems, monthKey, q, searchAll]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach(m => {
      const d = toYmd(m.発売日) || "発売日不明";
      if (!map.has(d)) map.set(d, []);
      map.get(d).push(m);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px 60px" }}>
      
      {/* ✅ ナビゲーションパネル（スクショ再現） */}
      <header style={controlPanel}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>発売日一覧</h2>
            <div style={{ fontSize: 12, color: "#666" }}>表示中｜{monthKey.replace("-", "年")}月</div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button onClick={() => setMonthKey(addMonths(monthKey, -1))} style={btnNav}>←先月</button>
            <button onClick={() => setMonthKey(ymNow())} style={btnNav}>今月</button>
            <button onClick={() => setMonthKey(addMonths(monthKey, 1))} style={btnNav}>来月→</button>
            <input type="month" value={monthKey} onChange={e => setMonthKey(e.target.value)} style={monthInput} />
            <label style={{ fontSize: 12, fontWeight: 900, display: "flex", alignItems: "center", gap: 4 }}>
              <input type="checkbox" checked={searchAll} onChange={e => setSearchAll(e.target.checked)} /> 全月表示
            </label>
          </div>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <input 
            value={q} 
            onChange={e => setQ(e.target.value)} 
            placeholder="誌名・日付（タイトル） / 発売日（例 2026-01-05）" 
            style={searchInput} 
          />
          <button onClick={() => setQ("")} style={btnNav}>クリア</button>
          <div style={{ fontSize: 12, fontWeight: 900, display: "flex", alignItems: "center" }}>件数：{filtered.length}</div>
        </div>
      </header>

      <section style={{ marginTop: 24 }}>
        {grouped.map(([date, items]) => (
          <div key={date} style={{ marginBottom: 30 }}>
            <div style={dateHeader}>{date}</div>
            <div className="responsiveGrid">
              {items.map((m: any, i: number) => {
                const title = clean(m.タイトル);
                const isR18 = clean(m.R18) === "1" || clean(m.R18).toLowerCase() === "true";
                const hasPrize = clean(m.懸賞) !== "" && clean(m.懸賞) !== "なし";
                
                return (
                  <article key={i} style={card}>
                    {/* 画像エリア */}
                    <Link href={`/magazine/${encodeURIComponent(m.magazine_id || title)}`} style={{ width: 110, flexShrink: 0, position: "relative" }}>
                      <img 
                        src={getHighRes(m.表紙画像)} 
                        alt={title} 
                        style={{ ...imgStyle, filter: isR18 ? "blur(15px)" : "none" }} 
                      />
                      {isR18 && <div style={r18Tag}>R18</div>}
                    </Link>

                    {/* 情報エリア */}
                    <div style={infoArea}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <div style={titleStyle}>{title}</div>
                        <button onClick={() => fav.toggle(title)} style={starBtn(fav.has(title))}>{fav.has(title) ? "★" : "☆"}</button>
                      </div>
                      
                      <div style={metaStyle}>
                        {hasPrize && <span style={prizeBadge}>🎁 懸賞あり</span>}
                        <div>価格：{m.値段}</div>
                      </div>

                      <div style={buyRow}>
                        {m.AmazonURL && <a href={m.AmazonURL} target="_blank" style={btnAmazon}>Amazon</a>}
                        {m.電子版URL && <a href={m.電子版URL} target="_blank" style={btnDigital}>電子版</a>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <style jsx>{`
        .responsiveGrid {
          display: grid;
          grid-template-columns: 1fr; /* ✅ スマホは1列 */
          gap: 12px;
        }
        @media (min-width: 768px) {
          .responsiveGrid {
            grid-template-columns: 1fr 1fr; /* ✅ PCは2列 */
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}

/** スタイル設定 */
const controlPanel: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #eee" };
const btnNav: React.CSSProperties = { padding: "6px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", fontSize: 12, fontWeight: 900, cursor: "pointer" };
const monthInput: React.CSSProperties = { padding: "5px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, fontWeight: 900 };
const searchInput: React.CSSProperties = { flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: 13 };
const dateHeader: React.CSSProperties = { fontSize: 16, fontWeight: 900, marginBottom: 12, paddingBottom: 6, borderBottom: "2px solid #111" };
const card: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: 12, display: "flex", gap: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0" };
const imgStyle: React.CSSProperties = { width: "100%", height: "auto", borderRadius: 8, border: "1px solid #eee", objectFit: "cover" };
const infoArea: React.CSSProperties = { flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" };
const titleStyle: React.CSSProperties = { fontSize: 14, fontWeight: 900, lineHeight: 1.4, wordBreak: "break-all" };
const metaStyle: React.CSSProperties = { fontSize: 12, color: "#666", marginTop: 4 };
const prizeBadge: React.CSSProperties = { background: "#fff2cc", color: "#d6a300", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 900, border: "1px solid #ffe599", display: "inline-block", marginBottom: 4 };
const buyRow: React.CSSProperties = { display: "flex", gap: 6, justifyContent: "flex-end", marginTop: 10 };
const btnAmazon: React.CSSProperties = { padding: "6px 12px", background: "#111", color: "#fff", borderRadius: 6, fontSize: 11, fontWeight: 900, textDecoration: "none" };
const btnDigital: React.CSSProperties = { padding: "6px 12px", background: "#2b6cff", color: "#fff", borderRadius: 6, fontSize: 11, fontWeight: 900, textDecoration: "none" };
const r18Tag: React.CSSProperties = { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.2)", color: "#fff", fontWeight: 900, fontSize: 14, borderRadius: 8 };
const starBtn = (a: boolean): React.CSSProperties => ({ width: 32, height: 32, borderRadius: 999, border: "1px solid #ddd", background: a ? "#111" : "#fff", color: a ? "#fff" : "#111", fontSize: 14, cursor: "pointer", flexShrink: 0 });