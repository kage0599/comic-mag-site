"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useFavorites } from "../components/useFavorites";
import A8Ad from "../components/A8Ad";

/* =========================
雑誌リスト（完全一致用）
========================= */
const MAGAZINE_LIST = [
  "週刊少年ジャンプ", "ヤングマガジン", "ビッグコミックスピリッツ", "ヤングキングbull", "ヤングキング",
  "別冊ヤングチャンピオン", "漫画アクション", "ヤングチャンピオン", "ヤングチャンピオン烈",
  "週刊少年マガジン", "週刊少年サンデー", "グランドジャンプ", "グランドジャンプめちゃ", "グランドジャンプむちゃ",
  "週刊少年チャンピオン", "ヤングジャンプ", "モーニング",
  "週刊漫画TIMES", "週刊漫画ゴラク", "ヤングガンガン", "ヤングアニマル", "ビッグコミックスペリオール",
  "コミックホットミルク", "まんがホーム", "ちゃお", "りぼん", "なかよし", "最強ジャンプ", "ジャンプSQ",
  "ヤングエース", "コミックフラッパー", "COMIC 夢幻転生", "プレミアCheese!", "姉系プチコミック",
  "LaLaDX", "マーガレット", "Sho-Comi", "花とゆめ", "ビッグコミックオリジナル",
  "月刊少年マガジン", "月刊少年チャンピオン", "月刊プリンセス", "ミステリーボニータ",
  "まんがタイム", "good!アフタヌーン", "プチコミック", "FEEL YOUNG",
  "別冊少年マガジン", "月刊ドラゴンエイジ", "まんがタイムきらら", "ヤングアニマルZERO",
  "ヤングコミック", "Newtype", "コンプティーク", "LaLa DX", "ビッグコミック",
  "まんがライフオリジナル", "月刊少年ガンガン", "ゲッサン", "コミックビーム",
  "コミックアンリアル", "ビッグコミックオリジナル増刊",
  "別冊フレンド", "ベツコミ", "別冊マーガレット", "コミック乱ツインズ",
  "Comicアンスリウム", "COMIC快楽天BEAST", "月刊コロコロコミック",
  "別冊少年チャンピオン", "月刊コミックジーン", "コミックアルナ",
  "月刊Gファンタジー", "コミック百合姫", "ウルトラジャンプ",
  "チャンピオンRED", "まんがタイムきららMAX", "月刊サンデーGX",
  "月刊ヤングマガジン", "コロコロイチバン!", "Vジャンプ",
  "アクションピザッツ", "COMIC LO", "月刊ガンガンJOKER", "COMIC BAVEL",
  "COMIC MILF", "Cheese!", "LaLa", "デザート", "コミック真激",
  "まんがタイムきららフォワード", "デラックスベツコミ", "コミックマショウ",
  "Kiss", "週刊少年サンデーS", "月刊ビッグガンガン", "月刊アフタヌーン",
  "月刊コミックゼノン", "ガンダムエース", "月刊少年シリウス",
  "月刊コンプエース", "月刊少年エース", "Cookie", "ヤングドラゴンエイジ",
  "コミック乱", "電撃マオウ", "月刊コミック電撃大王", "コミック電撃だいおうじ",
  "まんがタイムオリジナル", "コミックキューン", "月刊!スピリッツ",
  "月刊ComicREX", "月刊コミックアライブ", "ココハナ", "月刊flowers",
  "コミックZERO-SUM", "まんがタイムきららキャラット", "MELODY", "COMIC阿呍",
  "コミックヘヴン", "COMIC快楽天", "COMIC E×E", "ヤングキングアワーズ",
  "BE・LOVE", "ANGEL倶楽部", "近代麻雀", "COMICペンギンクラブ", "COMICルクセリア",
  "電撃萌王","ビッグコミック増刊号","ジャンプGIGA","ジャンプSQ.RISE","ザ花とゆめ","増刊flowers","プチコミック増刊号"
];

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

const formatDateJP = (ymd: string) => {
  if (!ymd || ymd === "発売日不明") return ymd;
  const parts = ymd.split("-");
  if (parts.length < 3) return ymd;
  return `${Number(parts[0])}年${Number(parts[1])}月${Number(parts[2])}日`;
};

const detectMagazine = (title: string) => {
  for (const name of MAGAZINE_LIST) {
    if (title.startsWith(name)) return name;
  }
  return "";
};

const getHighRes = (url?: string) => {
  const s = clean(url);
  if (!s) return "";
  if (s.includes("amazon")) return s.replace(/\._S[LX]\d+_\./, "._SL500_.");
  return s;
};

interface Item {
  タイトル: string;
  発売日: string;
  表紙画像?: string;
  magazine_id?: string;
  R18?: string | boolean;
  値段?: string;
  AmazonURL?: string;
  電子版URL?: string;
}

export default function HomeClient({ initialItems = [] }: { initialItems: Item[] }) {
  const fav = useFavorites();
  const [monthKey, setMonthKey] = useState(ymNow());
  const [filterMag, setFilterMag] = useState("");
  const [q, setQ] = useState("");
  const [showAllMonths, setShowAllMonths] = useState(false);

  const filtered = useMemo(() => {
    return initialItems
      .filter(m => {
        const fullTitle = clean(m.タイトル);
        const baseName = detectMagazine(fullTitle);
        const matchMonth = showAllMonths || toMonthKey(toYmd(m.発売日)) === monthKey;
        const matchMag = filterMag ? baseName === filterMag : true;
        const matchSearch = q ? fullTitle.toLowerCase().includes(q.toLowerCase()) : true;
        return matchMonth && matchMag && matchSearch;
      })
      .sort((a, b) => toYmd(a.発売日).localeCompare(toYmd(b.発売日)));
  }, [initialItems, monthKey, filterMag, q, showAllMonths]);

  const grouped = useMemo(() => {
    const map = new Map<string, Item[]>();
    filtered.forEach(m => {
      const d = toYmd(m.発売日) || "発売日不明";
      if (!map.has(d)) map.set(d, []);
      map.get(d)?.push(m);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "10px 16px 60px" }}>
      <header style={controlPanel}>
        {/* 上段：日付操作 */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setMonthKey(addMonths(monthKey, -1))} style={btnNav}>←先月</button>
            <button onClick={() => setMonthKey(ymNow())} style={btnNav}>今月</button>
            <button onClick={() => setMonthKey(addMonths(monthKey, 1))} style={btnNav}>来月→</button>
          </div>
          <input type="month" value={monthKey} onChange={e => setMonthKey(e.target.value)} style={monthInput} />
        </div>

        {/* 下段：フィルターと検索 */}
        <div className="filterArea">
          <div className="filterRow">
            <select value={filterMag} onChange={e => setFilterMag(e.target.value)} style={selectBox}>
              <option value="">全ての雑誌</option>
              {MAGAZINE_LIST.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <label style={checkboxLabel}>
              <input type="checkbox" checked={showAllMonths} onChange={e => setShowAllMonths(e.target.checked)} />
              <span style={{ whiteSpace: "nowrap" }}>全月表示</span>
            </label>
          </div>

          <div className="searchRow">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="キーワード検索..."
              style={searchInput}
            />
            <button onClick={() => { setQ(""); setFilterMag(""); }} style={btnNav}>クリア</button>
          </div>
        </div>
      </header>

      {/* 広告②：ヘッダー（検索パネル）のすぐ下（順番を上に移動しました） */}
      <div style={{ marginTop: 24 }}>
        <A8Ad htmlContent={`
          <a href="https://px.a8.net/svt/ejp?a8mat=4AZOWQ+10BI82+13X8+61RI9" rel="nofollow">
          <img border="0" width="468" height="60" alt="" src="https://www23.a8.net/svt/bgt?aid=260326106061&wid=003&eno=01&mid=s00000005174001016000&mc=1"></a>
          <img border="0" width="1" height="1" src="https://www12.a8.net/0.gif?a8mat=4AZOWQ+10BI82+13X8+61RI9" alt="">
        `} />
      </div>

      <section style={{ marginTop: 24 }}>
        {grouped.map(([date, items]) => (
          <div key={date} style={{ marginBottom: 40 }}>
            <h2 style={dateHeader}>{formatDateJP(date)}</h2>
            <div className="responsiveGrid">
              {items.map((m, i) => {
                const title = clean(m.タイトル);
                const imgUrl = getHighRes(m.表紙画像);
                const detailHref = `/magazine/${encodeURIComponent(m.magazine_id || title)}`;
                const isR18 = clean(m.R18) === "1" || clean(m.R18).toLowerCase() === "true";

                return (
                  <article key={i} style={card}>
                    <Link href={detailHref} style={{ width: 100, flexShrink: 0, position: "relative" }}>
                      <img src={imgUrl} alt={title} style={{ ...imgStyle, filter: isR18 ? "blur(15px)" : "none" }} />
                      {isR18 && <div style={r18Tag}>R18</div>}
                    </Link>
                    <div style={infoArea}>
                      <div>
                        <div style={titleStyle}>{title}</div>
                        <div style={priceStyle}>価格：{clean(m.値段) || "—"}</div>
                      </div>
                      <div style={btnContainer}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <button onClick={() => fav.toggle(title)} style={starBtn(fav.has(title))}>
                            {fav.has(title) ? "★" : "☆"}
                          </button>
                          <div style={buyRow}>
                            {m.AmazonURL && <a href={m.AmazonURL} target="_blank" rel="noreferrer" style={btnAmazon}>Amazon</a>}
                            {m.電子版URL && <a href={m.電子版URL} target="_blank" rel="noreferrer" style={btnKindle}>Kindle</a>}
                          </div>
                        </div>
                        <Link href={detailHref} style={prizeBtn}> 懸賞情報はこちら</Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* 広告①：リストの一番下（順番を下に移動しました） */}
      <div style={{ marginTop: 40, marginBottom: 20 }}>
        <A8Ad htmlContent={`<a href="https://px.a8.net/svt/ejp?a8mat=4AZGCD+9TNIVU+4AHY+5Z6WX" rel="nofollow"><img border="0" width="468" height="60" src="https://www29.a8.net/svt/bgt?aid=260315005594&wid=002&eno=01&mid=s00000020023001004000&mc=1"></a>`} />
      </div>

      <style jsx>{`
        .filterArea {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .filterRow, .searchRow {
          display: flex;
          gap: 8px;
          align-items: center;
          width: 100%;
        }
        .responsiveGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 768px) {
          .filterArea {
            flex-direction: row;
          }
          .filterRow { width: auto; }
          .responsiveGrid {
            grid-template-columns: 1fr 1fr;
          }
        }

        /* スマホ時でも横並びを維持する設定 */
        @media (max-width: 640px) {
          .filterRow select {
            flex: 1; /* 雑誌選択を広げる */
            min-width: 0;
          }
          .searchRow input {
            flex: 1; /* 検索窓を広げる */
          }
        }
      `}</style>
    </div>
  );
}

/* =========================
スタイル
========================= */
const controlPanel: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: "16px",
  border: "1px solid #eee",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
};
const btnNav: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  fontSize: "14px"
};
const monthInput: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: "14px"
};
const selectBox: React.CSSProperties = {
  padding: "10px",
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: "14px",
  background: "#f9f9f9"
};
const searchInput: React.CSSProperties = {
  padding: "10px",
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: "14px"
};
const checkboxLabel: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  fontSize: "12px",
  fontWeight: 900,
  cursor: "pointer",
  padding: "0 4px"
};
const dateHeader: React.CSSProperties = {
  fontSize: 19,
  fontWeight: 900,
  marginBottom: 16,
  borderBottom: "2px solid #111",
  paddingBottom: "4px"
};
const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 12,
  display: "flex",
  gap: 12,
  border: "1px solid #eee"
};
const imgStyle: React.CSSProperties = {
  width: "100%",
  aspectRatio: "3/4",
  borderRadius: 8,
  objectFit: "contain",
  background: "#fff"
};
const r18Tag: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontWeight: 900,
  background: "rgba(0,0,0,0.4)",
  borderRadius: 8,
  pointerEvents: "none"
};
const infoArea: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between"
};
const titleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 900,
  lineHeight: 1.3
};
const priceStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#666",
  marginTop: 4
};
const btnContainer: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  marginTop: 8
};
const prizeBtn: React.CSSProperties = {
  padding: "6px",
  background: "#fff4ce",
  borderRadius: 6,
  textDecoration: "none",
  fontWeight: 900,
  textAlign: "center",
  fontSize: 12,
  color: "#333"
};
const buyRow: React.CSSProperties = {
  display: "flex",
  gap: 4
};
const btnAmazon: React.CSSProperties = {
  padding: "5px 8px",
  background: "#111",
  color: "#fff",
  borderRadius: 6,
  fontSize: 10,
  textDecoration: "none"
};
const btnKindle: React.CSSProperties = {
  padding: "5px 8px",
  background: "#ff9900",
  color: "#fff",
  borderRadius: 6,
  fontSize: 10,
  textDecoration: "none"
};
const starBtn = (active: boolean): React.CSSProperties => ({
  width: 32,
  height: 32,
  borderRadius: 999,
  border: "1px solid #ddd",
  background: active ? "#111" : "#fff",
  color: active ? "#fff" : "#111",
  fontSize: 14,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
});