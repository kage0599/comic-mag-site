"use client";

import React, { useMemo } from "react";
import { useServices } from "../../components/useServices";
import { useMagazines } from "../../components/useMagazines";

function clean(v: unknown) {
  return String(v ?? "").trim();
}

export default function ServicesPage() {
  const { items, loading, error } = useServices();
  const { items: mags } = useMagazines();

  const list = useMemo(() => {
    const map = new Map(mags.map((m) => [clean(m.magazine_id), clean(m.タイトル)]));
    return items.map((s) => ({ ...s, _magTitle: map.get(clean(s.magazine_id)) || "" }));
  }, [items, mags]);

  return (
    <main style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
        <header style={panel}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>応募者全員サービス</h1>
          <div style={{ marginTop: 6, fontSize: 15, color: "#555", fontWeight: 700 }}>
            文字を大きめで見やすく表示
          </div>
        </header>

        <section style={{ marginTop: 14 }}>
          {loading ? (
            <div style={{ padding: 18, color: "#555" }}>読み込み中...</div>
          ) : error ? (
            <div style={errorBox}>{error}</div>
          ) : list.length === 0 ? (
            <div style={emptyBox}>データがありません</div>
          ) : (
            <div style={grid}>
              {list.map((s, idx) => (
                <article key={`${s.service_id || idx}`} style={card}>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{clean(s._magTitle) || "（雑誌）"}</div>
                  <div style={{ marginTop: 8, fontSize: 16, lineHeight: 1.7, fontWeight: 700 }}>
                    {clean(s.内容) || "—"}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 16 }}>
                    応募方法：<b>{clean(s.応募方法) || "—"}</b>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 16, fontWeight: 900 }}>
                    締切：{clean(s.締切) || "—"}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const panel: React.CSSProperties = {
  background: "white",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
  gap: 14,
};

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
};

const errorBox: React.CSSProperties = {
  padding: 18,
  background: "#fff",
  borderRadius: 14,
  border: "1px solid #ffd2d2",
  color: "#b00020",
};

const emptyBox: React.CSSProperties = {
  padding: 18,
  background: "#fff",
  borderRadius: 14,
  color: "#555",
};
