// app/HomeClient.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useFavorites } from "../components/useFavorites";
import A8Ad from "../components/A8Ad";

/** ===== 補助関数 ===== */
function clean(v: unknown) { return String(v ?? "").trim(); }
function toYmd(v?: string) { return clean(v).replace(/\//g, "-").slice(0, 10); }
function toMonthKey(ymd: string) { return ymd.slice(0, 7); }
function toDateNum(v?: string) {
  const s = toYmd(v);
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : NaN;
}
function formatMonthJp(monthKey: string) {
  const [y, m] = monthKey.split("-").map((x) => Number(x));
  return y && m ? `${y}年${m}月` : monthKey;
}
function formatDateJp(ymd: string) {
  const [y, m, d] = ymd.split("-").map((x) => Number(x));
  const dt = new Date(y, (m || 1) - 1, d || 1);
  const w = ["日", "月", "火", "水", "木", "金", "土"][dt.getDay()];
  return `${y}年${m}月${d}日（${w}）`;
}
function ymNowJst() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
function addMonths(ym: string, diff: number) {
  const [y, m] = ym.split("-").map((v) => Number(v));
  const dt = new Date(y, (m || 1) - 1, 1);
  dt.setMonth(dt.getMonth() + diff);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}
function getHighResCover(url?: string) {
  const s = clean(url);
  if (!s) return "";
  if (s.includes("amazon.com") || s.includes("m.media-amazon.com")) return s.replace(/\._S[LX]\d+_\./, "._SL500_.");
  if (s.includes("rakuten.co.jp")) return s.replace(/\?_ex=\d+x\d+/, "?_ex=500x500");
  return s;
}

export default function HomeClient({ initialItems }: { initialItems: any[] }) {
  const fav = useFavorites();
  const [monthKey, setMonthKey] = useState<string>(ymNowJst());
  const [filterMagazine, setFilterMagazine] = useState("");
  const [q, setQ] = useState("");
  const [searchAllMonths, setSearchAllMonths] = useState(false);

  // ✅ プルダウン用の雑誌リスト（誌名だけで重複排除）
  const magazineOptions = useMemo(() => {
    const names = initialItems.map(m => clean(m.雑誌名 || m.タイトル).replace(/\s*\d+年.*号/g, "").replace(/\s*\d+号/g, "").trim());
    return Array.from(new Set(names)).filter(Boolean).sort();
  }, [initialItems]);

  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    initialItems.forEach(m => {
      const ymd = toYmd(m.発売日);
      if (ymd) set.add(toMonthKey(ymd));
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [initialItems]);

  const filtered = useMemo(() => {
    const keyword = q.toLowerCase();
    return initialItems.filter(m => {
      const fullTitle = clean(m.タイトル || m.雑誌名);
      const shortTitle = fullTitle.replace(/\s*\d+年.*号/g, "").replace(/\s*\d+号/g, "").trim();
      const matchMonth = searchAllMonths || toMonthKey(toYmd(m.発売日)) === monthKey;
      const matchMag = filterMagazine ? shortTitle === filterMagazine : true;
      const matchSearch = keyword ? `${fullTitle} ${m.発売日}`.toLowerCase().includes(keyword) : true;
      return matchMonth && matchMag && matchSearch;
    }).sort((a, b) => (toDateNum(a.発売日) || 0) - (toDateNum(b.発売日) || 0));
  }, [initialItems, q, monthKey, filterMagazine, searchAllMonths]);

  const groupedByDate = useMemo(() => {
    const map = new Map<string, any[]>();
    filtered.forEach(m => {
      const ymd = toYmd(m.発売日) || "発売日不明";
      if (!map.has(ymd)) map.set(ymd, []);
      map.get(ymd)!.push(m);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "10px 16px" }}>
      {/* ⚠️ タブは layout.tsx にあるので、ここでは表示しない（二重防止） */}

      <header style={panel}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>コミック誌発売日＆懸賞</h1>
        
        <div style={filterBar}>
          <div style={monthNav}>
            <button onClick={() => setMonthKey(addMonths(monthKey, -1))} style={btnSoftCompact}>←先月</button>
            <button onClick={() => setMonthKey(ymNowJst())} style={btnSoftCompact}>今月</button>
            <button onClick={() => setMonthKey(addMonths(monthKey, 1))} style={btnSoftCompact}>来月→</button>
            <select value={monthKey} onChange={(e) => setMonthKey(e.target.value)} style={selectCompact}>
              {monthOptions.map(m => <option key={m} value={m}>{formatMonthJp(m)}</option>)}
            </select>
          </div>

          <div style={magSelectArea}>
            <select value={filterMagazine} onChange={(e) => setFilterMagazine(e.target.value)} style={selectCompact}>
              <option value="">全ての雑誌</option>
              {magazineOptions.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
            <label style={checkWrapCompact}><input type="checkbox" checked={searchAllMonths} onChange={(e) => setSearchAllMonths(e.target.checked)} /> 全月</label>
          </div>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="誌名・日付検索..." style={searchInput} />
          <div style={{ fontSize: 13, fontWeight: 900 }}>{filtered.length} 件</div>
        </div>
      </header>

      <div style={{ marginTop: 16 }}>
        <A8Ad htmlContent={`<a href="https://px.a8.net/svt/ejp?a8mat=4AZGCD+9TNIVU+4AHY+5Z6WX" rel="nofollow"><img border="0" width="468" height="60" alt="" src="https://www29.a8.net/svt/bgt?aid=260315005594&wid=002&eno=01&mid=s00000020023001004000&mc=1"></a>`} />
      </div>

      <section style={{ marginTop: 16 }}>
        {groupedByDate.map(([date, items]) => (
          <div key={date} style={{ marginBottom: 24 }}>
            <div style={dateHeading}>{date === "発売日不明" ? date : formatDateJp(date)}</div>
            
            {/* ✅ グリッド設定：スマホ2列 / PC3列 */}
            <div className="magGrid">
              {items.map((m, idx) => {
                const title = clean(m.タイトル || m.雑誌名);
                const isFav = fav.has(title);
                const hasPrize = clean(m.懸賞) !== "" && clean(m.懸賞) !== "なし";
                const isR18 = clean(m.R18) === "1" || clean(m.R18).toLowerCase() === "true";

                return (
                  <article key={idx} style={card}>
                    <Link href={`/magazine/${encodeURIComponent(m.magazine_id || title)}`} style={{ position: "absolute", inset: 0, zIndex: 1 }} />
                    
                    {/* 表紙画像エリア */}
                    <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", overflow: "hidden", borderRadius: 8 }}>
                      <img 
                        src={getHighResCover(m.表紙画像)} 
                        alt={title} 
                        style={{ 
                          width: "100%", 
                          height: "100%", 
                          objectFit: "cover",
                          // ✅ 18禁モザイク復活
                          filter: isR18 ? "blur(15px) brightness(0.8)" : "none" 
                        }} 
                        loading="lazy" 
                      />
                      {isR18 && <div style={r18Label}>R18</div>}
                    </div>

                    {/* 情報エリア */}
                    <div style={{ marginTop: 8, flex: 1, display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 4, alignItems: "flex-start" }}>
                        <div style={titleStyle}>{title}</div>
                        <button onClick={(e) => { e.preventDefault(); fav.toggle(title); }} style={starBtn(isFav)}>{isFav ? "★" : "☆"}</button>
                      </div>

                      <div style={{ marginTop: "auto" }}>
                        {hasPrize && <span style={prizeBadge}>🎁 懸賞</span>}
                        <div style={meta}>定価：{clean(m.値段) || "—"}</div>
                        
                        {/* 購入ボタン */}
                        <div style={buyRow} onClick={(e) => e.stopPropagation()}>
                          {m.AmazonURL && <a href={m.AmazonURL} target="_blank" rel="noreferrer" style={btnMiniDark}>Amazon</a>}
                          {m.販売サイトURL && <a href={m.販売サイトURL} target="_blank" rel="noreferrer" style={btnMiniBlue}>楽天</a>}
                        </div>
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
        .magGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr); /* ✅ デフォルト2列 */
          gap: 12px;
        }
        @media (min-width: 768px) {
          .magGrid {
            grid-template-columns: repeat(3, 1fr); /* ✅ PCは3列 */
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}

/** ===== スタイル定義 ===== */
const panel: React.CSSProperties = { background: "white", borderRadius: 16, padding: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.06)" };
const filterBar: React.CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12, alignItems: "center", justifyContent: "space-between" };
const monthNav: React.CSSProperties = { display: "flex", gap: 4, alignItems: "center" };
const magSelectArea: React.CSSProperties = { display: "flex", gap: 6, alignItems: "center" };
const btnSoftCompact: React.CSSProperties = { padding: "6px 8px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", fontWeight: 900, fontSize: 11, cursor: "pointer" };
const selectCompact: React.CSSProperties = { padding: "6px 8px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", fontWeight: 900, fontSize: 12 };
const checkWrapCompact: React.CSSProperties = { display: "inline-flex", gap: 4, alignItems: "center", fontWeight: 900, fontSize: 11, padding: "6px 8px", borderRadius: 8, border: "1px solid #ddd", background: "#fff" };
const searchInput: React.CSSProperties = { flex: 1, minWidth: 150, padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", fontSize: 13 };
const dateHeading: React.CSSProperties = { marginBottom: 12, fontSize: 16, fontWeight: 900, color: "#111", borderLeft: "4px solid #111", paddingLeft: 10, background: "#fff", padding: "8px 12px", borderRadius: "0 8px 8px 0" };
const card: React.CSSProperties = { position: "relative", background: "#fff", borderRadius: 12, padding: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", height: "100%" };
const titleStyle: React.CSSProperties = { fontWeight: 900, fontSize: 13, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" };
const prizeBadge: React.CSSProperties = { background: "#ff4757", color: "white", padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 900, marginBottom: 4, display: "inline-block" };
const meta: React.CSSProperties = { fontSize: 11, color: "#777" };
const buyRow: React.CSSProperties = { marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap", zIndex: 2, position: "relative" };
const btnMiniDark: React.CSSProperties = { flex: 1, padding: "5px", borderRadius: 6, background: "#111", color: "#fff", textDecoration: "none", fontSize: 10, fontWeight: 900, textAlign: "center" };
const btnMiniBlue: React.CSSProperties = { flex: 1, padding: "5px", borderRadius: 6, background: "#f1f3f6", color: "#111", border: "1px solid #ddd", textDecoration: "none", fontSize: 10, fontWeight: 900, textAlign: "center" };
const r18Label: React.CSSProperties = { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 18, textShadow: "0 2px 4px rgba(0,0,0,0.5)" };
function starBtn(active: boolean): React.CSSProperties { return { width: 28, height: 28, borderRadius: 999, border: "1px solid #ddd", background: active ? "#111" : "#fff", color: active ? "#fff" : "#111", cursor: "pointer", fontSize: 14, flexShrink: 0, zIndex: 2, position: "relative" }; }