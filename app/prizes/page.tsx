"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePrizes } from "../../components/usePrizes";
import { useMagazines } from "../../components/useMagazines";
import { clean, splitByComma } from "../../components/text";
import { useAppliedPrizes } from "../../components/useAppliedPrizes";

function toDateNum(v?: string) {
  const s = clean(v).replace(/\//g, "-").slice(0, 10);
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : NaN;
}
function ymd(v?: string) {
  return clean(v).replace(/\//g, "-").slice(0, 10);
}
function norm(s: string) {
  return clean(s).toLowerCase();
}

type SortMode = "deadline" | "release";

export default function PrizesPage() {
  const { items, loading, error } = usePrizes();
  const { items: mags } = useMagazines();
  const applied = useAppliedPrizes();

  const [showExpired, setShowExpired] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("deadline");
  const [q, setQ] = useState(""); // ✅ 検索
  const now = Date.now();

  const magById = useMemo(() => new Map(mags.map((m) => [clean(m.magazine_id), m])), [mags]);

  const list = useMemo(() => {
    const keyword = norm(q);

    let arr = [...items].filter((p) => {
      // 応募期間外表示
      if (!showExpired) {
        const t = toDateNum(p.締切);
        if (Number.isFinite(t) && t < now) return false;
      }

      // ✅ 検索（雑誌名＋懸賞名＋内容）
      if (keyword) {
        const mag = magById.get(clean(p.magazine_id));
        const magTitle = clean(mag?.タイトル);
        const hay = norm(`${magTitle} ${clean(p.懸賞名)} ${clean(p.内容)} ${clean(p.応募方法)}`);
        return hay.includes(keyword);
      }
      return true;
    });

    if (sortMode === "deadline") {
      arr.sort((a, b) => (toDateNum(a.締切) || 9e15) - (toDateNum(b.締切) || 9e15));
    } else {
      arr.sort((a, b) => {
        const ma = magById.get(clean(a.magazine_id));
        const mb = magById.get(clean(b.magazine_id));
        const ta = toDateNum(ma?.発売日) || 9e15;
        const tb = toDateNum(mb?.発売日) || 9e15;
        return ta - tb;
      });
    }
    return arr;
  }, [items, showExpired, now, sortMode, q, magById]);

  return (
    <main style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
        <header style={panel}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>懸賞一覧</h1>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)} style={select}>
                <option value="deadline">締切が短い順</option>
                <option value="release">発売日順</option>
              </select>

              <button onClick={() => setShowExpired((v) => !v)} style={btnSoft}>
                {showExpired ? "応募期間外を隠す" : "応募期間外も表示"}
              </button>
            </div>
          </div>

          {/* ✅ 検索 */}
          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="検索：雑誌名 / 懸賞名 / プレゼント内容（Switch等）"
              style={searchInput}
            />
            <button onClick={() => setQ("")} style={btnSoft}>クリア</button>
            <div style={{ fontSize: 13, color: "#444", alignSelf: "center" }}>
              件数：<b>{list.length}</b>
            </div>
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
                const prizeId = clean(p.prize_id) || `${clean(p.magazine_id)}_${idx}`;
                const mag = magById.get(clean(p.magazine_id));

                const magTitle = clean(mag?.タイトル) || clean(p.magazine_id) || "（雑誌）";
                const release = ymd(mag?.発売日); // ✅ 発売日表示
                const lines = splitByComma(p.内容);

                const done = applied.has(prizeId);
                const detailHref = clean(mag?.magazine_id)
                  ? `/magazine/${encodeURIComponent(clean(mag?.magazine_id))}`
                  : "#";

                const amazonUrl = clean(mag?.AmazonURL);
                const ebookUrl = clean(mag?.電子版URL);

                return (
                  <article key={prizeId} style={card}>
                    <Link href={detailHref} style={{ textDecoration: "none", color: "inherit" }}>
                      <span style={magLabel}>{magTitle}</span>
                    </Link>

                    {/* ✅ 発売日を締切の上に */}
                    {release ? <div style={releaseLine}>発売日：{release}</div> : null}

                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 900 }}>{clean(p.懸賞名) || "懸賞"}</div>

                      <button
                        onClick={() => applied.toggle(prizeId)}
                        style={{
                          ...statusBtn,
                          background: done ? "#111" : "#fff",
                          color: done ? "#fff" : "#111",
                        }}
                      >
                        {done ? "応募済み" : "未応募"}
                      </button>
                    </div>

                    <div style={{ marginTop: 6, fontSize: 15, lineHeight: 1.6 }}>
                      <div><b>締切：</b>{clean(p.締切) || "—"}</div>
                      <div><b>応募方法：</b>{clean(p.応募方法) || "—"}</div>
                    </div>

                    <details style={{ marginTop: 10 }}>
                      <summary style={summary}>プレゼント内容を開く</summary>
                      {lines.length ? (
                        <ul style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: 16, lineHeight: 1.7 }}>
                          {lines.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                      ) : (
                        <div style={{ marginTop: 8, fontSize: 16 }}>{clean(p.内容) || "—"}</div>
                      )}
                    </details>

                    {/* ✅ 右下に販売サイトURL（Amazon/電子版） */}
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

const select: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  fontWeight: 900,
  fontSize: 14,
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

const searchInput: React.CSSProperties = {
  flex: 1,
  minWidth: 260,
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff",
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
  marginBottom: 8,
  padding: "6px 10px",
  borderRadius: 999,
  background: "#f1f3f6",
  border: "1px solid #e3e6ee",
  fontWeight: 900,
  fontSize: 13,
};

const releaseLine: React.CSSProperties = {
  marginTop: 2,
  marginBottom: 6,
  fontSize: 14,
  fontWeight: 900,
  color: "#111",
};

const summary: React.CSSProperties = {
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 14,
  color: "#111",
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

const statusBtn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 999,
  border: "1px solid #ddd",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 13,
  flexShrink: 0,
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
