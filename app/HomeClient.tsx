"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useFavorites } from "../components/useFavorites";
import A8Ad from "../components/A8Ad";

/** 補助関数 */
const clean = (v: any) => String(v ?? "").trim();
const toYmd = (v?: string) => clean(v).replace(/\//g, "-").slice(0, 10);
const toMonthKey = (ymd: string) => ymd.slice(0, 7);
const ymNow = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};
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

/** ✅ 号数や季節表記などを除去して「純粋な誌名」にする（絞り込み用） */
const getBaseName = (s: string) => {
  return s
    .replace(/\s*(\d+年.*号|\d+号|Vol\..*|No\..*|\d+[\-/]\d+|WINTER|SPRING|SUMMER|AUTUMN|増刊|新年|特別).*$/i, "")
    .replace(/\(.*\)|（.*）/g, "")
    .trim();
};

export default function HomeClient({ initialItems }: { initialItems: any[] }) {
  const fav = useFavorites();
  const [monthKey, setMonthKey] = useState(ymNow());
  const [filterMag, setFilterMag] = useState("");
  const [q, setQ] = useState("");

  // ✅ 新しい列名「タイトル」のみで名寄せを行うように修正
  const magOptions = useMemo(() => {
    const names = initialItems.map(m => getBaseName(clean(m.タイトル)));
    return Array.from(new Set(names)).filter(Boolean).sort();
  }, [initialItems]);

  const filtered = useMemo(() => {
    return initialItems.filter(m => {
      const fullTitle = clean(m.タイトル);
      const baseName = getBaseName(fullTitle);
      
      const matchMonth = toMonthKey(toYmd(m.発売日)) === monthKey;
      const matchMag = filterMag ? baseName === filterMag : true;
      const matchSearch = q ? fullTitle.toLowerCase().includes(q.toLowerCase()) : true;
      
      return matchMonth && matchMag && matchSearch;
    }).sort((a, b) => toYmd(a.発売日).localeCompare(toYmd(b.発売日)));
  }, [initialItems, monthKey, filterMag, q]);

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
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "10px 16px 60px" }}>
      
      {/* ===== コントロールパネル ===== */}
      <header style={controlPanel}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>発売日一覧</h1>
            <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>表示中｜{monthKey.replace("-", "年")}月</div>
          </div>
          
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => setMonthKey(addMonths(monthKey, -1))} style={btnNav}>←先月</button>
            <button onClick={() => setMonthKey(ymNow())} style={btnNav}>今月</button>
            <button onClick={() => setMonthKey(addMonths(monthKey, 1))} style={btnNav}>来月→</button>
            <input type="month" value={monthKey} onChange={e => setMonthKey(e.target.value)} style={monthInput} />
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select value={filterMag} onChange={(e) => setFilterMag(e.target.value)} style={selectBox}>
            <option value="">全ての雑誌を表示</option>
            {magOptions.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          
          <input 
            value={q} 
            onChange={e => setQ(e.target.value)} 
            placeholder="キーワード検索..." 
            style={searchInput} 
          />
          <button onClick={() => { setQ(""); setFilterMag(""); }} style={btnNav}>クリア</button>
        </div>
        
        <div style={{ marginTop: 12, fontSize: 13, fontWeight: 900, color: "#444" }}>
          件数：{filtered.length} 件
        </div>
      </header>

      <div style={{ marginTop: 20 }}>
        <A8Ad htmlContent={`<a href="https://px.a8.net/svt/ejp?a8mat=4AZGCD+9TNIVU+4AHY+5Z6WX" rel="nofollow"><img border="0" width="468" height="60" alt="" src="https://www29.a8.net/svt/bgt?aid=260315005594&wid=002&eno=01&mid=s00000020023001004000&mc=1"></a>`} />
      </div>

      <section style={{ marginTop: 24 }}>
        {grouped.length === 0 ? (
          <div style={emptyBox}>条件に一致する雑誌がありません。</div>
        ) : (
          grouped.map(([date, items]) => (
            <div key={date} style={{ marginBottom: 30 }}>
              <div style={dateHeader}>{date.replace(/-/g, " / ")}</div>
              
              <div className="responsiveGrid">
                {items.map((m: any, i: number) => {
                  // ✅ 新しい列名に合わせて変数を取得
                  const title = clean(m.タイトル);
                  const isR18 = clean(m.R18) === "1" || clean(m.R18).toLowerCase() === "true";
                  
                  return (
                    <article key={i} style={card}>
                      <Link href={`/magazine/${encodeURIComponent(m.magazine_id || title)}`} style={{ width: 110, flexShrink: 0, position: "relative" }}>
                        <img 
                          src={getHighRes(m.表紙画像)} 
                          alt={title} 
                          style={{ ...imgStyle, filter: isR18 ? "blur(15px)" : "none" }} 
                          loading="lazy"
                        />
                        {isR18 && <div style={r18Tag}>R18</div>}
                      </Link>

                      <div style={infoArea}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                          <div style={titleStyle}>{title}</div>
                          <button onClick={() => fav.toggle(title)} style={starBtn(fav.has(title))}>
                            {fav.has(title) ? "★" : "☆"}
                          </button>
                        </div>
                        
                        <div style={metaStyle}>
                          {/* ✅ 懸賞列がなくなったためバッジは非表示にし、出版社と値段のみ表示 */}
                          <div><b>出版社：</b>{clean(m.出版社) || "—"}</div>
                          <div><b>価　格：</b>{clean(m.値段) || "—"}</div>
                        </div>

                        <div style={buyRow}>
                          {/* ✅ 列名通り「AmazonURL」「電子版URL」でリンクを生成 */}
                          {m.AmazonURL && <a href={m.AmazonURL} target="_blank" rel="noreferrer" style={btnAmazon}>Amazon</a>}
                          {m.電子版URL && <a href={m.電子版URL} target="_blank" rel="noreferrer" style={btnDigital}>電子版</a>}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </section>

      <style jsx>{`
        .responsiveGrid {
          display: grid;
          grid-template-columns: 1fr; /* スマホ1列 */
          gap: 16px;
        }
        @media (min-width: 768px) {
          .responsiveGrid {
            grid-template-columns: 1fr 1fr; /* PC2列 */
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
}

/** ===== スタイル設定 ===== */
const controlPanel: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid #eee" };
const btnNav: React.CSSProperties = { padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", fontSize: 13, fontWeight: 900, cursor: "pointer" };
const monthInput: React.CSSProperties = { padding: "7px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, fontWeight: 900 };
const selectBox: React.CSSProperties = { padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, fontWeight: 900, background: "#fff" };
const searchInput: React.CSSProperties = { flex: 1, minWidth: 150, padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 };
const dateHeader: React.CSSProperties = { fontSize: 18, fontWeight: 900, marginBottom: 16, paddingBottom: 8, borderBottom: "2px solid #111", color: "#111" };
const card: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: 14, display: "flex", gap: 16, boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #eee" };
const imgStyle: React.CSSProperties = { width: "100%", height: "auto", aspectRatio: "3/4", borderRadius: 8, border: "1px solid #eee", objectFit: "cover", background: "#f9f9f9" };
const infoArea: React.CSSProperties = { flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" };
const titleStyle: React.CSSProperties = { fontSize: 16, fontWeight: 900, lineHeight: 1.4, wordBreak: "break-all", color: "#111" };
const metaStyle: React.CSSProperties = { fontSize: 13, color: "#555", marginTop: 8, display: "grid", gap: 6 };
const buyRow: React.CSSProperties = { display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 };
const btnAmazon: React.CSSProperties = { padding: "8px 16px", background: "#111", color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 900, textDecoration: "none" };
const btnDigital: React.CSSProperties = { padding: "8px 16px", background: "#2b6cff", color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 900, textDecoration: "none" };
const r18Tag: React.CSSProperties = { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.2)", color: "#fff", fontWeight: 900, fontSize: 16, borderRadius: 8, zIndex: 2 };
const starBtn = (a: boolean): React.CSSProperties => ({ width: 36, height: 36, borderRadius: 999, border: "1px solid #ddd", background: a ? "#111" : "#fff", color: a ? "#fff" : "#111", fontSize: 16, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" });
const emptyBox: React.CSSProperties = { padding: 40, textAlign: "center", background: "#fff", borderRadius: 16, border: "1px dashed #ccc", color: "#888" };