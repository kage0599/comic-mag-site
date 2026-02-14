"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopTabs() {
  const pathname = usePathname();

  // ✅ 詳細ページでは非表示
  if (pathname.startsWith("/magazine/")) {
    return null;
  }

  const tabs = [
    { href: "/", label: "発売日一覧" },
    { href: "/prizes", label: "懸賞一覧" },
    { href: "/services", label: "全プレ一覧" },
  ];

  return (
    <div style={wrap}>
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              ...tabStyle,
              background: active ? "#111" : "#f1f1f1",
              color: active ? "#fff" : "#333",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

const wrap: React.CSSProperties = {
  display: "flex",
  gap: 10,
  padding: 12,
  justifyContent: "center",
  borderBottom: "1px solid #eee",
  background: "#fff",
  flexWrap: "wrap",
};

const tabStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 20,
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 700,
};
