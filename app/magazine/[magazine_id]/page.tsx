"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import { useMagazines } from "../../../components/useMagazines";
import { usePrizes } from "../../../components/usePrizes";
import { useServices } from "../../../components/useServices";
import { clean, splitByComma } from "../../../components/text";

export default function MagazineDetailPage() {
  const params = useParams();
  const id = clean((params as any)?.magazine_id);

  const { items: mags, loading: magsLoading, error: magsError } = useMagazines();
  const { items: prizes, loading: pLoading, error: pError } = usePrizes();
  const { items: services, loading: sLoading, error: sError } = useServices();

  const mag = useMemo(() => mags.find((m) => clean(m.magazine_id) === id), [mags, id]);

  const myPrizes = useMemo(
    () => prizes.filter((p) => clean(p.magazine_id) === id),
    [prizes, id]
  );

  const myServices = useMemo(
    () => services.filter((s) => clean(s.magazine_id) === id),
    [services, id]
  );

  const loading = magsLoading || pLoading || sLoading;
  const error = magsError || pError || sError;

  return (
    <main style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
        {/* ✅ TABは出さない（ここではTopTabsを呼ばない） */}

        <header style={panel}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <div style={{ width: 150 }}>
              {/* ✅ 詳細はR18でも解禁（ぼかさない） */}
              {mag?.表紙画像 ? (
                <img src={mag.表紙画像} alt={mag?.タイトル || ""} style={cover} />
              ) : (
                <div style={coverFallback} />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 260 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>
                {mag?.タイトル || "（雑誌が見つかりません）"}
              </h1>

              <div style={{ marginTop: 6, fontSize: 13, color: "#555" }}>
                発売日：{mag?.発売日 || "—"}
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                {mag?.AmazonURL ? (
                  <a href={mag.AmazonURL} target="_blank" rel="noreferrer" style={btnDark}>
                    Amazon
                  </a>
                ) : null}
                {mag?.電子版URL ? (
                  <a href={mag.電子版URL} target="_blank" rel="noreferrer" style={btnBlue}>
                    電子版
                  </a>
                ) : null}
              </div>

              {/* ✅ 「発売日一覧へ」ボタンは置かない */}
            </div>
          </div>
        </header>

        <section style={{ marginTop: 14 }}>
          {loading ? (
            <div style={{ padding: 18, color: "#555" }}>読み込み中...</div>
          ) : error ? (
            <div style={errorBox}>{error}</div>
          ) : (
            <>
              {myPrizes.length > 0 ? (
                <>
                  <h2 style={h2}>懸賞</h2>
                  <div style={{ display: "grid", gap: 12 }}>
                    {myPrizes.map((p, idx) => {
                      const lines = splitByComma(p.内容);
                      return (
                        <article key={clean(p.prize_id) || idx} style={card}>
                          <div style={{ fontSize: 16, fontWeight: 900 }}>{p.懸賞名 || "懸賞"}</div>
                          <div style={{ marginTop: 6, fontSize: 14, color: "#555" }}>
                            締切：{p.締切 || "—"} / 応募方法：{p.応募方法 || "—"}
                          </div>

                          {lines.length ? (
                            <ul style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: 14, lineHeight: 1.7 }}>
                              {lines.map((t, i) => (
                                <li key={i}>{t}</li>
                              ))}
                            </ul>
                          ) : null}

                          {p.応募URL ? (
                            <a href={p.応募URL} target="_blank" rel="noreferrer" style={btnSmall}>
                              WEB応募
                            </a>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                </>
              ) : null}

              {myServices.length > 0 ? (
                <>
                  <h2 style={{ ...h2, marginTop: 18 }}>応募者全員サービス</h2>
                  <div style={{ display: "grid", gap: 12 }}>
                    {myServices.map((s, idx) => (
                      <article key={clean(s.service_id) || idx} style={card}>
                        <div style={{ fontSize: 16, fontWeight: 900 }}>{s.内容 || "—"}</div>
                        <div style={{ marginTop: 6, fontSize: 14, color: "#555" }}>
                          締切：{s.締切 || "—"} / 応募方法：{s.応募方法 || "—"}
                        </div>
                      </article>
                    ))}
                  </div>
                </>
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
  marginTop: 10,
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
