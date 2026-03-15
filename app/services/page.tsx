"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useServices } from "@/components/useServices";
import { useMagazines } from "@/components/useMagazines";
import { clean, splitByComma } from "@/components/text";
import A8Ad from "@/components/A8Ad";

function toDateNum(v?: string) {
  const t = Date.parse(clean(v).replace(/\//g, "-").slice(0, 10));
  return Number.isFinite(t) ? t : NaN;
}
function ymd(v?: string) { return clean(v).replace(/\//g, "-").slice(0, 10); }

export default function ServicesPage() {
  const { items, loading } = useServices();
  const { items: mags } = useMagazines();

  const [showExpired, setShowExpired] = useState(false);
  const [sortMode, setSortMode] = useState<"deadline" | "release">("deadline");
  const now = Date.now();

  const magById = useMemo(() => new Map(mags.map((m) => [clean(m.magazine_id), m])), [mags]);

  const list = useMemo(() => {
    let arr = [...items].filter((s) => {
      if (!clean(s.内容)) return false;
      if (showExpired) return true;
      const t = toDateNum(s.締切);
      return !Number.isFinite(t) || t >= now;
    });

    if (sortMode === "deadline") {
      arr.sort((a, b) => (toDateNum(a.締切) || 9e15) - (toDateNum(b.締切) || 9e15));
    } else {
      arr.sort((a, b) => (toDateNum(magById.get(clean(a.magazine_id))?.発売日) || 9e15) - (toDateNum(magById.get(clean(b.magazine_id))?.発売日) || 9e15));
    }
    return arr;
  }, [items, showExpired, now, sortMode, magById]);

  return (
    <main style={{ minHeight: "100vh", background: "#f6f7fb", paddingBottom: 60 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px" }}>
        
        <header style={panel}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              {/* ✅ 大見出し修正 */}
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>応募者全員サービス一覧</h1>
              <div style={{ marginTop: 6, fontSize: 13, color: "#555", fontWeight: 900 }}>件数：{list.length} 件</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select value={sortMode} onChange={(e) => setSortMode(e.target.value as any)} style={select}>
                <option value="deadline">締切が近い順</option>
                <option value="release">発売日順</option>
              </select>
              <button onClick={() => setShowExpired(!showExpired)} style={btnSoft}>
                {showExpired ? "期間外を隠す" : "期間外も表示"}
              </button>
            </div>
          </div>
        </header>

        <div style={{ marginTop: 16 }}>
          <A8Ad htmlContent={`<a href="https://px.a8.net/svt/ejp?a8mat=4AZGCD+9TNIVU+4AHY+5Z6WX" rel="nofollow"><img border="0" width="468" height="60" alt="" src="https://www29.a8.net/svt/bgt?aid=260315005594&wid=002&eno=01&mid=s00000020023001004000&mc=1"></a>`} />
        </div>

        <section style={{ marginTop: 16 }}>
          {loading ? <div style={{ padding: 18 }}>読み込み中...</div> : (
            <div className="responsiveGrid">
              {list.map((s, idx) => {
                const mag = magById.get(clean(s.magazine_id));
                const magTitle = clean(mag?.タイトル) || clean(s.magazine_id);
                const lines = splitByComma(s.内容);

                return (
                  <article key={idx} style={card}>
                    {/* ✅ 大きめの雑誌名ボタン */}
                    <div style={{ marginBottom: 12 }}>
                      <Link href={`/magazine/${encodeURIComponent(clean(mag?.magazine_id || magTitle))}`} style={magTag}>
                        {magTitle}
                      </Link>
                    </div>

                    <div style={infoArea}>
                      {mag?.発売日 && <div><span style={label}>発売日：</span>{ymd(mag.発売日)}</div>}
                      <div><span style={label}>締　切：</span>{clean(s.締切) || "—"}</div>
                      {/* ✅ 方法を応募方法に修正 */}
                      <div><span style={label}>応募方法：</span>{clean(s.応募方法) || "—"}</div>
                    </div>

                    {/* ✅ プレゼント内容を常時表示 */}
                    <div style={contentBox}>
                      <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 6, color: "#111" }}>プレゼント内容</div>
                      <ul style={prizeList}>
                        {lines.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>

                    <div style={buyRow}>
                      {mag?.AmazonURL && <a href={mag.AmazonURL} target="_blank" rel="noreferrer" style={btnMiniDark}>Amazon</a>}
                      {mag?.電子版URL && <a href={mag.電子版URL} target="_blank" rel="noreferrer" style={btnMiniBlue}>電子版</a>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .responsiveGrid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 768px) { .responsiveGrid { grid-template-columns: 1fr 1fr; gap: 20px; } }
      `}</style>
    </main>
  );
}

const panel: React.CSSProperties = { background: "white", borderRadius: 16, padding: 20, boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #eee" };
const select: React.CSSProperties = { padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", fontWeight: 900, fontSize: 13 };
const btnSoft: React.CSSProperties = { padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", fontWeight: 900, fontSize: 13, cursor: "pointer" };
const card: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #eee", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", height: "100%" };
const magTag: React.CSSProperties = { fontSize: 14, fontWeight: 900, color: "#111", background: "#f0f4f8", padding: "6px 14px", borderRadius: 8, textDecoration: "none", border: "1px solid #dce6f2", display: "inline-block" };
const infoArea: React.CSSProperties = { fontSize: 14, color: "#333", display: "grid", gap: 6 };
const label: React.CSSProperties = { fontWeight: 900, color: "#777", display: "inline-block", width: 70 };
const contentBox: React.CSSProperties = { marginTop: 16, background: "#f9f9f9", padding: 14, borderRadius: 10, border: "1px solid #eee" };
const prizeList: React.CSSProperties = { margin: 0, paddingLeft: 20, fontSize: 15, lineHeight: 1.6, color: "#111", fontWeight: 900 };
const buyRow: React.CSSProperties = { marginTop: "auto", display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 16 };
const btnMiniDark: React.CSSProperties = { padding: "8px 16px", borderRadius: 8, background: "#111", color: "#fff", textDecoration: "none", fontSize: 12, fontWeight: 900 };
const btnMiniBlue: React.CSSProperties = { padding: "8px 16px", borderRadius: 8, background: "#2b6cff", color: "#fff", textDecoration: "none", fontSize: 12, fontWeight: 900 };