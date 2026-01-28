"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useServices } from "../../components/useServices";
import { useMagazines } from "../../components/useMagazines";
import { clean, splitByComma } from "../../components/text";

function toDateNum(v?: string) {
  const s = clean(v).replace(/\//g, "-").slice(0, 10);
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : NaN;
}

export default function ServicesPage() {
  const { items, loading, error } = useServices();
  const { items: mags } = useMagazines();

  const [showExpired, setShowExpired] = useState(false);
  const now = Date.now();

  const magById = useMemo(() => new Map(mags.map((m) => [clean(m.magazine_id), m])), [mags]);

  const list = useMemo(() => {
    return items.filter((s) => {
      if (showExpired) return true;
      const t = toDateNum(s.締切);
      if (!Number.isFinite(t)) return true;
      return t >= now;
    });
  }, [items, showExpired, now]);

  return (
    <main style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
        <header style={panel}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>応募者全員サービス</h1>

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
            <div style={emptyBox}>表示する全プレがありません</div>
          ) : (
            <div style={grid}>
              {list.map((s, idx) => {
                const mag = magById.get(clean(s.magazine_id));
                const magTitle = clean(mag?.タイトル) || clean(s.magazine_id) || "（雑誌）";
                const detailHref = mag?.magazine_id ? `/magazine/${encodeURIComponent(clean(mag.magazine_id))}` : "#";

                const lines = splitByComma(s.内容);

                return (
                  <article key={s.service_id ?? idx} style={card}>
                    <Link href={detailHref} style={{ textDecoration: "none", color: "inherit" }}>
                      <div style={magLabel}>{magTitle}</div>
                    </Link>

                    {/* ✅ 内容を "、" で改行（箇条書き） */}
                    {lines.length ? (
                      <ul style={{ margin: "0 0 10px", paddingLeft: 18, fontSize: 16, lineHeight: 1.7, fontWeight: 800 }}>
                        {lines.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    ) : (
                      <div style={{ fontSize: 17, fontWeight: 900, lineHeight: 1.6 }}>
                        {clean(s.内容) || "—"}
                      </div>
                    )}

                    <div style={{ marginTop: 8, fontSize: 15 }}>
                      応募方法：<b>{clean(s.応募方法) || "—"}</b>
                    </div>

                    <div style={{ marginTop: 6, fontSize: 15, fontWeight: 900 }}>
                      締切：{clean(s.締切) || "—"}
                    </div>

                    {/* ✅ 右下に販売サイトURL */}
<div style={bottomRow}>
  <div /> {/* 左は空（将来ボタン置きたい場合用） */}
  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
    {(() => {
      const amazonUrl = clean(mag?.AmazonURL);
      const ebookUrl = clean(mag?.電子版URL);

      return (
        <>
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
        </>
      );
    })()}
  </div>
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
  border: "1px solid #eee",
};

const magLabel: React.CSSProperties = {
  display: "inline-block",
  marginBottom: 10,
  padding: "6px 10px",
  borderRadius: 999,
  background: "#f1f3f6",
  border: "1px solid #e3e6ee",
  fontWeight: 900,
  fontSize: 13,
};

const bottomRow: React.CSSProperties = {
  marginTop: 12,
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  alignItems: "flex-end",
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
