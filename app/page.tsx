"use client";

import React, { useMemo, useState } from "react";
import { useMagazines, Magazine } from "../components/useMagazines";

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function normalizeDate(d?: string) {
  const s = clean(d);
  if (!s) return "";
  // "2026/01/05" → "2026-01-05"
  return s.replace(/\//g, "-").slice(0, 10);
}

function toMonthKey(dateStr: string) {
  // "yyyy-mm-dd" → "yyyy-mm"
  return dateStr.slice(0, 7);
}

function formatMonthJP(ym: string) {
  const [y, m] = ym.split("-");
  return `${y}年${Number(m)}月`;
}

function isR18(v: unknown) {
  const s = clean(v).toLowerCase();
  if (v === true) return true;
  if (v === 1) return true;
  if (s === "true" || s === "1" || s === "r18" || s === "yes") return true;
  return false;
}

export default function Page() {
  const { items, loading, error } = useMagazines();

  const [month, setMonth] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  // 月の候補（データから生成）
  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    for (const m of items) {
      const d = normalizeDate(m.発売日);
      if (d) set.add(toMonthKey(d));
    }
    return Array.from(set).sort((a, b) => (a < b ? 1 : -1)); // 新しい月が上
  }, [items]);

  // 選択月のデータを日付でグルーピング
  const grouped = useMemo(() => {
    const map = new Map<string, Magazine[]>();
    for (const it of items) {
      const d = normalizeDate(it.発売日);
      if (!d) continue;
      if (toMonthKey(d) !== month) continue;

      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(it);
    }

    // 日付昇順・タイトル昇順
    const dates = Array.from(map.keys()).sort((a, b) => (a < b ? -1 : 1));
    const result = dates.map((d) => {
      const arr = map.get(d)!;
      arr.sort((a, b) => clean(a.タイトル).localeCompare(clean(b.タイトル), "ja"));
      return { date: d, items: arr };
    });

    return result;
  }, [items, month]);

  return (
    <main style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
        <header style={panel}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>コミック誌 情報まとめ</h1>
              <div style={{ marginTop: 6, fontSize: 13, color: "#555" }}>
                月別一覧（発売日ごとに見出し表示）
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <select value={month} onChange={(e) => setMonth(e.target.value)} style={select}>
                {/* データに無い月でも表示できるように現在月を先頭 */}
                {!monthOptions.includes(month) ? <option value={month}>{formatMonthJP(month)}</option> : null}
                {monthOptions.map((m) => (
                  <option key={m} value={m}>
                    {formatMonthJP(m)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <section style={{ marginTop: 14 }}>
          {loading ? (
            <div style={{ padding: 18, color: "#555" }}>読み込み中...</div>
          ) : error ? (
            <div style={errorBox}>{error}</div>
          ) : grouped.length === 0 ? (
            <div style={emptyBox}>この月のデータがありません</div>
          ) : (
            grouped.map((g) => (
              <div key={g.date} style={{ marginBottom: 18 }}>
                {/* ✅ 日付見出し */}
                <div style={dateHeading}>{g.date}</div>

                {/* ✅ PCは2列 / スマホは1列 */}
                <div style={grid}>
                  {g.items.map((m, idx) => {
                    const title = clean(m.タイトル) || "（タイトル不明）";
                    const r18 = isR18(m.R18);
                    const img = clean(m.表紙画像);

                    return (
                      <article key={`${title}-${idx}`} style={card}>
                        <div style={{ width: 110, flexShrink: 0 }}>
                          {img ? (
                            <img
                              src={img}
                              alt={title}
                              style={{
                                ...cover,
                                filter: r18 ? "blur(10px)" : "none", // ✅ R18はモザイク代わり
                              }}
                              loading="lazy"
                            />
                          ) : (
                            <div style={coverFallback} />
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* ✅ タイトルは省略しない（折り返し） */}
                          <div style={titleWrap}>{title}</div>

                          <div style={meta}>
                            <div>価格：{clean(m.値段) ? `${m.値段}` : "—"}</div>
                            {r18 ? <div style={{ color: "#b00020", fontWeight: 900 }}>R18</div> : null}
                          </div>

                          <div style={btnRow}>
                            {clean(m.AmazonURL) ? (
                              <a href={clean(m.AmazonURL)} target="_blank" rel="noreferrer" style={btnDark}>
                                Amazon
                              </a>
                            ) : null}
                            {clean(m.電子版URL) ? (
                              <a href={clean(m.電子版URL)} target="_blank" rel="noreferrer" style={btnBlue}>
                                電子版
                              </a>
                            ) : null}
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
      </div>
    </main>
  );
}

const panel: React.CSSProperties = {
  background: "white",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
};

const select: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  fontWeight: 900,
};

const dateHeading: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 900,
  margin: "10px 4px",
  paddingLeft: 10,
  borderLeft: "5px solid #111",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", // PC2列/スマホ1列
  gap: 14,
};

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 14,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  display: "flex",
  gap: 12,
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

const titleWrap: React.CSSProperties = {
  fontWeight: 900,
  fontSize: 15,
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

const btnRow: React.CSSProperties = {
  display: "flex",
  gap: 8,
  marginTop: 10,
  flexWrap: "wrap",
};

const btnDark: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  background: "#111",
  color: "#fff",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 900,
};

const btnBlue: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  background: "#2b6cff",
  color: "#fff",
  textDecoration: "none",
  fontSize: 14,
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
