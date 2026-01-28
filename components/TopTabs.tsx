"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopTabs() {
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: "発売日" },
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
                borderColor: active ? "#111" : "#ddd",
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
  background: "rgba(246,247,251,0.92)",
  backdropFilter: "blur(8px)",
  padding: "10px 12px",
  borderBottom: "1px solid #eee",
};

const inner: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  display: "flex",
  gap: 10,
};

const tab: React.CSSProperties = {
  flex: 1,               // ✅ 幅を均等化
  textAlign: "center",   // ✅ 中央寄せ
  padding: "12px 0",
  borderRadius: 999,
  border: "1px solid #ddd",
  textDecoration: "none",
  fontWeight: 900,
  fontSize: 14,
  whiteSpace: "nowrap",
};
