"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useMagazines } from "../components/useMagazines";
import { clean, formatJpDate, isR18, normalizeDate } from "../components/text";

function monthString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default function Page() {
  const { items, loading, error } = useMagazines();

  const [month, setMonth] = useState(monthString());
  const [q, setQ] = useState("");

  const monthItems = useMemo(() => {
    const keyword = clean(q).toLowerCase();
    return items.filter((m) => {
      const d = normalizeDate(m.発売日);
      if (!d.startsWith(month)) return false;
      if (!keyword) return true;
      const text = `${clean(m.タイトル)} ${clean(m.magazine_id)}`.toLowerCase();
      return text.includes(keyword);
    });
  }, [items, month, q]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const it of monthItems) {
      const key = normalizeDate(it.発売日) || "日付不明";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    const keys = Array.from(map.keys()).sort((a, b) => a.localeCompare(b));
    return keys.map((k) => {
      const list = map.get(k)!;
      list.sort((a, b) => clean(a.タイトル).localeCompare(clean(b.タイトル), "ja"));
      return { dateKey: k, list };
    });
  }, [monthItems]);

  return (
    <main style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
        <header style={panel}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>コミック誌 情報まとめ</h1>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={monthInput} />
            </div>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="検索（タイトル / magazine_id）"
              style={searchInput}
            />
            <button onClick={() => setQ("")} style={btnSoft}>クリア</button>
            <div style={{ fontSize: 13, color: "#444" }}>
              件数：<b>{monthItems.length}</b>
            </div>
          </div>
        </header>

        <section style={{ marginTop: 16 }}>
          {loading ? (
            <div style={{ padding: 18, color: "#555" }}>読み込み中...</div>
          ) : error ? (
            <div style={errorBox}>{error}</div>
          ) : monthItems.length === 0 ? (
            <div style={emptyBox}>この月のデータがありません</div>
          ) : (
            <div style={{ display: "grid", gap: 18 }}>
              {grouped.map(({ dateKey, list }) => (
                <div key={dateKey}>
                  <h2 style={dateHeading}>
                    {dateKey === "日付不明" ? "日付不明" : formatJpDate(dateKey)}
                  </h2>

                  <div style={grid}>
                    {list.map((m, i) => {
                      const id = clean(m.magazine_id);
                      const title = clean(m.タイトル) || "（タイトル不明）";
                      const img = clean(m.表紙画像);
                      const r18 = isR18(m.R18);
                      const href = id ? `/magazine/${encodeURIComponent(id)}` : "#";

                      return (
                        <Link
                          key={`${id}-${i}`}
                          href={href}
                          style={{ textDecoration: "none", color: "inherit", pointerEvents: id ? "auto" : "none" }}
                        >
                          <article style={card}>
                            <div style={{ width: 110, flexShrink: 0 }}>
                              {img ? (
                                <img
                                  src={img}
                                  alt={title}
                                  style={{ ...cover, filter: r18 ? "blur(10px)" : "none" }}
                                  loading="lazy"
                                />
                              ) : (
                                <div style={coverFallback} />
                              )}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={magTitle}>{title}</div>

                              {/* ✅ id表示はしない */}
                              <div style={meta}>
                                <div>価格：{clean(m.値段) || "—"}</div>
                                {r18 ? <div style={{ color: "#b00020", fontWeight: 900 }}>R18</div> : null}
                              </div>

                              <div style={smallHint}>タップで懸賞/全プレを確認</div>
                            </div>
                          </article>
                        </Link>
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

const panel: React.CSSProperties = {
  background: "white",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
};

const monthInput: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
};

const btnSoft: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 12,
};

const searchInput: React.CSSProperties = {
  flex: 1,
  minWidth: 240,
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff",
};

const dateHeading: React.CSSProperties = {
  margin: "14px 0 10px",
  fontSize: 20,
  fontWeight: 900,
  color: "#111",
  paddingLeft: 12,
  borderLeft: "6px solid #111",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
  gap: 14,
};

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 14,
  border: "1px solid #eee",
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

const magTitle: React.CSSProperties = {
  fontWeight: 900,
  fontSize: 15,
  lineHeight: 1.35,
  whiteSpace: "normal",
  wordBreak: "break-word",
};

const meta: React.CSSProperties = {
  marginTop: 8,
  fontSize: 12,
  color: "#555",
  display: "grid",
  gap: 4,
};

const smallHint: React.CSSProperties = {
  marginTop: 10,
  fontSize: 12,
  color: "#777",
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
