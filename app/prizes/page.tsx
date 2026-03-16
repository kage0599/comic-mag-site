"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePrizes, type Prize } from "@/components/usePrizes";
import { useMagazines, type Magazine } from "@/components/useMagazines";
import { clean, splitByComma } from "@/components/text";
import { useAppliedPrizes } from "@/components/useAppliedPrizes";
import A8Ad from "@/components/A8Ad";

/* =========================
基本処理
========================= */
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

/* =========================
メイン
========================= */
export default function PrizesPage() {
  const { items, loading } = usePrizes();
  const { items: mags } = useMagazines();
  const applied = useAppliedPrizes();
  const [showExpired, setShowExpired] = useState(false);
  const [sortMode, setSortMode] = useState<"deadline" | "release">("deadline");
  const [q, setQ] = useState("");
  const now = Date.now();

  const magById = useMemo(
    () => new Map<string, Magazine>(mags.map((m) => [clean(m.magazine_id), m])),
    [mags]
  );

  const list = useMemo(() => {
    let arr = [...items].filter((p: Prize) => {
      if (!showExpired) {
        const t = toDateNum(p.締切);
        if (Number.isFinite(t) && t < now) return false;
      }

      if (q) {
        const mag = magById.get(clean(p.magazine_id));
        const hay = norm(
          `${clean(mag?.タイトル)} ${clean(p.懸賞名)} ${clean(p.内容)} ${clean(p.応募方法)}`
        );
        return hay.includes(norm(q));
      }

      return true;
    });

    if (sortMode === "deadline") {
      arr.sort(
        (a, b) => (toDateNum(a.締切) || 9e15) - (toDateNum(b.締切) || 9e15)
      );
    } else {
      arr.sort(
        (a, b) =>
          (toDateNum(magById.get(clean(a.magazine_id))?.発売日) || 9e15) -
          (toDateNum(magById.get(clean(b.magazine_id))?.発売日) || 9e15)
      );
    }

    return arr;
  }, [items, showExpired, now, sortMode, q, magById]);

  return (
    <main style={{ minHeight: "100vh", background: "#f6f7fb", paddingBottom: 60 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px" }}>
        <header style={panel}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>
                懸賞情報一覧
              </h1>
              <div style={{ marginTop: 6, fontSize: 13, fontWeight: 900 }}>
                件数：{list.length} 件
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select value={sortMode} onChange={(e) => setSortMode(e.target.value as "deadline" | "release")} style={select}>
                <option value="deadline">締切が近い順</option>
                <option value="release">発売日順</option>
              </select>

              <button onClick={() => setShowExpired(!showExpired)} style={btnSoft}>
                {showExpired ? "期限切れを隠す" : "期限切れも表示"}
              </button>
            </div>
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="雑誌名や賞品名で検索..."
              style={searchInput}
            />
            <button onClick={() => setQ("")} style={btnSoft}>
              クリア
            </button>
          </div>
        </header>

        <div style={{ marginTop: 16 }}>
          <A8Ad htmlContent={`<a href="https://px.a8.net/svt/ejp?a8mat=4AZGCD+9TNIVU+4AHY+5Z6WX" rel="nofollow"><img border="0" width="468" height="60" src="https://www29.a8.net/svt/bgt?aid=260315005594&wid=002&eno=01&mid=s00000020023001004000&mc=1"></a>`} />
        </div>

        <section style={{ marginTop: 20 }}>
          {loading ? (
            <div style={{ padding: 18 }}>読み込み中...</div>
          ) : (
            <div className="responsiveGrid">
              {list.map((p, idx) => {
                const prizeId = clean(p.prize_id) || `${idx}`;
                const mag = magById.get(clean(p.magazine_id));
                const magTitle = clean(mag?.タイトル) || clean(p.magazine_id);
                const release = ymd(mag?.発売日);
                const done = applied.has(prizeId);
                const lines = splitByComma(p.内容);

                return (
                  <article key={prizeId} style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Link
                        href={`/magazine/${encodeURIComponent(clean(mag?.magazine_id || magTitle))}`}
                        style={magTag}
                      >
                        {magTitle}
                      </Link>

                      <button
                        onClick={() => applied.toggle(prizeId)}
                        style={{
                          ...statusBtn,
                          background: done ? "#111" : "#fff",
                          color: done ? "#fff" : "#111"
                        }}
                      >
                        {done ? "応募済" : "未応募"}
                      </button>
                    </div>

                    <div style={prizeTitle}>
                      {clean(p.懸賞名) || "懸賞プレゼント"}
                    </div>

                    <div style={prizeInfo}>
                      {release && (
                        <div>
                          <span style={label}>発売日：</span>
                          {release}
                        </div>
                      )}
                      <div>
                        <span style={label}>締切：</span>
                        {clean(p.締切) || "—"}
                      </div>
                      <div>
                        <span style={label}>応募方法：</span>
                        {clean(p.応募方法) || "—"}
                      </div>
                    </div>

                    {/* プレゼント内容 アコーディオン */}
                    <details style={contentBox}>
                      <summary style={summary}>
                        プレゼント内容を見る
                      </summary>
                      <ul style={prizeList}>
                        {lines.length
                          ? lines.map((t, i) => <li key={i}>{t}</li>)
                          : <li>{clean(p.内容) || "—"}</li>}
                      </ul>
                    </details>

                    {/* ボタン列 */}
                    <div style={buyRow}>
                      {clean(p.応募URL) && (
                        <a
                          href={clean(p.応募URL)}
                          target="_blank"
                          rel="noreferrer"
                          style={applyBtnMini}
                        >
                          応募はこちら
                        </a>
                      )}

                      {mag?.AmazonURL && (
                        <a
                          href={mag.AmazonURL}
                          target="_blank"
                          rel="noreferrer"
                          style={btnMiniDark}
                        >
                          Amazon
                        </a>
                      )}

                      {mag?.電子版URL && (
                        <a
                          href={mag.電子版URL}
                          target="_blank"
                          rel="noreferrer"
                          style={btnMiniOrange}
                        >
                          Kindle
                        </a>
                      )}
                    </div>

                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .responsiveGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 22px;
        }

        @media (min-width: 768px) {
          .responsiveGrid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </main>
  );
}

/* =========================
スタイル
========================= */
const panel: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 20,
  border: "1px solid #eee"
};
const select: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #ddd",
  fontWeight: 900,
  cursor: "pointer"
};
const btnSoft: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "#fff",
  fontWeight: 900,
  cursor: "pointer"
};
const searchInput: React.CSSProperties = {
  flex: 1,
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #ddd"
};
const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 22,
  border: "1px solid #e9edf3",
  boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
  gap: 12
};
const magTag: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 900,
  background: "#eef3f8",
  color: "#333",
  padding: "6px 10px",
  borderRadius: 6,
  textDecoration: "none",

  maxWidth: 300,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "block"
};
const statusBtn: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: 8,
  border: "2px solid #111",
  fontWeight: 900,
  fontSize: 12,
  cursor: "pointer",
  transition: "all 0.2s"
};
const prizeTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  lineHeight: 1.4,
  color: "#111"
};
const prizeInfo: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 14,
  color: "#444"
};
const label: React.CSSProperties = {
  fontWeight: 900,
  color: "#777",
  marginRight: 4
};
const contentBox: React.CSSProperties = {
  background: "#f9fafb",
  border: "1px solid #eee",
  borderRadius: 8,
  padding: "12px"
};
const summary: React.CSSProperties = {
  fontWeight: 900,
  cursor: "pointer",
  color: "#333",
  outline: "none"
};
const prizeList: React.CSSProperties = {
  marginTop: 8,
  paddingLeft: 20,
  fontSize: 14,
  lineHeight: 1.6,
  color: "#444"
};

// --- 追加・修正されたボタンスタイル ---
const buyRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  flexWrap: "wrap", // 画面幅が狭いときに折り返すように追加
  gap: 8,
  marginTop: 4
};
const applyBtnMini: React.CSSProperties = {
  padding: "6px 12px",
  background: "#ff4d4f",
  color: "#fff",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 900,
  textDecoration: "none"
};
const btnMiniDark: React.CSSProperties = {
  padding: "6px 12px",
  background: "#111",
  color: "#fff",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 900,
  textDecoration: "none"
};
const btnMiniOrange: React.CSSProperties = {
  padding: "6px 12px",
  background: "#ff9900",
  color: "#fff",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 900,
  textDecoration: "none"
};