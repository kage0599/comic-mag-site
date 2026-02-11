"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import TopTabs from "@/components/TopTabs";
import { useMagazines } from "@/components/useMagazines";
import { usePrizes } from "@/components/usePrizes";
import { useServices } from "@/components/useServices";
import { clean, splitByComma } from "@/components/text";


export default function MagazineDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = clean((params as any)?.magazine_id);

  const { items: mags, loading: magsLoading, error: magsError } = useMagazines();
  const { items: prizes, loading: pLoading, error: pError } = usePrizes();
  const { items: services, loading: sLoading, error: sError } = useServices();

  const mag = useMemo(() => mags.find((m) => clean(m.magazine_id) === id), [mags, id]);

  const myPrizes = useMemo(() => prizes.filter((p) => clean((p as any).magazine_id) === id), [prizes, id]);
  const myServices = useMemo(() => services.filter((s) => clean((s as any).magazine_id) === id), [services, id]);

  const loading = magsLoading || pLoading || sLoading;
  const error = magsError || pError || sError;

  const title = clean(mag?.タイトル) || "（雑誌が見つかりません）";
  const date = clean(mag?.発売日) || "—";
  const amazon = clean(mag?.AmazonURL);
  const ebook = clean((mag as any)?.電子版URL);

  return (
    <main style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
        {/* ✅ タブ */}
        <div style={{ marginBottom: 12 }}>
          <TopTabs />
        </div>

        {/* ✅ ヘッダー */}
        <header style={panel}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => router.back()} style={btnSoft}>
              ← 一覧に戻る
            </button>

            {/* 直リンク用（戻れない場合の保険） */}
            <Link href="/" style={{ ...btnSoft, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              発売日一覧へ
            </Link>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <div style={{ width: 150, flexShrink: 0 }}>
              {/* ✅ 詳細はR18でも解禁（ぼかさない） */}
              {mag?.表紙画像 ? <img src={mag.表紙画像} alt={title} style={cover} /> : <div style={coverFallback} />}
            </div>

            <div style={{ flex: 1, minWidth: 260 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, lineHeight: 1.35 }}>{title}</h1>

              <div style={{ marginTop: 6, fontSize: 13, color: "#555" }}>発売日：{date}</div>

              {/* ✅ 購入導線 */}
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                {amazon ? (
                  <a href={amazon} target="_blank" rel="noreferrer" style={btnDark}>
                    Amazonで購入
                  </a>
                ) : null}
                {ebook ? (
                  <a href={ebook} target="_blank" rel="noreferrer" style={btnBlue}>
                    電子版で読む
                  </a>
                ) : null}
              </div>

              {/* ✅ Amazon/電子版が無い場合の見た目 */}
              {!amazon && !ebook ? (
                <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: "#f1f3f6", color: "#666", fontSize: 13 }}>
                  購入リンクは未登録です
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {/* ✅ （広告を入れるならここ：ヘッダー直下が無難） */}
        {/* <AdUnit /> */}

        <section style={{ marginTop: 14 }}>
          {loading ? (
            <div style={{ padding: 18, color: "#555" }}>読み込み中...</div>
          ) : error ? (
            <div style={errorBox}>{error}</div>
          ) : (
            <>
              {/* ✅ 懸賞 */}
              {myPrizes.length > 0 ? (
                <>
                  <h2 style={h2}>懸賞</h2>
                  <div style={{ display: "grid", gap: 12 }}>
                    {myPrizes.map((p: any, idx: number) => {
                      const lines = splitByComma(p.内容);
                      return (
                        <article key={p.prize_id ?? idx} style={card}>
                          <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.35 }}>
                            {clean(p.懸賞名) || "懸賞"}
                          </div>

                          <div style={{ marginTop: 6, fontSize: 14, color: "#555", lineHeight: 1.6 }}>
                            締切：{clean(p.締切) || "—"} / 応募方法：{clean(p.応募方法) || "—"}
                          </div>

                          {lines.length ? (
                            <ul style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: 14, lineHeight: 1.7 }}>
                              {lines.map((t: string, i: number) => (
                                <li key={i}>{t}</li>
                              ))}
                            </ul>
                          ) : null}

                          <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
                            {p.応募URL ? (
                              <a href={p.応募URL} target="_blank" rel="noreferrer" style={btnSmall}>
                                WEB応募
                              </a>
                            ) : null}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </>
              ) : null}

              {/* ✅ 応募者全員サービス */}
              {myServices.length > 0 ? (
                <>
                  <h2 style={{ ...h2, marginTop: 18 }}>応募者全員サービス</h2>
                  <div style={{ display: "grid", gap: 12 }}>
                    {myServices.map((s: any, idx: number) => (
                      <article key={s.service_id ?? idx} style={card}>
                        <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.35 }}>
                          {clean(s.内容) || "—"}
                        </div>

                        <div style={{ marginTop: 6, fontSize: 14, color: "#555", lineHeight: 1.6 }}>
                          締切：{clean(s.締切) || "—"} / 応募方法：{clean(s.応募方法) || "—"}
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              ) : null}

              {/* ✅ どっちも0件なら何も出さない方針のまま */}
              {myPrizes.length === 0 && myServices.length === 0 ? (
                <div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: "#fff", border: "1px solid #eee", color: "#555" }}>
                  この号に登録されている「懸賞 / 応募者全員サービス」はまだありません
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

const panel: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 16,
  border: "1px solid #eee",
};

const btnSoft: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 13,
  color: "#111",
};

const cover: React.CSSProperties = {
  width: "100%",
  height: "auto",
  borderRadius: 12,
  border: "1px solid #eee",
};

const coverFallback: React.CSSProperties = {
  width: "100%",
  height: 200,
  background: "#eee",
  borderRadius: 12,
};

const h2: React.CSSProperties = {
  margin: "14px 0 10px",
  fontSize: 18,
  fontWeight: 900,
};

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 14,
  border: "1px solid #eee",
};

const btnDark: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  background: "#111",
  color: "#fff",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 900,
};

const btnBlue: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  background: "#2b6cff",
  color: "#fff",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 900,
};

const btnSmall: React.CSSProperties = {
  display: "inline-block",
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  color: "#111",
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
