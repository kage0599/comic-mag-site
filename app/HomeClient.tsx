"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useFavorites } from "../components/useFavorites";
import A8Ad from "../components/A8Ad";

/** 補助関数 */
const clean = (v: any) => String(v ?? "").trim();
const toYmd = (v?: string) => clean(v).replace(/\//g, "-").slice(0, 10);
const toMonthKey = (ymd: string) => ymd.slice(0, 7);

const formatDateJP = (ymd: string) => {
  if (!ymd || ymd === "発売日不明") return ymd;
  const [y, m, d] = ymd.split("-");
  return `${Number(y)}年${Number(m)}月${Number(d)}日`;
};

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
  if (!s) return "";
  if (s.includes("amazon")) return s.replace(/\._S[LX]\d+_\./, "._SL500_.");
  if (s.includes("rakuten")) return s.replace(/\?_ex=\d+x\d+/, "?_ex=500x500");
  return s;
};

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

  const magOptions = useMemo(() => {
    const names = initialItems.map(m => getBaseName(clean(m.タイトル)));
    return Array.from(new Set(names)).filter(Boolean).sort();
  }, [initialItems]);

  const filtered = useMemo(() => {
    return initialItems
      .filter(m => {
        const fullTitle = clean(m.タイトル);
        const baseName = getBaseName(fullTitle);

        const matchMonth = toMonthKey(toYmd(m.発売日)) === monthKey;
        const matchMag = filterMag ? baseName === filterMag : true;
        const matchSearch = q
          ? fullTitle.toLowerCase().includes(q.toLowerCase())
          : true;

        return matchMonth && matchMag && matchSearch;
      })
      .sort((a, b) => toYmd(a.発売日).localeCompare(toYmd(b.発売日)));
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
      <header style={controlPanel}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>
              発売日一覧
            </h1>
            <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>
              表示中｜{monthKey.replace("-", "年")}月
            </div>
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setMonthKey(addMonths(monthKey, -1))} style={btnNav}>←先月</button>
            <button onClick={() => setMonthKey(ymNow())} style={btnNav}>今月</button>
            <button onClick={() => setMonthKey(addMonths(monthKey, 1))} style={btnNav}>来月→</button>
            <input type="month" value={monthKey} onChange={e => setMonthKey(e.target.value)} style={monthInput}/>
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <select value={filterMag} onChange={e => setFilterMag(e.target.value)} style={selectBox}>
            <option value="">全ての雑誌</option>
            {magOptions.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="キーワード検索..."
            style={searchInput}
          />

          <button onClick={() => { setQ(""); setFilterMag(""); }} style={btnNav}>
            クリア
          </button>
        </div>

        <div style={{ marginTop: 12, fontSize: 13, fontWeight: 900 }}>
          件数：{filtered.length}件
        </div>
      </header>

      <div style={{ marginTop: 20 }}>
        <A8Ad htmlContent={`<a href="https://px.a8.net/svt/ejp?a8mat=4AZGCD+9TNIVU+4AHY+5Z6WX" rel="nofollow"><img border="0" width="468" height="60" src="https://www29.a8.net/svt/bgt?aid=260315005594&wid=002&eno=01&mid=s00000020023001004000&mc=1"></a>`}/>
      </div>

      <section style={{ marginTop: 24 }}>
        {grouped.map(([date, items]) => (
          <div key={date} style={{ marginBottom: 30 }}>
            <div style={dateHeader}>{formatDateJP(date)}</div>

            <div className="responsiveGrid">
              {items.map((m: any, i: number) => {
                const title = clean(m.タイトル);
                const imgUrl = getHighRes(m.表紙画像);
                const detailHref = `/magazine/${encodeURIComponent(m.magazine_id || title)}`;

                return (
                  <article key={i} style={card}>
                    <Link href={detailHref} style={{ width: 110, flexShrink: 0 }}>
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={title}
                          style={imgStyle}
                          loading="lazy"
                        />
                      ) : (
                        <div style={imgStyle}>No Image</div>
                      )}
                    </Link>

                    <div style={infoArea}>
                      <div>
                        <div style={titleStyle}>{title}</div>
                        <div style={priceStyle}>価格：{clean(m.値段) || "—"}</div>
                      </div>

                      <div style={btnContainer}>
                        <Link href={detailHref} style={prizeBtn}>
                          🎁 懸賞情報はこちら
                        </Link>

                        <div style={buyRow}>
                          {m.AmazonURL && (
                            <a href={m.AmazonURL} target="_blank" rel="noreferrer" style={btnAmazon}>
                              Amazon
                            </a>
                          )}
                          {m.電子版URL && (
                            <a href={m.電子版URL} target="_blank" rel="noreferrer" style={btnDigital}>
                              電子版
                            </a>
                          )}
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
        .responsiveGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .responsiveGrid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}

/** スタイル */
const controlPanel: React.CSSProperties = {background:"#fff",borderRadius:16,padding:20,border:"1px solid #eee"};
const btnNav: React.CSSProperties = {padding:"8px 12px",borderRadius:8,border:"1px solid #ddd",background:"#fff",fontWeight:900};
const monthInput: React.CSSProperties = {padding:"7px 10px",borderRadius:8,border:"1px solid #ddd"};
const selectBox: React.CSSProperties = {padding:"10px",borderRadius:8,border:"1px solid #ddd"};
const searchInput: React.CSSProperties = {flex:1,padding:"10px",borderRadius:8,border:"1px solid #ddd"};
const dateHeader: React.CSSProperties = {fontSize:21,fontWeight:900,marginBottom:16,borderBottom:"2px solid #111"};
const card: React.CSSProperties = {background:"#fff",borderRadius:16,padding:14,display:"flex",gap:16,border:"1px solid #eee"};
const imgStyle: React.CSSProperties = {
  width:"100%",
  aspectRatio:"3/4",
  borderRadius:8,
  border:"1px solid #eee",
  objectFit:"contain",   // ← 見切れ防止
  background:"#fff"
};
const infoArea: React.CSSProperties = {flex:1,display:"flex",flexDirection:"column",justifyContent:"space-between"};
const titleStyle: React.CSSProperties = {fontSize:16,fontWeight:900};
const priceStyle: React.CSSProperties = {fontSize:13,fontWeight:900,marginTop:4};
const btnContainer: React.CSSProperties = {display:"flex",flexDirection:"column",gap:8,marginTop:12};
const prizeBtn: React.CSSProperties = {padding:"8px",background:"#fff4ce",borderRadius:8,textDecoration:"none",fontWeight:900};
const buyRow: React.CSSProperties = {display:"flex",gap:8,justifyContent:"flex-end"};
const btnAmazon: React.CSSProperties = {padding:"8px 16px",background:"#111",color:"#fff",borderRadius:8,textDecoration:"none"};
const btnDigital: React.CSSProperties = {padding:"8px 16px",background:"#2b6cff",color:"#fff",borderRadius:8,textDecoration:"none"};