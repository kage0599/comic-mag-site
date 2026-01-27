"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopTabs() {
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: "発売日（月別）" },
    { href: "/prizes", label: "懸賞" },
    { href: "/services", label: "全プレ" },
  ];

  return (
    <div style={wrap}>
      <div style={inner}>
        {tabs.map((t) => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              style={{
                ...tab,
                background: active ? "#111" : "#fff",
                color: active ? "#fff" : "#111",
              }}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  background: "rgba(246,247,251,0.9)",
  backdropFilter: "blur(6px)",
  padding: "10px 12px",
  borderBottom: "1px solid #eee",
};

const inner: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const tab: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 999,
  border: "1px solid #ddd",
  textDecoration: "none",
  fontWeight: 900,
  fontSize: 14,
};
