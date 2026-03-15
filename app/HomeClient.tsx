"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useFavorites } from "../components/useFavorites";
import A8Ad from "../components/A8Ad";

/* =========================
補助関数
========================= */

const clean = (v: any): string => String(v ?? "").trim();

const toYmd = (v?: string): string =>
  clean(v).replace(/\//g, "-").slice(0, 10);

const toMonthKey = (ymd: string): string =>
  ymd.slice(0, 7);

const formatDateJP = (ymd: string): string => {
  if (!ymd || ymd === "発売日不明") return ymd;
  const parts = ymd.split("-");
  if (parts.length < 3) return ymd;
  const [y, m, d] = parts;
  return `${Number(y)}年${Number(m)}月${Number(d)}日`;
};

const ymNow = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
};

const addMonths = (ym: string, d: number): string => {
  const [y, m] = ym.split("-").map(Number);
  const dt = new Date(y, m - 1 + d, 1);
  return `${dt.getFullYear()}-${String(
    dt.getMonth() + 1
  ).padStart(2, "0")}`;
};

const getHighRes = (url?: string): string => {
  const s = clean(url);
  if (!s) return "";

  if (s.includes("amazon"))
    return s.replace(/\._S[LX]\d+_\./, "._SL500_.");

  if (s.includes("rakuten"))
    return s.replace(/\?_ex=\d+x\d+/, "?_ex=500x500");

  return s;
};

const getBaseName = (s: string): string => {
  return s
    .replace(
      /\s*(\d+年.*号|\d+号|Vol\..*|No\..*|\d+[\-/]\d+|WINTER|SPRING|SUMMER|AUTUMN|増刊|新年|特別).*$/i,
      ""
    )
    .replace(/\(.*\)|（.*）/g, "")
    .trim();
};

/* =========================
メイン
========================= */

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

export default function HomeClient({
  initialItems = [],
}: {
  initialItems: Item[];
}) {
  const fav = useFavorites();

  const [monthKey, setMonthKey] = useState(ymNow());
  const [filterMag, setFilterMag] = useState("");
  const [q, setQ] = useState("");

  const magOptions = useMemo(() => {
    const names = initialItems.map((m) =>
      getBaseName(clean(m.タイトル))
    );

    return Array.from(new Set(names))
      .filter(Boolean)
      .sort();
  }, [initialItems]);

  const filtered = useMemo(() => {
    return initialItems
      .filter((m) => {
        const fullTitle = clean(m.タイトル);
        const baseName = getBaseName(fullTitle);

        const matchMonth =
          toMonthKey(toYmd(m.発売日)) === monthKey;

        const matchMag = filterMag
          ? baseName === filterMag
          : true;

        const matchSearch = q
          ? fullTitle
              .toLowerCase()
              .includes(q.toLowerCase())
          : true;

        return (
          matchMonth && matchMag && matchSearch
        );
      })
      .sort((a, b) =>
        toYmd(a.発売日).localeCompare(
          toYmd(b.発売日)
        )
      );
  }, [initialItems, monthKey, filterMag, q]);

  const grouped = useMemo(() => {
    const map = new Map<string, Item[]>();

    filtered.forEach((m) => {
      const d = toYmd(m.発売日) || "発売日不明";

      if (!map.has(d)) map.set(d, []);
      map.get(d)?.push(m);
    });

    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "10px 16px 60px",
      }}
    >
      <header style={controlPanel}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>
            発売日一覧
          </h1>

          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() =>
                setMonthKey(addMonths(monthKey, -1))
              }
              style={btnNav}
            >
              ←先月
            </button>

            <button
              onClick={() => setMonthKey(ymNow())}
              style={btnNav}
            >
              今月
            </button>

            <button
              onClick={() =>
                setMonthKey(addMonths(monthKey, 1))
              }
              style={btnNav}
            >
              来月→
            </button>

            <input
              type="month"
              value={monthKey}
              onChange={(e) =>
                setMonthKey(e.target.value)
              }
              style={monthInput}
            />
          </div>
        </div>

        <div className="searchArea">
          <select
            value={filterMag}
            onChange={(e) =>
              setFilterMag(e.target.value)
            }
            style={selectBox}
          >
            <option value="">全ての雑誌</option>
            {magOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <div className="searchRow">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="キーワード検索..."
              style={searchInput}
            />

            <button
              onClick={() => {
                setQ("");
                setFilterMag("");
              }}
              style={btnNav}
            >
              クリア
            </button>
          </div>
        </div>
      </header>

      <div style={{ marginTop: 20 }}>
        <A8Ad htmlContent={`<a href="https://px.a8.net/svt/ejp?a8mat=4AZGCD+9TNIVU+4AHY+5Z6WX" rel="nofollow"><img border="0" width="468" height="60" src="https://www29.a8.net/svt/bgt?aid=260315005594&wid=002&eno=01&mid=s00000020023001004000&mc=1"></a>`}/>
      </div>

      <section style={{ marginTop: 24 }}>
        {grouped.map(([date, items]) => (
          <div key={date} style={{ marginBottom: 30 }}>
            <div style={dateHeader}>
              {formatDateJP(date)}
            </div>

            <div className="responsiveGrid">
              {items.map((m, i) => {
                const title = clean(m.タイトル);
                const imgUrl = getHighRes(m.表紙画像);
                const detailHref = `/magazine/${encodeURIComponent(m.magazine_id || title)}`;
                const isR18 = clean(m.R18) === "1" || clean(m.R18).toLowerCase() === "true";

                return (
                  <article key={i} style={card}>
                    <Link
                      href={detailHref}
                      style={{
                        width: 110,
                        flexShrink: 0,
                        position: "relative",
                      }}
                    >
                      <img
                        src={imgUrl}
                        alt={title}
                        style={{
                          ...imgStyle,
                          filter: isR18 ? "blur(15px)" : "none",
                        }}
                      />
                      {isR18 && <div style={r18Tag}>R18</div>}
                    </Link>

                    <div style={infoArea}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <div>
                          <div style={titleStyle}>{title}</div>
                          <div style={priceStyle}>価格：{clean(m.値段) || "—"}</div>
                        </div>

                        <button
                          onClick={() => fav.toggle(title)}
                          style={starBtn(fav.has(title))}
                        >
                          {fav.has(title) ? "★" : "☆"}
                        </button>
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
                            <a href={m.電子版URL} target="_blank" rel="noreferrer" style={btnKindle}>
                              Kindle
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
        .searchArea {
          display: flex;
          gap: 10px;
          margin-top: 16px;
          flex-wrap: wrap;
        }
        .searchRow {
          display: flex;
          gap: 8px;
          flex: 1;
        }
        @media (max-width: 640px) {
          .searchArea {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

/* =========================
スタイル (React.CSSProperties を使用)
========================= */

const controlPanel: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 20,
  border: "1px solid #eee",
};

const btnNav: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const monthInput: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: 8,
  border: "1px solid #ddd",
};

const selectBox: React.CSSProperties = {
  padding: "10px",
  borderRadius: 8,
  border: "1px solid #ddd",
};

const searchInput: React.CSSProperties = {
  flex: 1,
  padding: "10px",
  borderRadius: 8,
  border: "1px solid #ddd",
};

const dateHeader: React.CSSProperties = {
  fontSize: 21,
  fontWeight: 900,
  marginBottom: 16,
  borderBottom: "2px solid #111",
};

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 14,
  display: "flex",
  gap: 16,
  border: "1px solid #eee",
};

const imgStyle: React.CSSProperties = {
  width: "100%",
  aspectRatio: "3/4",
  borderRadius: 8,
  border: "1px solid #eee",
  objectFit: "contain",
  background: "#fff",
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
  pointerEvents: "none",
};

const infoArea: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const titleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 900,
};

const priceStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 900,
  marginTop: 4,
};

const btnContainer: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  marginTop: 12,
};

const prizeBtn: React.CSSProperties = {
  padding: "8px",
  background: "#fff4ce",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 900,
  textAlign: "center",
  fontSize: 13,
  color: "#333",
};

const buyRow: React.CSSProperties = {
  display: "flex",
  gap: 8,
  justifyContent: "flex-end",
};

const btnAmazon: React.CSSProperties = {
  padding: "6px 12px",
  background: "#111",
  color: "#fff",
  borderRadius: 8,
  fontSize: 11,
  textDecoration: "none",
};

const btnKindle: React.CSSProperties = {
  padding: "6px 12px",
  background: "#ff9900",
  color: "#fff",
  borderRadius: 8,
  fontSize: 11,
  textDecoration: "none",
};

const starBtn = (active: boolean): React.CSSProperties => ({
  width: 34,
  height: 34,
  borderRadius: 999,
  border: "1px solid #ddd",
  background: active ? "#111" : "#fff",
  color: active ? "#fff" : "#111",
  fontSize: 16,
  cursor: "pointer",
  flexShrink: 0,
});