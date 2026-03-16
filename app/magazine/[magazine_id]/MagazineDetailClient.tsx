"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFavorites } from "../../../components/useFavorites";
import A8Ad from "../../../components/A8Ad";
import { clean, splitByComma } from "../../../components/text";

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

  // ★修正1：URLのエンコード（%E9%80...等）を元の日本語にデコードする
  const rawId = (params as any)?.magazine_id || "";
  const id = clean(decodeURIComponent(rawId));

  const mags = Array.isArray(allData) ? allData : (allData?.mags || []);
  const prizes = allData?.prizes || [];
  const services = allData?.services || [];

  // ★修正1：IDだけでなく、タイトルとも一致するかチェック（より確実にマッチさせるため）
  const mag = useMemo(
    () => mags.find((m: any) => clean(m.magazine_id) === id || clean(m.タイトル) === id),
    [mags, id]
  );

  const myPrizes = useMemo(() => {
    const magId = clean(mag?.magazine_id);
    const magTitle = clean(mag?.タイトル);
    return prizes.filter((p: any) => {
      const pid = clean(p.magazine_id);
      return pid === id || (magId && pid === magId) || (magTitle && pid === magTitle);
    });
  }, [prizes, id, mag]);

  const myServices = useMemo(() => {
    const magId = clean(mag?.magazine_id);
    const magTitle = clean(mag?.タイトル);
    return services.filter((s: any) => {
      const sid = clean(s.magazine_id);
      return sid === id || (magId && sid === magId) || (magTitle && sid === magTitle);
    });
  }, [services, id, mag]);

  const title = mag?.タイトル || mag?.雑誌名 || id || "（雑誌名不明）";
  const isFav = fav.has(title);

  return (
    <main style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
        <header style={panel}>
          <button onClick={() => router.back()} style={btnBack}>
            ← 戻る
          </button>

          <div style={topFlex}>
            <div style={coverWrap}>
              {mag?.表紙画像 ? (
                <img
                  src={getHighResCover(mag.表紙画像)}
                  alt={`${title} 表紙`}
                  style={cover}
                />
              ) : (
                <div style={coverFallback}/>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={titleRow}>
                <h1 style={h1}>{title}</h1>

                <button
                  onClick={() => fav.toggle(title)}
                  style={starBtn(isFav)}
                >
                  {isFav ? "★" : "☆"}
                </button>
              </div>

              <div style={infoGrid}>
                <div><b>発売日：</b>{mag?.発売日 || "—"}</div>
                {/* ★修正2：出版社を削除しました */}
                <div><b>定価：</b>{mag?.値段 || "—"}</div>
              </div>

              <div style={btnRow}>
                {mag?.AmazonURL && (
                  <a
                    href={mag.AmazonURL}
                    target="_blank"
                    rel="noreferrer"
                    style={btnDark}
                  >
                    Amazon
                  </a>
                )}

                {/* ★修正3：KindleURL ではなく 電子版URL に修正し、オレンジ色に変更 */}
                {mag?.電子版URL && (
                  <a
                    href={mag.電子版URL}
                    target="_blank"
                    rel="noreferrer"
                    style={btnOrange}
                  >
                    Kindle
                  </a>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* SEO本文 */}
        <section style={seoText}>
          <p>
            {title}の最新号に掲載されている懸賞情報やアンケートプレゼント、
            応募者全員サービスの内容をまとめています。
            締切日や応募方法、プレゼント内容などを確認できます。
          </p>
        </section>

        {/* 広告 */}
        <div style={{ marginTop: 20 }}>
          <A8Ad htmlContent={`<a href="https://px.a8.net/svt/ejp?a8mat=4AZGCD+9TNIVU+4AHY+5Z6WX" rel="nofollow"><img border="0" width="468" height="60" src="https://www29.a8.net/svt/bgt?aid=260315005594&wid=002&eno=01&mid=s00000020023001004000&mc=1"></a>`} />
        </div>

        {/* 懸賞 */}
        {myPrizes.length > 0 && (
          <section style={{ marginTop: 24 }}>
            <h2 style={h2}>
              🎁 {title}の懸賞情報
            </h2>

            <div style={grid}>
              {myPrizes.map((p: any, idx: number) => {
                const lines = splitByComma(p.内容);

                return (
                  <article key={idx} style={card}>
                    <div style={prizeTitle}>
                      {p.懸賞名 || "今月の懸賞"}
                    </div>

                    <div style={meta}>
                      <span style={label}>締切：</span>
                      {p.締切 || "—"}
                      <br/>
                      <span style={label}>応募方法：</span>
                      {p.応募方法 || "—"}
                    </div>

                    {lines.length > 0 && (
                      <details>
                        <summary style={summary}>
                          プレゼント内容を見る
                        </summary>

                        <ul style={prizeList}>
                          {lines.map((t: string, i: number) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </details>
                    )}

                    {p.応募URL && (
                      <a
                        href={p.応募URL}
                        target="_blank"
                        rel="noreferrer"
                        style={btnApply}
                      >
                        応募はこちら
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* 全プレ */}
        {myServices.length > 0 && (
          <section style={{ marginTop: 30 }}>
            <h2 style={h2}>
              ✨ {title}の応募者全員サービス
            </h2>

            <div style={grid}>
              {myServices.map((s: any, idx: number) => (
                <article key={idx} style={card}>
                  <div style={prizeTitle}>
                    {s.内容 || "応募者全員サービス"}
                  </div>

                  <div style={meta}>
                    <span style={label}>締切：</span>
                    {s.締切 || "—"}
                    <br/>
                    <span style={label}>応募方法：</span>
                    {s.応募方法 || "—"}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* SEOキーワード */}
        <section style={seoBox}>
          <b>{title} 懸賞 / アンケート / 応募者全員サービス</b>
          <p style={{ marginTop: 6 }}>
            {title}の懸賞、プレゼント、アンケート応募、
            応募者全員サービス（全プレ）情報を掲載しています。
            最新号の締切や応募方法を確認できます。
          </p>
        </section>
      </div>
    </main>
  );
}

/* ===== style ===== */

const panel: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 18,
  border: "1px solid #eee"
};

const topFlex: React.CSSProperties = {
  display: "flex",
  gap: 20,
  flexWrap: "wrap",
  marginTop: 14
};

const coverWrap: React.CSSProperties = {
  width: 160,
  flexShrink: 0
};

const cover: React.CSSProperties = {
  width: "100%",
  height: "auto",
  objectFit: "contain",
  borderRadius: 10,
  border: "1px solid #eee"
};

const coverFallback: React.CSSProperties = {
  width: "100%",
  height: 220,
  background: "#eee",
  borderRadius: 10
};

const titleRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10
};

const h1: React.CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 900
};

const infoGrid: React.CSSProperties = {
  marginTop: 12,
  display: "grid",
  gap: 6,
  fontSize: 14
};

const btnRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 16,
  flexWrap: "wrap"
};

const btnDark: React.CSSProperties = {
  padding: "10px 16px",
  background: "#111",
  color: "#fff",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 14
};

// ★変更：オレンジ色のKindleボタン
const btnOrange: React.CSSProperties = {
  padding: "10px 16px",
  background: "#ff9900",
  color: "#fff",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 14
};

const grid: React.CSSProperties = {
  display: "grid",
  gap: 16
};

const card: React.CSSProperties = {
  background: "#fff",
  padding: 16,
  borderRadius: 14,
  border: "1px solid #eee"
};

const prizeTitle: React.CSSProperties = {
  fontWeight: 900,
  fontSize: 16
};

const meta: React.CSSProperties = {
  marginTop: 6,
  fontSize: 14,
  color: "#555"
};

const label: React.CSSProperties = {
  fontWeight: 900,
  color: "#777",
  marginRight: 4
};

const summary: React.CSSProperties = {
  marginTop: 10,
  cursor: "pointer",
  fontWeight: 700
};

const prizeList: React.CSSProperties = {
  marginTop: 8,
  paddingLeft: 18,
  lineHeight: 1.8
};

const btnApply: React.CSSProperties = {
  display: "inline-block",
  marginTop: 10,
  padding: "8px 14px",
  background: "#ff4d4f",
  color: "#fff",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 14
};

const h2: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 900
};

const seoText: React.CSSProperties = {
  marginTop: 16,
  lineHeight: 1.8,
  fontSize: 14
};

const seoBox: React.CSSProperties = {
  marginTop: 30,
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 12,
  padding: 16,
  fontSize: 13,
  color: "#666"
};

function starBtn(active: boolean): React.CSSProperties {
  return {
    width: 42,
    height: 42,
    borderRadius: "50%",
    border: "1px solid #ddd",
    background: active ? "#111" : "#fff",
    color: active ? "#fff" : "#111",
    cursor: "pointer",
    fontSize: 18,
    flexShrink: 0
  };
}

const btnBack: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
  padding: "4px 0"
};