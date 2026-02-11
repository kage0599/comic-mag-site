"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MANGA_RELEASE_SITE_URL = "https://manga-site3.vercel.app"; // ←漫画発売日サイト

export default function TopTabs() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const Tab = ({ href, label }: { href: string; label: string }) => (
    <Link href={href} className={`tab ${isActive(href) ? "active" : ""}`}>
      {label}
    </Link>
  );

  const ExtTab = ({ href, label }: { href: string; label: string }) => (
    <a href={href} target="_blank" rel="noreferrer" className="tab">
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        {label}
        {/* ✅ 端末で崩れない外部リンクアイコン */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <path d="M14 5h5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 14L19 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M19 14v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </a>
  );

  return (
    <div className="tabsWrap">
      <Tab href="/" label="発売日一覧" />
      <Tab href="/prizes" label="懸賞一覧" />
      <Tab href="/services" label="全プレ一覧" />
      <ExtTab href={MANGA_RELEASE_SITE_URL} label="漫画発売日サイト" />
    </div>
  );
}
