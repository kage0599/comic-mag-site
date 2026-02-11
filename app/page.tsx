"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import TopTabs from "../components/TopTabs";
import { useMagazines } from "../components/useMagazines";
import { clean } from "../components/text";

/** ===== utils ===== */
function toYmd(v?: string) {
  return clean(v).replace(/\//g, "-").slice(0, 10); // "YYYY-MM-DD"
}
function toMonthKey(ymd: string) {
  return ymd.slice(0, 7); // "YYYY-MM"
}
function toDateNum(v?: string) {
  const s = toYmd(v);
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : NaN;
}
function formatMonthJp(monthKey: string) {
  const [y, m] = monthKey.split("-").map((x) => Number(x));
  if (!y || !m) return monthKey;
  return `${y}年${m}月`;
}
function formatDateJp(ymd: string) {
  const [y, m, d] = ymd.split("-").map((x) => Number(x));
  const dt = new Date(y, (m || 1) - 1, d || 1);
  const w = ["日", "月", "火", "水", "木", "金", "土"][dt.getDay()];
  return `${y}年${m}月${d}日（${w}）`;
}
function ymNowJst() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
function addMonths(ym: string, diff: number) {
  const [y, m] = ym.split("-").map((v) => Number(v));
  const dt = new Date(y, (m || 1) - 1, 1);
  dt.setMonth(dt.getMonth() + diff);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
}

/** ===== page ===== */
export default function Page() {
  const { items: mags, loading, error } = useMagazines();

  // 月候補（新しい月が先）
  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    for (const m of mags) {
      const ymd = toYmd(m.発売日);
      if (ymd) set.add(toMonthKey(ymd));
    }
    return Array.from(set).sort((a, b) => (a < b ? 1 : -1));
  }, [mags]);

  // デフォルト：最新月（なければ当月）
  const defaultMonth = useMemo(() => {
    if (monthOptions.length) return monthOptions[0];
    return ymNowJst();
  }, [monthOptions]);

  // 初期は当月、データが来たら最新月へ（ユーザー操作が無い場合のみ）
  const [monthKey, setMonthKey] = useState<string>(ymNowJst());
  const touchedMonthRef = useRef(false);

  React.useEffect(() => {
    if (!touchedMonthRef.current) {
      setMonthKey(defaultMonth);
      return;
    }
    if (monthOptions.length && !monthOptions.includes(monthKey)) {
      setMonthKey(defaultMonth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultMonth, monthOptions.length]);

  const [q, setQ] = useState("");
  const [searchAllMonths, setSearchAllMonths] = useState(false);

  const canPrevNext = monthOptions.length > 0;

  const filtered = useMemo(() => {
    const keyword = clean(q).toLowerCase();

    let base = mags;

    if (!searchAllMonths) {
      base = base.filter((m) => toMonthKey(toYmd(m.発売日)) === monthKey);
    }

    if (keyword) {
      base = base.filter((m) => {
        const hay = `${clean(m.タイトル)} ${clean(m.発売日)}`.toLowerCase();
        return hay.includes(keyword);
      });
    }

    return [...base].sort((a, b) => {
      const ta = toDateNum(a.発売日);
      const tb = toDateNum(b.発売日);
      const na = Number.isFinite(ta) ? ta : 9e15;
      const nb = Number.isFinite(tb) ? tb : 9e15;
      if (na !== nb) return na - nb;
      return clean(a.タイトル).localeCompare(clean(b.タイトル), "ja");
    });
  }, [mags, q, monthKey, searchAllMonths]);

  const groupedByDate = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const m of filtered) {
      const ymd = toYmd(m.発売日) || "発売日不明";
      if (!map.has(ymd)) map.set(ymd, []);
      map.get(ymd)!.push(m);
    }
    const keys = Array.from(map.keys()).sort((a, b) => {
      const ta = Date.parse(a);
      const tb = Date.parse(b);
      const na = Number.isFinite(ta) ? ta : 9e15;
      const nb = Number.isFinite(tb) ? tb : 9e15;
      return na - nb;
    });
    return keys.map((k) => ({ dateKey: k, items: map.get(k)! }));
  }, [filtered]);

  function setMonthSafe(next: string) {
    touchedMonthRef.current = true;
    setMonthKey(next);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
        {/* タブ（囲み＋余白） */}
        {/* ヘッダー */}
        <header style={panel}>
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>発売日一覧</h1>
              <div style={{ marginTop: 6, color: "#555", fontWeight: 900 }}>
                {clean(q)
                  ? `検索結果：${searchAllMonths ? "全月" : formatMonthJp(monthKey)}`
                  : `表示中：${formatMonthJp(monthKey)}`}
              </div>
            </div>

            {/* ✅ スマホ：全部横一列（はみ出しは横スクロール） */}
            <div style={monthBar}>
              <button
                onClick={() => setMonthSafe(addMonths(monthKey, -1))}
                style={btnSoftCompact}
                disabled={!canPrevNext}
                title="先月"
              >
                ←先月
              </button>

              <button
                onClick={() => setMonthSafe(ymNowJst())}
                style={btnSoftCompact}
                disabled={!canPrevNext}
                title="今月"
              >
                今月
              </button>

              <button
                onClick={() => setMonthSafe(addMonths(monthKey, 1))}
                style={btnSoftCompact}
                disabled={!canPrevNext}
                title="来月"
              >
                来月→
              </button>

              <select
                value={monthKey}
                onChange={(e) => setMonthSafe(e.target.value)}
                style={selectCompact}
                disabled={!monthOptions.length}
                aria-label="月を選択"
              >
                {monthOptions.length ? (
                  monthOptions.map((k) => (
                    <option key={k} value={k}>
                      {formatMonthJp(k)}
                    </option>
                  ))
                ) : (
                  <option value={monthKey}>{formatMonthJp(monthKey)}</option>
                )}
              </select>

              <label style={checkWrapCompact} title="全月検索">
                <input
                  type="checkbox"
                  checked={searchAllMonths}
                  onChange={(e) => setSearchAllMonths(e.target.checked)}
                />
                全月検索
              </label>
            </div>

            {/* 検索 */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="検索：雑誌名（タイトル） / 日付（例 2026-01-05）"
                style={searchInput}
              />
              <button onClick={() => setQ("")} style={btnSoft}>
                クリア
              </button>
              <div style={{ fontSize: 13, color: "#444" }}>
                件数：<b>{filtered.length}</b>
              </div>
            </div>
          </div>
        </header>

        {/* 本文 */}
        <section style={{ marginTop: 14 }}>
          {loading ? (
            <div style={{ padding: 18, color: "#555" }}>読み込み中...</div>
          ) : error ? (
            <div style={errorBox}>{error}</div>
          ) : filtered.length === 0 ? (
            <div style={emptyBox}>表示する雑誌がありません</div>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {groupedByDate.map(({ dateKey, items }) => (
                <div key={dateKey}>
                  <div style={dateHeading}>
                    {dateKey === "発売日不明" ? "発売日不明" : formatDateJp(dateKey)}
                  </div>

                  <div style={grid}>
                    {items.map((m, idx) => {
                      const id = clean(m.magazine_id) || `${dateKey}_${idx}`;
                      const title = clean(m.タイトル) || "（タイトル不明）";
                      const img = clean(m.表紙画像);

                      const r18raw = String((m as any).R18 ?? "").trim().toLowerCase();
                      const isR18 = r18raw === "1" || r18raw === "true" || r18raw === "r18";

                      const hasId = !!clean(m.magazine_id);
                      const href = hasId ? `/magazine/${encodeURIComponent(clean(m.magazine_id))}` : "";

                      const amazonUrl = clean(m.AmazonURL);
                      const ebookUrl = clean(m.電子版URL);

                      const CardInner = (
                        <div style={{ display: "flex", gap: 12 }}>
                          <div style={{ width: 120, flexShrink: 0 }}>
                            {img ? (
                              <img
                                src={img}
                                alt={title}
                                loading="lazy"
                                style={{ ...cover, filter: isR18 ? "blur(10px)" : "none" }}
                              />
                            ) : (
                              <div style={coverFallback} />
                            )}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={titleStyle}>{title}</div>
                            <div style={meta}>
                              <div>値段：{clean(m.値段) || "—"}</div>
                            </div>
                          </div>
                        </div>
                      );

                      return (
                        <article key={id} style={card}>
                          {hasId ? (
                            <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
                              {CardInner}
                            </Link>
                          ) : (
                            <div>{CardInner}</div>
                          )}

                          {/* 販売サイト */}
                          <div style={buyRow}>
                            {amazonUrl ? (
                              <a href={amazonUrl} target="_blank" rel="noreferrer" style={btnMiniDark}>
                                Amazon
                              </a>
                            ) : null}
                            {ebookUrl ? (
                              <a href={ebookUrl} target="_blank" rel="noreferrer" style={btnMiniBlue}>
                                電子版
                              </a>
                            ) : null}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/** ===== styles ===== */
const tabsBox: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e9e9ee",
  borderRadius: 16,
  padding: 10,
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
  marginBottom: 12,
};

const panel: React.CSSProperties = {
  background: "white",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
};

const monthBar: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  flexWrap: "nowrap",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
  paddingBottom: 4,
};

const btnSoft: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 14,
};

const btnSoftCompact: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 13,
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const selectCompact: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  fontWeight: 900,
  fontSize: 13,
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const checkWrapCompact: React.CSSProperties = {
  display: "inline-flex",
  gap: 6,
  alignItems: "center",
  fontWeight: 900,
  fontSize: 13,
  color: "#111",
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const searchInput: React.CSSProperties = {
  flex: 1,
  minWidth: 260,
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff",
  fontSize: 14,
};

const dateHeading: React.CSSProperties = {
  marginTop: 6,
  marginBottom: 10,
  fontSize: 18,
  fontWeight: 900,
  padding: "10px 12px",
  borderRadius: 14,
  background: "#fff",
  border: "1px solid #eee",
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
  gap: 14,
};

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 14,
  border: "1px solid #eee",
};

const cover: React.CSSProperties = {
  width: "100%",
  height: "auto",
  borderRadius: 12,
  border: "1px solid #eee",
};

const coverFallback: React.CSSProperties = {
  width: "100%",
  height: 160,
  background: "#eee",
  borderRadius: 12,
};

const titleStyle: React.CSSProperties = {
  fontWeight: 900,
  fontSize: 16,
  lineHeight: 1.35,
  whiteSpace: "normal",
  wordBreak: "break-word",
};

const meta: React.CSSProperties = {
  marginTop: 8,
  fontSize: 13,
  color: "#555",
  display: "grid",
  gap: 4,
};

const buyRow: React.CSSProperties = {
  marginTop: 10,
  display: "flex",
  justifyContent: "flex-end",
  gap: 8,
  flexWrap: "wrap",
};

const btnMiniDark: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 10,
  background: "#111",
  color: "#fff",
  textDecoration: "none",
  fontSize: 12,
  fontWeight: 900,
};

const btnMiniBlue: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 10,
  background: "#2b6cff",
  color: "#fff",
  textDecoration: "none",
  fontSize: 12,
  fontWeight: 900,
};

const errorBox: React.CSSProperties = {
  padding: 18,
  background: "#fff",
  borderRadius: 14,
  border: "1px solid #ffd2d2",
  color: "#b00020",
};

const emptyBox: React.CSSProperties = {
  padding: 18,
  background: "#fff",
  borderRadius: 14,
  color: "#555",
};
