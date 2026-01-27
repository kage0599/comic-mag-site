"use client";

import React, { useMemo, useState } from "react";
import { usePrizes } from "../../components/usePrizes";
import { useMagazines } from "../../components/useMagazines";

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function normalizeDate(d?: string) {
  return clean(d).replace(/\//g, "-").slice(0, 10);
}

function toDateNum(d?: string) {
  const s = normalizeDate(d);
  if (!s) return NaN;
  return new Date(s).getTime();
}

// ✅ 内容を A.,B.,C. みたいな区切りで改行
function prettyLines(text?: string) {
  const s = clean(text);
  if (!s) return [];
  // "A. ...、B. ...、C. ..." を改行
  return s
    .replace(/、\s*(?=[A-Z]\.)/g, "\n")
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function PrizesPage() {
  const { items, loading, error } = usePrizes();
  const { items: mags } = useMagazines();

  const [showExpired, setShowExpired] = useState(false);

  const now = Date.now();

  const list = useMemo(() => {
    const arr = [...items].sort((a, b) => (toDateNum(a.締切) ?? 0) - (toDateNum(b.締切) ?? 0));

    const filtered = arr.filter((p) => {
      const t = toDateNum(p.締切);
      if (!Number.isFinite(t)) return true; // 日付不明は出す
      return showExpired ? true : t >= now;
    });

    // magazine_id → 雑誌タイトルを付与
    const map = new Map(mags.map((m) => [clean(m.magazine_id), clean(m.タイトル)]));
    return filtered.map((p) => ({
      ...p,
      _magTitle: map.get(clean(p.magazine_id)) || "",
    }));
  }, [items, mags, showExpired, now]);

  return (
    <main style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
        <header style={panel}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>懸賞情報</h1>
              <div style={{ marginTop: 6, fontSize: 15, color: "#555", fontWeight: 700 }}>
                応募締切が近い順に表示（内容は改行で見やすく）
              </div>
            </div>

            <button onClick={() => setShowExpired((v) => !v)} style={btnSoft}>
              {showExpired ? "応募期間外を隠す" : "応募期間外も表示"}
            </button>
          </div>
        </header>

        <section style={{ marginTop: 14 }}>
          {loading ? (
            <div style={{ padding: 18, color: "#555" }}>読み込み中...</div>
          ) : error ? (
            <div style={errorBox}>{error}</div>
          ) : list.length === 0 ? (
            <div style={emptyBox}>表示する懸賞がありません</div>
          ) : (
            <div style={grid}>
              {list.map((p, idx) => {
                const lines = prettyLines(p.内容);
                return (
                  <article key={`${p.prize_id || idx}`} style={card}>
                    <div style={{ display: "grid", gap: 8 }}>
                      <div style={{ fontSize: 18, fontWeight: 900 }}>
                        {clean(p.懸賞名) || "（懸賞名）"}
                      </div>

                      {clean(p._magTitle) ? (
                        <div style={{ fontSize: 14, color: "#555", fontWeight: 700 }}>
                          掲載：{p._magTitle}
                        </div>
                      ) : null}

                      <div style={{ fontSize: 16, fontWeight: 800 }}>
                        締切：{clean(p.締切) || "—"}
                      </div>

                      <div style={{ fontSize: 16 }}>
                        応募方法：<b>{clean(p.応募方法) || "—"}</b>
                      </div>

                      <div style={{ marginTop: 6 }}>
                        <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 6 }}>内容</div>
                        {lines.length ? (
                          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 16, lineHeight: 1.6 }}>
                            {lines.map((t, i) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        ) : (
                          <div style={{ fontSize: 16, lineHeight: 1.6 }}>{clean(p.内容) || "—"}</div>
                        )}
                      </div>

                      {clean(p.応募URL) ? (
                        <a href={clean(p.応募URL)} target="_blank" rel="noreferrer" style={btnDark}>
                          応募ページへ
                        </a>
                      ) : null}
                    </div>
                  </article>
                );
              })}
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

const btnSoft: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 14,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
  gap: 14,
};

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
};

const btnDark: React.CSSProperties = {
  display: "inline-block",
  marginTop: 8,
  padding: "12px 14px",
  borderRadius: 12,
  background: "#111",
  color: "#fff",
  textDecoration: "none",
  fontSize: 16,
  fontWeight: 900,
  textAlign: "center",
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
