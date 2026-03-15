// app/prizes/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

import { usePrizes, type Prize } from "@/components/usePrizes";
import { useMagazines, type Magazine } from "@/components/useMagazines";
import { clean, splitByComma } from "@/components/text";
import { useAppliedPrizes } from "@/components/useAppliedPrizes";
import A8Ad from "@/components/A8Ad";

/** ===== 補助関数（元のロジックを維持） ===== */
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
  const [q, setQ] = useState("");

  const now = Date.now();

  const magById = useMemo(() => {
    return new Map<string, Magazine>(mags.map((m) => [clean(m.magazine_id), m]));
  }, [mags]);

  const list = useMemo(() => {
    const keyword = norm(q);

    let arr = [...items].filter((p: Prize) => {
      // 応募期間外を除外（OFF時）
      if (!showExpired) {
        const t = toDateNum(p.締切);
        if (Number.isFinite(t) && t < now) return false;
      }

      // 検索（雑誌名＋懸賞名＋内容＋応募方法＋締切）
      if (keyword) {
        const mag = magById.get(clean(p.magazine_id));
        const magTitle = clean(mag?.タイトル);
        const hay = norm(
          `${magTitle} ${clean(p.懸賞名)} ${clean(p.内容)} ${clean(p.応募方法)} ${clean(p.締切)}`
        );
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
    <main style={{ minHeight: "100vh", background: "#f6f7fb", paddingBottom: 40 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "10px 16px" }}>
        
        <header style={panel}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>懸賞・プレゼント一覧</h1>
              <div style={{ marginTop: 4, fontSize: 13, color: "#555", fontWeight: 900 }}>
                件数：<b>{list.length}</b>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)} style={select}>
                <option value="deadline">締切が近い順</option>
                <option value="release">発売日順</option>
              </select>

              <button onClick={() => setShowExpired((v) => !v)} style={btnSoftCompact}>
                {showExpired ? "期限切れを隠す" : "期限切れも表示"}
              </button>
            </div>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="雑誌名や賞品名で検索..."
              style={searchInput}
            />
            <button onClick={() => setQ("")} style={btnSoftCompact}>クリア</button>
          </div>
        </header>

        {/* 広告エリア */}
        <div style={{ marginTop: 16 }}>
          <A8Ad htmlContent={`<a href="https://px.a8.net/svt/ejp?a8mat=4AZGCD+9TNIVU+4AHY+5Z6WX" rel="nofollow"><img border="0" width="468" height="60" alt="" src="https://www29.a8.net/svt/bgt?aid=260315005594&wid=002&eno=01&mid=s00000020023001004000&mc=1"></a>`} />
        </div>

        <section style={{ marginTop: 16 }}>
          {loading ? (
            <div style={{ padding: 18, color: "#555" }}>読み込み中...</div>
          ) : error ? (
            <div style={errorBox}>{error}</div>
          ) : list.length === 0 ? (
            <div style={emptyBox}>表示する懸賞がありません</div>
          ) : (
            <div className="prizeGrid">
              {list.map((p, idx) => {
                const prizeId = clean(p.prize_id) || `${clean(p.magazine_id)}_${idx}`;
                const mag = magById.get(clean(p.magazine_id));
                const magId = clean(mag?.magazine_id);
                const magTitle = clean(mag?.タイトル) || clean(p.magazine_id) || "（雑誌）";
                const release = ymd(mag?.発売日);
                const lines = splitByComma(p.内容);
                const done = applied.has(prizeId);
                const amazonUrl = clean(mag?.AmazonURL);
                const ebookUrl = clean(mag?.電子版URL);

                return (
                  <article key={prizeId} style={card}>
                    {/* 雑誌名タグ */}
                    <div style={{ marginBottom: 10 }}>
                      {magId ? (
                        <Link href={`/magazine/${encodeURIComponent(magId)}`} style={magTag}>
                          {magTitle}
                        </Link>
                      ) : (
                        <span style={{ ...magTag, opacity: 0.6 }}>{magTitle}</span>
                      )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                      <div style={prizeTitle}>
                        {clean(p.懸賞名) || "懸賞プレゼント"}
                      </div>
                      {/* 応募管理ボタン */}
                      <button
                        onClick={() => applied.toggle(prizeId)}
                        style={{
                          ...statusBtn,
                          background: done ? "#111" : "#fff",
                          color: done ? "#fff" : "#111",
                        }}
                      >
                        {done ? "応募済" : "未応募"}
                      </button>
                    </div>

                    {/* 発売日・締切情報 */}
                    <div style={prizeInfo}>
                      {release && <div><span style={label}>発売：</span>{release}</div>}
                      <div><span style={label}>締切：</span>{clean(p.締切) || "—"}</div>
                      <div><span style={label}>方法：</span>{clean(p.応募方法) || "—"}</div>
                    </div>

                    {/* 賞品内容 */}
                    <details style={{ marginTop: 10 }}>
                      <summary style={summary}>賞品内容を表示</summary>
                      <ul style={prizeList}>
                        {lines.length ? lines.map((t, i) => <li key={i}>{t}</li>) : <li>{clean(p.内容) || "—"}</li>}
                      </ul>
                    </details>

                    {/* 購入リンク（右下） */}
                    <div style={buyRow} onClick={(e) => e.stopPropagation()}>
                      {amazonUrl && <a href={amazonUrl} target="_blank" rel="noreferrer" style={btnMiniDark}>Amazon</a>}
                      {ebookUrl && <a href={ebookUrl} target="_blank" rel="noreferrer" style={btnMiniBlue}>電子版</a>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .prizeGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr); /* スマホ2列 */
          gap: 12px;
        }
        @media (min-width: 768px) {
          .prizeGrid {
            grid-template-columns: repeat(3, 1fr); /* PC3列 */
            gap: 16px;
          }
        }
      `}</style>
    </main>
  );
}

/** ===== スタイル定義（他ページと統一） ===== */
const panel: React.CSSProperties = { background: "white", borderRadius: 16, padding: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.06)" };
const select: React.CSSProperties = { padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", fontWeight: 900, fontSize: 12 };
const btnSoftCompact: React.CSSProperties = { padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", fontWeight: 900, fontSize: 12, cursor: "pointer" };
const searchInput: React.CSSProperties = { flex: 1, minWidth: 200, padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", fontSize: 13 };
const card: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: 16, border: "1px solid #eee", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", height: "100%" };
const magTag: React.CSSProperties = { fontSize: 11, fontWeight: 900, color: "#555", background: "#f1f3f6", padding: "3px 10px", borderRadius: 999, textDecoration: "none", display: "inline-block" };
const prizeTitle: React.CSSProperties = { flex: 1, fontSize: 15, fontWeight: 900, lineHeight: 1.3, color: "#111" };
const prizeInfo: React.CSSProperties = { marginTop: 10, fontSize: 13, color: "#444", display: "grid", gap: 4 };
const label: React.CSSProperties = { fontWeight: 900, color: "#888", fontSize: 12 };
const summary: React.CSSProperties = { cursor: "pointer", fontSize: 12, fontWeight: 900, color: "#aaa", marginTop: 4 };
const prizeList: React.CSSProperties = { marginTop: 8, paddingLeft: 18, fontSize: 13, lineHeight: 1.6, color: "#555" };
const buyRow: React.CSSProperties = { marginTop: "auto", display: "flex", gap: 6, justifyContent: "flex-end", paddingTop: 12 };
const btnMiniDark: React.CSSProperties = { padding: "6px 10px", borderRadius: 6, background: "#111", color: "#fff", textDecoration: "none", fontSize: 10, fontWeight: 900 };
const btnMiniBlue: React.CSSProperties = { padding: "6px 10px", borderRadius: 6, background: "#f1f3f6", color: "#111", border: "1px solid #ddd", textDecoration: "none", fontSize: 10, fontWeight: 900 };
const statusBtn: React.CSSProperties = { padding: "6px 10px", borderRadius: 999, border: "1px solid #ddd", fontSize: 10, fontWeight: 900, cursor: "pointer", whiteSpace: "nowrap" };
const errorBox: React.CSSProperties = { padding: 18, background: "#fff", borderRadius: 14, border: "1px solid #ffd2d2", color: "#b00020" };
const emptyBox: React.CSSProperties = { padding: 40, textAlign: "center", color: "#888", background: "#fff", borderRadius: 16 };