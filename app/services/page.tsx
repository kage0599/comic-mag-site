// app/services/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useServices } from "@/components/useServices";
import { useMagazines, type Magazine } from "@/components/useMagazines";
import { clean, splitByComma } from "@/components/text";
import A8Ad from "@/components/A8Ad";

/** ===== 補助関数 ===== */
function toDateNum(v?: string) {
  const s = clean(v).replace(/\//g, "-").slice(0, 10);
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : NaN;
}
function ymd(v?: string) {
  return clean(v).replace(/\//g, "-").slice(0, 10);
}

type SortMode = "deadline" | "release";

export default function ServicesPage() {
  const { items, loading, error } = useServices();
  const { items: mags } = useMagazines();

  const [showExpired, setShowExpired] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("deadline");
  const now = Date.now();

  const magById = useMemo(() => new Map<string, Magazine>(mags.map((m) => [clean(m.magazine_id), m])), [mags]);

  const list = useMemo(() => {
    let arr = [...items].filter((s) => {
      const hasContent = !!clean(s.内容) || !!clean(s.応募方法) || !!clean(s.締切);
      if (!hasContent) return false;

      if (showExpired) return true;
      const t = toDateNum(s.締切);
      if (!Number.isFinite(t)) return true;
      return t >= now;
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
  }, [items, showExpired, now, sortMode, magById]);

  return (
    <main style={{ minHeight: "100vh", background: "#f6f7fb", paddingBottom: 40 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "10px 16px" }}>
        
        <header style={panel}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>応募者全員サービス</h1>
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
                {showExpired ? "期間外を隠す" : "期間外も表示"}
              </button>
            </div>
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
            <div style={emptyBox}>表示する全員サービスがありません</div>
          ) : (
            <div className="serviceGrid">
              {list.map((s, idx) => {
                const serviceKey = clean(s.service_id) || `${clean(s.magazine_id)}_${idx}`;
                const mag = magById.get(clean(s.magazine_id));
                const magId = clean(mag?.magazine_id);
                const magTitle = clean(mag?.タイトル) || clean(s.magazine_id) || "（雑誌）";
                const release = ymd(mag?.発売日);
                const amazonUrl = clean(mag?.AmazonURL);
                const ebookUrl = clean(mag?.電子版URL);
                const lines = splitByComma(s.内容);

                return (
                  <article key={serviceKey} style={card}>
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

                    {/* サービス内容（タイトル的な位置づけ） */}
                    <div style={serviceTitle}>
                      {clean(s.内容) || "全員サービス"}
                    </div>

                    {/* 発売日・締切・方法 */}
                    <div style={infoArea}>
                      {release && <div><span style={label}>発売：</span>{release}</div>}
                      <div><span style={label}>締切：</span>{clean(s.締切) || "—"}</div>
                      <div><span style={label}>方法：</span>{clean(s.応募方法) || "—"}</div>
                    </div>

                    {/* 詳細内容がある場合 */}
                    {lines.length > 1 && (
                      <details style={{ marginTop: 10 }}>
                        <summary style={summary}>詳しい内容を表示</summary>
                        <ul style={contentList}>
                          {lines.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                      </details>
                    )}

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

        <div style={{ marginTop: 24, marginBottom: 40 }}>
          <A8Ad htmlContent={`<a href="https://px.a8.net/svt/ejp?a8mat=4AZGCD+9TNIVU+4AHY+5Z6WX" rel="nofollow"><img border="0" width="468" height="60" alt="" src="https://www29.a8.net/svt/bgt?aid=260315005594&wid=002&eno=01&mid=s00000020023001004000&mc=1"></a>`} />
        </div>
      </div>

      <style jsx>{`
        .serviceGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr); /* スマホ2列 */
          gap: 12px;
        }
        @media (min-width: 768px) {
          .serviceGrid {
            grid-template-columns: repeat(3, 1fr); /* PC3列 */
            gap: 16px;
          }
        }
      `}</style>
    </main>
  );
}

/** ===== スタイル定義（雑誌・懸賞ページと共通） ===== */
const panel: React.CSSProperties = { background: "white", borderRadius: 16, padding: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.06)" };
const select: React.CSSProperties = { padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", fontWeight: 900, fontSize: 12 };
const btnSoftCompact: React.CSSProperties = { padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", fontWeight: 900, fontSize: 12, cursor: "pointer" };
const card: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: 16, border: "1px solid #eee", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", height: "100%" };
const magTag: React.CSSProperties = { fontSize: 11, fontWeight: 900, color: "#555", background: "#f1f3f6", padding: "3px 10px", borderRadius: 999, textDecoration: "none", display: "inline-block" };
const serviceTitle: React.CSSProperties = { fontSize: 15, fontWeight: 900, lineHeight: 1.4, color: "#111" };
const infoArea: React.CSSProperties = { marginTop: 10, fontSize: 13, color: "#444", display: "grid", gap: 4 };
const label: React.CSSProperties = { fontWeight: 900, color: "#888", fontSize: 12 };
const summary: React.CSSProperties = { cursor: "pointer", fontSize: 12, fontWeight: 900, color: "#aaa", marginTop: 6 };
const contentList: React.CSSProperties = { marginTop: 8, paddingLeft: 18, fontSize: 13, lineHeight: 1.6, color: "#555" };
const buyRow: React.CSSProperties = { marginTop: "auto", display: "flex", gap: 6, justifyContent: "flex-end", paddingTop: 12 };
const btnMiniDark: React.CSSProperties = { padding: "6px 10px", borderRadius: 6, background: "#111", color: "#fff", textDecoration: "none", fontSize: 10, fontWeight: 900 };
const btnMiniBlue: React.CSSProperties = { padding: "6px 10px", borderRadius: 6, background: "#f1f3f6", color: "#111", border: "1px solid #ddd", textDecoration: "none", fontSize: 10, fontWeight: 900 };
const errorBox: React.CSSProperties = { padding: 18, background: "#fff", borderRadius: 14, border: "1px solid #ffd2d2", color: "#b00020" };
const emptyBox: React.CSSProperties = { padding: 40, textAlign: "center", color: "#888", background: "#fff", borderRadius: 16 };