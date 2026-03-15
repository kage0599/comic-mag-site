// app/HomeClient.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useFavorites } from "../components/useFavorites";
import A8Ad from "../components/A8Ad";
import TopLeftTabs from "../components/TopTabs"; // 👈 タブの見た目を統一

/** ===== utils ===== */
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
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
}

// ✅ 画像を高画質化する関数
function getHighResCover(url?: string) {
  const s = clean(url);
  if (!s) return "";
  if (s.includes("amazon.com") || s.includes("m.media-amazon.com")) return s.replace(/\._S[LX]\d+_\./, "._SL500_.");
  if (s.includes("rakuten.co.jp")) return s.replace(/\?_ex=\d+x\d+/, "?_ex=500x500");
  return s;
}

export default function HomeClient({ initialItems }: { initialItems: any[] }) {
  const fav = useFavorites();

  // ✅ 初期表示を「今月」にする
  const [monthKey, setMonthKey] = useState<string>(ymNowJst());
  const [filterMagazine, setFilterMagazine] = useState(""); // 雑誌名絞り込み用
  const [q, setQ] = useState("");
  const [searchAllMonths, setSearchAllMonths] = useState(false);

  // 雑誌名の選択肢を自動生成
  const magazineOptions = useMemo(() => {
    const names = initialItems.map(m => clean(m.タイトル || m.雑誌名)).filter(Boolean);
    return Array.from(new Set(names)).sort();
  }, [initialItems]);

  // データがある月の一覧
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
      const mTitle = clean(m.タイトル || m.雑誌名);
      const matchMonth = searchAllMonths || toMonthKey(toYmd(m.発売日)) === monthKey;
      const matchMag = filterMagazine ? mTitle === filterMagazine : true;
      const matchSearch = keyword ? `${mTitle} ${m.発売日}`.toLowerCase().includes(keyword) : true;
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
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      {/* 👈 トップタブを表示 */}
      <div style={{ marginBottom: 16 }}><TopLeftTabs /></div>

      <header style={panel}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>コミック誌発売日＆懸賞</h1>
        
        {/* ✅ 日付選択 & 雑誌絞り込みバー */}
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
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="キーワード検索..." style={searchInput} />
          <div style={{ fontSize: 13, fontWeight: 900 }}>{filtered.length} 件</div>
        </div>
      </header>

      {/* A8広告 */}
      <div style={{ marginTop: 16 }}>
        <A8Ad htmlContent={`<a href="https://px.a8.net/svt/ejp?a8mat=4AZGCD+9TNIVU+4AHY+5Z6WX" rel="nofollow"><img border="0" width="468" height="60" alt="" src="https://www29.a8.net/svt/bgt?aid=260315005594&wid=002&eno=01&mid=s00000020023001004000&mc=1"></a>`} />
      </div>

      <section style={{ marginTop: 16 }}>
        {groupedByDate.map(([date, items]) => (
          <div key={date} style={{ marginBottom: 20 }}>
            <div style={dateHeading}>{date === "発売日不明" ? date : formatDateJp(date)}</div>
            <div className="grid2">
              {items.map((m, idx) => {
                const title = clean(m.タイトル || m.雑誌名);
                const isFav = fav.has(title);
                const hasPrize = clean(m.懸賞) !== "" && clean(m.懸賞) !== "なし";
                
                return (
                  <article key={idx} style={card}>
                    <Link href={`/magazine/${encodeURIComponent(m.magazine_id || title)}`} style={{ position: "absolute", inset: 0, zIndex: 1 }} />
                    
                    <div style={{ width: 110, flexShrink: 0, zIndex: 2, position: "relative" }}>
                      <img src={getHighResCover(m.表紙画像)} alt={title} style={cover} loading="lazy" />
                    </div>

                    <div style={{ flex: 1, minWidth: 0, zIndex: 2, position: "relative", display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={titleStyle}>{title}</div>
                          {/* ✅ 懸賞あり表記 */}
                          {hasPrize && <span style={prizeBadge}>🎁 懸賞あり</span>}
                        </div>
                        {/* ✅ お気に入りボタン */}
                        <button onClick={(e) => { e.preventDefault(); fav.toggle(title); }} style={starBtn(isFav)}>{isFav ? "★" : "☆"}</button>
                      </div>

                      <div style={meta}><div>値段：{clean(m.値段) || "—"}</div></div>

                      {/* ✅ 購入ボタン位置をタイトル・値段のすぐ下に移動（画像高さに合わせる） */}
                      <div style={buyRow} onClick={(e) => e.stopPropagation()}>
                        {m.AmazonURL && <a href={m.AmazonURL} target="_blank" rel="noreferrer" style={btnMiniDark}>Amazon</a>}
                        {m.販売サイトURL && <a href={m.販売サイトURL} target="_blank" rel="noreferrer" style={btnMiniBlue}>楽天</a>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

/** ===== styles ===== */
const panel: React.CSSProperties = { background: "white", borderRadius: 16, padding: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.06)" };
const filterBar: React.CSSProperties = { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16, alignItems: "center", justifyContent: "space-between" };
const monthNav: React.CSSProperties = { display: "flex", gap: 6, alignItems: "center", overflowX: "auto" };
const magSelectArea: React.CSSProperties = { display: "flex", gap: 6, alignItems: "center" };
const btnSoftCompact: React.CSSProperties = { padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", fontWeight: 900, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" };
const selectCompact: React.CSSProperties = { padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", fontWeight: 900, fontSize: 13 };
const checkWrapCompact: React.CSSProperties = { display: "inline-flex", gap: 4, alignItems: "center", fontWeight: 900, fontSize: 12, padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", whiteSpace: "nowrap" };
const searchInput: React.CSSProperties = { flex: 1, minWidth: 200, padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd", background: "#fff", fontSize: 14 };
const dateHeading: React.CSSProperties = { marginBottom: 12, fontSize: 17, fontWeight: 900, color: "#111", borderLeft: "4px solid #111", paddingLeft: 10 };
const card: React.CSSProperties = { position: "relative", background: "#fff", borderRadius: 16, padding: 14, boxShadow: "0 6px 20px rgba(0,0,0,0.06)", display: "flex", gap: 12 };
const cover: React.CSSProperties = { width: "100%", height: "auto", borderRadius: 10, border: "1px solid #eee" };
const titleStyle: React.CSSProperties = { fontWeight: 900, fontSize: 15, lineHeight: 1.3, marginBottom: 4 };
const prizeBadge: React.CSSProperties = { background: "#fff2cc", color: "#d6a300", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 900, border: "1px solid #ffe599", display: "inline-block" };
const meta: React.CSSProperties = { fontSize: 12, color: "#666", marginTop: 4 };
const buyRow: React.CSSProperties = { marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" };
const btnMiniDark: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 12px", borderRadius: 8, background: "#111", color: "#fff", textDecoration: "none", fontSize: 11, fontWeight: 900 };
const btnMiniBlue: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 12px", borderRadius: 8, background: "#f1f3f6", color: "#111", border: "1px solid #ddd", textDecoration: "none", fontSize: 11, fontWeight: 900 };
function starBtn(active: boolean): React.CSSProperties { return { width: 34, height: 34, borderRadius: 999, border: "1px solid #ddd", background: active ? "#111" : "#fff", color: active ? "#fff" : "#111", cursor: "pointer", fontSize: 15, flexShrink: 0 }; }