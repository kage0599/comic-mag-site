"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
          border: "1px solid #ddd",
          fontWeight: 900,
          fontSize: 14,
          textDecoration: "none",
          background: active ? "#111" : "#fff",
          color: active ? "#fff" : "#111",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 120, // ✅ タブ幅を揃える
        }}
      >
        {label}
      </Link>
    );
  };

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <Tab href="/" label="発売日一覧" />
      <Tab href="/prizes" label="懸賞一覧" />
      <Tab href="/services" label="全プレ一覧" />
    </div>
  );
}
