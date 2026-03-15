"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePrizes, type Prize } from "@/components/usePrizes";
import { useMagazines, type Magazine } from "@/components/useMagazines";
import { clean, splitByComma } from "@/components/text";
import { useAppliedPrizes } from "@/components/useAppliedPrizes";
import A8Ad from "@/components/A8Ad";

function toDateNum(v?: string) {
  const s = clean(v).replace(/\//g, "-").slice(0, 10);
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : NaN;
}
function ymd(v?: string) { return clean(v).replace(/\//g, "-").slice(0, 10); }
function norm(s: string) { return clean(s).toLowerCase(); }

export default function PrizesPage() {
  const { items, loading, error } = usePrizes();
  const { items: mags } = useMagazines();
  const applied = useAppliedPrizes();

  const [showExpired, setShowExpired] = useState(false);
  const [sortMode, setSortMode] = useState<"deadline" | "release">("deadline");
  const [q, setQ] = useState("");
  const now = Date.now();

  const magById = useMemo(() => new Map<string, Magazine>(mags.map((m) => [clean(m.magazine_id), m])), [mags]);

  const list = useMemo(() => {
    let arr = [...items].filter((p: Prize) => {
      if (!showExpired) {
        const t = toDateNum(p.締切);
        if (Number.isFinite(t) && t < now) return false;
      }
      if (q) {
        const mag = magById.get(clean(p.magazine_id));
        const hay = norm(`${clean(mag?.タイトル)} ${clean(p.懸賞名)} ${clean(p.内容)} ${clean(p.応募方法)}`);
        return hay.includes(norm(q));
      }
      return true;
    });

    if (sortMode === "deadline") {
      arr.sort((a, b) => (toDateNum(a.締切) || 9e15) - (toDateNum(b.締切) || 9e15));
    } else {
      arr.sort((a, b) => (toDateNum(magById.get(clean(a.magazine_id))?.発売日) || 9e15) - (toDateNum(magById.get(clean(b.magazine_id))?.発売日) || 9e15));
    }
    return arr;
  }, [items, showExpired, now, sortMode, q, magById]);

  return (
    <main style={{ minHeight: "100vh", background: "#f6f7fb", paddingBottom: 60 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px" }}>
        
        <header style={panel}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              {/* ✅ 大見出し修正 */}
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>懸賞情報一覧</h1>
              <div style={{ marginTop: 6, fontSize: 13, color: "#555", fontWeight: 900 }}>件数：{list.length} 件</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select value={sortMode} onChange={(e) => setSortMode(e.target.value as any)} style={select}>
                <option value="deadline">締切が近い順</option>
                <option value="release">発売日順</option>
              </select>
              <button onClick={() => setShowExpired(!showExpired)} style={btnSoft}>
                {showExpired ? "期限切れを隠す" : "期限切れも表示"}
              </button>
            </div>
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="雑誌名や賞品名で検索..." style={searchInput} />
            <button onClick={() => setQ("")} style={btnSoft}>クリア</button>
          </div>
        </header>

        <div style={{ marginTop: 16 }}>
          <A8Ad htmlContent={`<a href="https://px.a8.net/svt/ejp?a8mat=4AZGCD+9TNIVU+4AHY+5Z6WX" rel="nofollow"><img border="0" width="468" height="60" alt="" src="https://www29.a8.net/svt/bgt?aid=260315005594&wid=002&eno=01&mid=s00000020023001004000&mc=1"></a>`} />
        </div>

        <section style={{ marginTop: 16 }}>
          {loading ? <div style={{ padding: 18 }}>読み込み中...</div> : (
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      {/* ✅ 雑誌名ボタンを大きく（padding と font-size アップ） */}
                      <Link href={`/magazine/${encodeURIComponent(clean(mag?.magazine_id || magTitle))}`} style={magTag}>
                        {magTitle}
                      </Link>
                      <button onClick={() => applied.toggle(prizeId)} style={{ ...statusBtn, background: done ? "#111" : "#fff", color: done ? "#fff" : "#111" }}>
                        {done ? "応募済" : "未応募"}
                      </button>
                    </div>

                    <div style={prizeTitle}>{clean(p.懸賞名) || "懸賞プレゼント"}</div>

                    <div style={prizeInfo}>
                      {release && <div><span style={label}>発売日：</span>{release}</div>}
                      <div><span style={label}>締　切：</span>{clean(p.締切) || "—"}</div>
                      <div><span style={label}>方　法：</span>{clean(p.応募方法) || "—"}</div>
                    </div>

                    {/* ✅ プレゼント内容を常に表示＆背景色で区切る */}
                    <div style={contentBox}>
                      <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 6, color: "#111" }}>プレゼント内容</div>
                      <ul style={prizeList}>
                        {lines.length ? lines.map((t, i) => <li key={i}>{t}</li>) : <li>{clean(p.内容) || "—"}</li>}
                      </ul>
                    </div>

                    <div style={buyRow} onClick={(e) => e.stopPropagation()}>
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
const searchInput: React.CSSProperties = { flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: 14 };
const card: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #eee", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", height: "100%" };
const magTag: React.CSSProperties = { fontSize: 14, fontWeight: 900, color: "#111", background: "#f0f4f8", padding: "6px 14px", borderRadius: 8, textDecoration: "none", border: "1px solid #dce6f2" };
const prizeTitle: React.CSSProperties = { marginTop: 14, fontSize: 17, fontWeight: 900, lineHeight: 1.4, color: "#111" };
const prizeInfo: React.CSSProperties = { marginTop: 12, fontSize: 14, color: "#333", display: "grid", gap: 6 };
const label: React.CSSProperties = { fontWeight: 900, color: "#777", display: "inline-block", width: 60 };
const contentBox: React.CSSProperties = { marginTop: 16, background: "#f9f9f9", padding: 14, borderRadius: 10, border: "1px solid #eee" };
const prizeList: React.CSSProperties = { margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6, color: "#222" };
const buyRow: React.CSSProperties = { marginTop: "auto", display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 16 };
const btnMiniDark: React.CSSProperties = { padding: "8px 16px", borderRadius: 8, background: "#111", color: "#fff", textDecoration: "none", fontSize: 12, fontWeight: 900 };
const btnMiniBlue: React.CSSProperties = { padding: "8px 16px", borderRadius: 8, background: "#2b6cff", color: "#fff", textDecoration: "none", fontSize: 12, fontWeight: 900 };
const statusBtn: React.CSSProperties = { padding: "6px 12px", borderRadius: 999, border: "1px solid #ddd", fontSize: 12, fontWeight: 900, cursor: "pointer" };