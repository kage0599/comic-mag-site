"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFavorites } from "../../../components/useFavorites";
import A8Ad from "../../../components/A8Ad";
import { clean, splitByComma } from "../../../components/text";

import { useMagazines } from "../../../components/useMagazines";
import { usePrizes } from "../../../components/usePrizes";
import { useServices } from "../../../components/useServices";

/* =============================
  表紙高画質化
============================= */
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

/* =============================
  メイン
============================= */
export default function MagazineDetailClient() {
  const params = useParams();
  const router = useRouter();
  const fav = useFavorites();

  const rawId = (params as any)?.magazine_id || "";
  const id = clean(decodeURIComponent(rawId));

  const { items: mags, loading: magLoad } = useMagazines();
  const { items: prizes, loading: przLoad } = usePrizes();
  const { items: services, loading: svcLoad } = useServices();

  const loading = magLoad || przLoad || svcLoad;

  /* =============================
    雑誌取得
  ============================= */
  const mag = useMemo(() => {
    return mags.find((m: any) => {
      const mid = clean(m.magazine_id);
      const title = clean(m.タイトル);

      return (
        mid === id ||
        title === id ||
        id.includes(title) ||
        title.includes(id)
      );
    });
  }, [mags, id]);

  /* =============================
    懸賞取得
  ============================= */
  const myPrizes = useMemo(() => {
    const magId = clean(mag?.magazine_id);
    const magTitle = clean(mag?.タイトル);

    return prizes.filter((p: any) => {
      const pid = clean(p.magazine_id);

      return (
        pid === id ||
        pid === magId ||
        pid === magTitle ||
        pid.includes(magTitle) ||
        magTitle?.includes(pid)
      );
    });
  }, [prizes, id, mag]);

  /* =============================
    全プレ取得
  ============================= */
  const myServices = useMemo(() => {
    const magId = clean(mag?.magazine_id);
    const magTitle = clean(mag?.タイトル);

    return services.filter((s: any) => {
      const sid = clean(s.magazine_id);

      return (
        sid === id ||
        sid === magId ||
        sid === magTitle ||
        sid.includes(magTitle) ||
        magTitle?.includes(sid)
      );
    });
  }, [services, id, mag]);

  const title = mag?.タイトル || id;
  const isFav = fav.has(title);

  /* =============================
    UI
  ============================= */

  if (loading) {
    return (
      <main style={main}>
        <div style={container}>
          <header style={panel}>
            <button onClick={() => router.back()} style={btnBack}>← 戻る</button>
            <div style={{ padding: 40, textAlign: "center", fontWeight: 900 }}>
              データを読み込み中...
            </div>
          </header>
        </div>
      </main>
    );
  }

  return (
    <main style={main}>
      <div style={container}>
        <header style={panel}>
          <button onClick={() => router.back()} style={btnBack}>
            ← 戻る
          </button>

          <div className="topArea">
            <div className="coverWrap">
              {mag?.表紙画像 ? (
                <img
                  src={getHighResCover(mag.表紙画像)}
                  alt={`${title} 表紙`}
                  className="coverImage"
                />
              ) : (
                <div className="coverFallback" />
              )}
            </div>

            <div className="infoWrap">
              <div className="titleRow">
                <h1 className="magTitle">{title}</h1>
                <button
                  onClick={() => fav.toggle(title)}
                  style={starBtn(isFav)}
                >
                  {isFav ? "★" : "☆"}
                </button>
              </div>

              <div style={infoGrid}>
                <div><b>発売日：</b>{mag?.発売日 || "—"}</div>
                <div><b>定価：</b>{mag?.値段 || "—"}</div>
              </div>

              <div className="buyBtns">
                {mag?.AmazonURL && (
                  <a href={mag.AmazonURL} target="_blank" rel="noreferrer" className="buyBtn amazonBtn">
                    Amazon
                  </a>
                )}
                {mag?.電子版URL && (
                  <a href={mag.電子版URL} target="_blank" rel="noreferrer" className="buyBtn kindleBtn">
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
            {title}に掲載されている懸賞情報やアンケート、
            応募者全員サービスの内容をまとめています。
            締切日や応募方法、プレゼント内容などを確認できます。
          </p>
        </section>

        {/* 広告①：元々設置されていた広告 */}
        <div style={{ marginTop: 20 }}>
          <A8Ad htmlContent={`<a href="https://px.a8.net/svt/ejp?a8mat=4AZGCD+9TNIVU+4AHY+5Z6WX" rel="nofollow"><img border="0" width="468" height="60" src="https://www29.a8.net/svt/bgt?aid=260315005594&wid=002&eno=01&mid=s00000020023001004000&mc=1"></a>`} />
        </div>

        {/* 懸賞 */}
        <section style={section}>
          <h2 style={h2}>
             {title}の懸賞情報
          </h2>

          {myPrizes.length === 0 ? (
            <div style={emptyBox}>
              現在掲載されている懸賞はありません
            </div>
          ) : (
            <div style={grid}>
              {myPrizes.map((p: any, idx: number) => {
                const lines = splitByComma(p.内容);
                return (
                  <article key={idx} style={card}>
                    <div style={prizeTitle}>
                      {p.懸賞名 || "今月の懸賞"}
                    </div>

                    <div style={meta}>
                      <span style={label}>締切：</span>{p.締切 || "—"}
                      <br />
                      <span style={label}>応募方法：</span>{p.応募方法 || "—"}
                    </div>

                    {lines.length > 0 && (
                      <details style={details}>
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
                      <a href={p.応募URL} target="_blank" rel="noreferrer" style={btnApply}>
                        応募はこちら
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* 全プレ */}
        <section style={section}>
          <h2 style={h2}>
             {title}の応募者全員サービス
          </h2>

          {myServices.length === 0 ? (
            <div style={emptyBox}>
              現在応募できる全員サービスはありません
            </div>
          ) : (
            <div style={grid}>
              {myServices.map((s: any, idx: number) => (
                <article key={idx} style={card}>
                  <div style={prizeTitle}>
                    {s.内容 || "応募者全員サービス"}
                  </div>

                  <div style={meta}>
                    <span style={label}>締切：</span>{s.締切 || "—"}
                    <br />
                    <span style={label}>応募方法：</span>{s.応募方法 || "—"}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* 広告②：今回追加いただいた新しい広告（1px画像込み） */}
        <div style={{ marginTop: 40, marginBottom: 20 }}>
          <A8Ad htmlContent={`
            <a href="https://px.a8.net/svt/ejp?a8mat=4AZOWQ+10BI82+13X8+61RI9" rel="nofollow">
            <img border="0" width="468" height="60" alt="" src="https://www23.a8.net/svt/bgt?aid=260326106061&wid=003&eno=01&mid=s00000005174001016000&mc=1"></a>
            <img border="0" width="1" height="1" src="https://www12.a8.net/0.gif?a8mat=4AZOWQ+10BI82+13X8+61RI9" alt="">
          `} />
        </div>

      </div>

      {/* スマホとPCで見た目を切り替えるCSS */}
      <style jsx>{`
        .topArea {
          display: flex;
          gap: 16px;
          margin-top: 16px;
        }
        .coverWrap {
          width: 110px;
          flex-shrink: 0;
        }
        .coverImage {
          width: 100%;
          border-radius: 8px;
          object-fit: contain;
          border: 1px solid #eee;
        }
        .coverFallback {
          width: 100%;
          height: 160px;
          background: #eee;
          border-radius: 8px;
        }
        .infoWrap {
          flex: 1;
          min-width: 0;
        }
        .titleRow {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }
        .magTitle {
          margin: 0;
          font-size: 18px;
          font-weight: 900;
          line-height: 1.4;
        }
        .buyBtns {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }
        .buyBtn {
          flex: 1;
          text-align: center;
          padding: 10px 4px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 13px;
          text-decoration: none;
          color: #fff;
        }
        .amazonBtn {
          background: #111;
        }
        .kindleBtn {
          background: #ff9900;
        }

        @media (min-width: 640px) {
          .topArea {
            gap: 24px;
          }
          .coverWrap {
            width: 160px;
          }
          .coverFallback {
            height: 220px;
          }
          .magTitle {
            font-size: 24px;
          }
          .buyBtn {
            flex: none;
            padding: 12px 24px;
            font-size: 14px;
          }
        }
      `}</style>
    </main>
  );
}

/* =============================
  STYLE
============================= */
const main: React.CSSProperties = { minHeight: "100vh", background: "#f6f7fb" };
const container: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: 16 };
const panel: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: 18, border: "1px solid #eee" };
const infoGrid: React.CSSProperties = { marginTop: 12, display: "grid", gap: 6, fontSize: 14, color: "#444" };
const section: React.CSSProperties = { marginTop: 28 };
const grid: React.CSSProperties = { display: "grid", gap: 20 };
const card: React.CSSProperties = { background: "#fff", padding: 18, borderRadius: 14, border: "1px solid #eee" };
const prizeTitle: React.CSSProperties = { fontWeight: 900, fontSize: 16 };
const meta: React.CSSProperties = { marginTop: 8, lineHeight: 1.6 };
const label: React.CSSProperties = { fontWeight: 900, color: "#666" };
const details: React.CSSProperties = { marginTop: 12 };
const summary: React.CSSProperties = { cursor: "pointer", fontWeight: 700, outline: "none" };
const prizeList: React.CSSProperties = { marginTop: 8, paddingLeft: 18, color: "#444", lineHeight: 1.6 };
const btnApply: React.CSSProperties = { display: "inline-block", marginTop: 14, background: "#ff4d4f", color: "#fff", padding: "10px 16px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 14 };
const h2: React.CSSProperties = { fontSize: 20, fontWeight: 900 };
const seoText: React.CSSProperties = { marginTop: 18, lineHeight: 1.9, color: "#555", fontSize: 14 };
const emptyBox: React.CSSProperties = { padding: 16, background: "#fff", borderRadius: 10, border: "1px solid #eee", color: "#777", textAlign: "center" };

function starBtn(active: boolean): React.CSSProperties {
  return {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "1px solid #ddd",
    background: active ? "#111" : "#fff",
    color: active ? "#fff" : "#111",
    cursor: "pointer",
    fontSize: 18,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };
}

const btnBack: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#2b6cff", padding: "0 0 8px 0" };