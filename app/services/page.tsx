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
    // ✅ 「登録されていない」相当＝中身が空の行は出さない
    let arr = [...items].filter((s) => {
      const hasContent = !!clean(s.内容) || !!clean(s.応募方法) || !!clean(s.締切);
      if (!hasContent) return false;

      if (showExpired) return true;
      const t = toDateNum(s.締切);
      if (!Number.isFinite(t)) return true;
      return t >= now;
    });

    // 締切が近い順（見やすい）
    arr.sort((a, b) => (toDateNum(a.締切) || 9e15) - (toDateNum(b.締切) || 9e15));
    return arr;
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
            <div style={emptyBox}>表示する全員サービスがありません</div>
          ) : (
            <div style={grid}>
              {list.map((s, idx) => {
                const serviceKey = clean(s.service_id) || `${clean(s.magazine_id)}_${idx}`;

                const mag = magById.get(clean(s.magazine_id));
                const magTitle = clean(mag?.タイトル) || clean(s.magazine_id) || "（雑誌）";

                // ✅ Vercel落ち回避：magを直接参照しない
                const amazonUrl = clean(mag?.AmazonURL);
                const ebookUrl = clean(mag?.電子版URL);

                const detailHref = clean(mag?.magazine_id)
                  ? `/magazine/${encodeURIComponent(clean(mag?.magazine_id))}`
                  : "#";

                const lines = splitByComma(s.内容);

                return (
                  <article key={serviceKey} style={card}>
                    {/* 雑誌名：目立たせる */}
                    <Link href={detailHref} style={{ textDecoration: "none", color: "inherit" }}>
                      <div style={magTitleBig}>{magTitle}</div>
                    </Link>

                    {/* 締切/応募方法 */}
                    <div style={{ marginTop: 8, fontSize: 16, lineHeight: 1.7 }}>
                      <div>
                        <b>締切：</b>
                        {clean(s.締切) || "—"}
                      </div>
                      <div>
                        <b>応募方法：</b>
                        {clean(s.応募方法) || "—"}
                      </div>
                    </div>

                    {/* 内容：、で改行 */}
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 6 }}>内容</div>
                      {lines.length ? (
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 16, lineHeight: 1.75 }}>
                          {lines.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      ) : (
                        <div style={{ fontSize: 16, lineHeight: 1.75 }}>{clean(s.内容) || "—"}</div>
                      )}
                    </div>

                    {/* ✅ 右下に販売サイト（Amazon/電子版） */}
                    <div style={bottomRow}>
                      <div />
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
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

/** styles */
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

const magTitleBig: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  lineHeight: 1.35,
  padding: "8px 10px",
  borderRadius: 12,
  background: "#f1f3f6",
  border: "1px solid #e3e6ee",
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
