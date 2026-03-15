// app/magazine/[magazine_id]/MagazineDetailClient.tsx
"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFavorites } from "../../../components/useFavorites";
import A8Ad from "../../../components/A8Ad";
import { clean, splitByComma } from "../../../components/text";

// ✅ 画像URLを高画質版に自動変換
function getHighResCover(url?: string) {
  const s = clean(url);
  if (!s) return "";
  if (s.includes("amazon.com") || s.includes("m.media-amazon.com")) {
    return s.replace(/\._S[LX]\d+_\./, "._SL500_.");
  }
  if (s.includes("rakuten.co.jp")) {
    return s.replace(/\?_ex=\d+x\d+/, "?_ex=500x500");
  }
  return s;
}

export default function MagazineDetailClient({ allData }: { allData: any }) {
  const params = useParams();
  const router = useRouter();
  const fav = useFavorites();
  const id = clean((params as any)?.magazine_id);

  // サーバーからもらったデータから該当する雑誌・懸賞・全サを探す
  const mags = Array.isArray(allData) ? allData : (allData.mags || []);
  const prizes = allData.prizes || [];
  const services = allData.services || [];

  const mag = useMemo(() => mags.find((m: any) => clean(m.magazine_id) === id), [mags, id]);
  const myPrizes = useMemo(() => prizes.filter((p: any) => clean(p.magazine_id) === id), [prizes, id]);
  const myServices = useMemo(() => services.filter((s: any) => clean(s.magazine_id) === id), [services, id]);

  const title = mag?.タイトル || mag?.雑誌名 || "（雑誌名不明）";
  const isFav = fav.has(title);

  return (
    <main style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
        
        <header style={panel}>
          <button onClick={() => router.back()} style={btnBack}>← 発売日一覧へ戻る</button>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 16 }}>
            <div style={{ width: 180, flexShrink: 0 }}>
              {/* ✅ 詳細はR18でも解禁（ぼかさない）＋ 高画質化 */}
              {mag?.表紙画像 ? (
                <img src={getHighResCover(mag.表紙画像)} alt={`${title} 表紙画像`} style={cover} />
              ) : (
                <div style={coverFallback} />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>{title}</h1>
                <button onClick={() => fav.toggle(title)} style={starBtn(isFav)}>
                  {isFav ? "★" : "☆"}
                </button>
              </div>

              <div style={{ marginTop: 12, fontSize: 14, color: "#555", display: "grid", gap: 6 }}>
                <div><b>発売日：</b>{mag?.発売日 || "—"}</div>
                <div><b>出版社：</b>{mag?.出版社 || "—"}</div>
                <div><b>定価：</b>{mag?.値段 || "—"}</div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                {mag?.AmazonURL && (
                  <a href={mag.AmazonURL} target="_blank" rel="noreferrer" style={btnDark}>Amazonで購入</a>
                )}
                {mag?.電子版URL && (
                  <a href={mag.電子版URL} target="_blank" rel="noreferrer" style={btnBlue}>電子版を読む</a>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ✅ A8広告エリア（中央） */}
        <div style={{ marginTop: 20 }}>
          <A8Ad htmlContent={`<a href="https://px.a8.net/svt/ejp?a8mat=4AZGCD+9TNIVU+4AHY+5Z6WX" rel="nofollow"><img border="0" width="468" height="60" alt="" src="https://www29.a8.net/svt/bgt?aid=260315005594&wid=002&eno=01&mid=s00000020023001004000&mc=1"></a>`} />
        </div>

        <section style={{ marginTop: 20 }}>
          {myPrizes.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={h2}>🎁 掲載されている懸賞情報</h2>
              <div style={{ display: "grid", gap: 14 }}>
                {myPrizes.map((p: any, idx: number) => {
                  const lines = splitByComma(p.内容);
                  return (
                    <article key={idx} style={card}>
                      <div style={{ fontSize: 17, fontWeight: 900, color: "#111" }}>{p.懸賞名 || "今月の懸賞"}</div>
                      <div style={{ marginTop: 8, fontSize: 14, color: "#555", lineHeight: 1.6 }}>
                        <span style={label}>締切：</span>{p.締切 || "—"} <br/>
                        <span style={label}>応募方法：</span>{p.応募方法 || "—"}
                      </div>

                      {lines.length > 0 && (
                        <ul style={prizeList}>
                          {lines.map((t: string, i: number) => <li key={i}>{t}</li>)}
                        </ul>
                      )}

                      {p.応募URL && (
                        <a href={p.応募URL} target="_blank" rel="noreferrer" style={btnSmall}>
                          公式サイトから応募
                        </a>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {myServices.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={h2}>✨ 応募者全員サービス</h2>
              <div style={{ display: "grid", gap: 14 }}>
                {myServices.map((s: any, idx: number) => (
                  <article key={idx} style={card}>
                    <div style={{ fontSize: 17, fontWeight: 900, color: "#111" }}>{s.内容 || "全員サービス応募"}</div>
                    <div style={{ marginTop: 8, fontSize: 14, color: "#555" }}>
                      <span style={label}>締切：</span>{s.締切 || "—"} / <span style={label}>方法：</span>{s.応募方法 || "—"}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ✅ SEO対策キーワード（検索エンジンに「店舗特典」や「懸賞」を読ませる） */}
        <section style={{ ...panel, marginTop: 24, fontSize: 12, color: "#888", lineHeight: 1.6 }}>
          <p style={{ margin: 0 }}>
            <b>{title}の関連キーワード：</b><br/>
            発売日 / 懸賞情報 / 応募者全員サービス / アンケート/応募/プレゼント / 電子書籍 / Amazon / 楽天ブックス<br/>
            最新号の懸賞情報や応募者全員サービスの内容をチェック！
          </p>
        </section>

        {/* ✅ A8広告エリア（下部） */}
        <div style={{ marginTop: 24, marginBottom: 40 }}>
          <A8Ad htmlContent={`<a href="https://px.a8.net/svt/ejp?a8mat=4AZGCD+9TNIVU+4AHY+5Z6WX" rel="nofollow"><img border="0" width="468" height="60" alt="" src="https://www29.a8.net/svt/bgt?aid=260315005594&wid=002&eno=01&mid=s00000020023001004000&mc=1"></a>`} />
        </div>
      </div>
    </main>
  );
}

/** ===== スタイル定義 ===== */
const panel: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: 16, border: "1px solid #eee", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" };
const btnBack: React.CSSProperties = { background: "none", border: "none", color: "#666", fontSize: 13, cursor: "pointer", fontWeight: 900, padding: 0 };
const cover: React.CSSProperties = { width: "100%", height: "auto", borderRadius: 12, border: "1px solid #eee", boxShadow: "0 6px 18px rgba(0,0,0,0.1)" };
const coverFallback: React.CSSProperties = { width: "100%", height: 240, background: "#eee", borderRadius: 12 };
const h2: React.CSSProperties = { margin: "20px 0 12px", fontSize: 18, fontWeight: 900, color: "#111" };
const card: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: 18, border: "1px solid #eee", boxShadow: "0 4px 10px rgba(0,0,0,0.02)" };
const label: React.CSSProperties = { fontWeight: 900, color: "#333" };
const prizeList: React.CSSProperties = { margin: "12px 0 0", paddingLeft: 20, fontSize: 15, lineHeight: 1.8, color: "#111" };
const btnDark: React.CSSProperties = { padding: "12px 20px", borderRadius: 12, background: "#111", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 900 };
const btnBlue: React.CSSProperties = { padding: "12px 20px", borderRadius: 12, background: "#2b6cff", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 900 };
const btnSmall: React.CSSProperties = { display: "inline-block", marginTop: 14, padding: "10px 16px", borderRadius: 10, background: "#f1f3f6", color: "#111", border: "1px solid #ddd", textDecoration: "none", fontSize: 13, fontWeight: 900 };
const errorBox: React.CSSProperties = { padding: 18, background: "#fff", borderRadius: 14, border: "1px solid #ffd2d2", color: "#b00020" };
function starBtn(active: boolean): React.CSSProperties { return { width: 44, height: 44, borderRadius: 999, border: "1px solid #ddd", background: active ? "#111" : "#fff", color: active ? "#fff" : "#111", cursor: "pointer", fontSize: 20, flexShrink: 0 }; }