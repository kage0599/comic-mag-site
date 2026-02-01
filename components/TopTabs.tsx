"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MANGA_SITE_URL = "https://manga-site3.vercel.app";

export default function TopTabs() {
  const pathname = usePathname();

  const Tab = ({ href, label }: { href: string; label: string }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        style={{
          padding: "10px 14px",
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 900,
          textDecoration: "none",
          background: active ? "#111" : "#f1f3f6",
          color: active ? "#fff" : "#111",
          border: active ? "1px solid #111" : "1px solid #e3e6ee",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 120, // ✅ タブ幅を一定に
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Link>
    );
  };

  const External = ({ href, label }: { href: string; label: string }) => {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        style={{
          padding: "10px 14px",
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 900,
          textDecoration: "none",
          background: "#fff",
          color: "#111",
          border: "1px solid #ddd",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 120, // ✅ タブ幅を一定に
          whiteSpace: "nowrap",
        }}
      >
        {label} ↗
      </a>
    );
  };

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#f6f7fb",
        padding: "10px 0",
        borderBottom: "1px solid #eee",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 16px",
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <Tab href="/" label="発売日一覧" />
        <Tab href="/prizes" label="懸賞一覧" />
        <Tab href="/services" label="全プレ一覧" />

        {/* ✅ 外部リンク（別サイト） */}
        <External href={MANGA_SITE_URL} label="漫画発売日" />
      </div>
    </div>
  );
}
