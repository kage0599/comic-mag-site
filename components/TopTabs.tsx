// app/components/TopLeftTabs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ✅ 漫画発売日サイトのURL（必要に応じて書き換えてください）
const MANGA_RELEASE_SITE_URL = "https://manga-tokuten.com";

export default function TopLeftTabs() {
  const pathname = usePathname();

  // アクティブ判定（詳細ページなどにいても「発売日一覧」を光らせる工夫）
  const isActive = (href: string) => {
    if (href === "/" && (pathname === "/" || pathname.startsWith("/magazine/"))) return true;
    return pathname === href;
  };

  const Tab = ({ href, label }: { href: string; label: string }) => (
    <Link href={href} className={`tab ${isActive(href) ? "active" : ""}`}>
      {label}
    </Link>
  );

  const ExtTab = ({ href, label }: { href: string; label: string }) => (
    <a href={href} target="_blank" rel="noreferrer" className="tab extTab">
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        {label}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.7 }}
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </span>
    </a>
  );

  return (
    <nav className="tabsContainer">
      <div className="tabsWrap">
        <Tab href="/" label="発売日一覧" />
        <Tab href="/prizes" label="懸賞一覧" />
        <Tab href="/services" label="全プレ一覧" />

        {/* ✅ 全プレの右側に配置 */}
        <ExtTab
          href={MANGA_RELEASE_SITE_URL}
          label="漫画発売日一覧"
        />
      </div>

      <style jsx>{`
        .tabsContainer {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #f6f7fb; /* 背景に馴染ませる */
          padding: 10px 0;
        }
        .tabsWrap {
          display: flex;
          gap: 8px;
          padding: 6px;
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          width: fit-content;
          max-width: 100%;
          overflow-x: auto;
          white-space: nowrap;
          -webkit-overflow-scrolling: touch;
          border: 1px solid #eee;
        }
        /* スクロールバー非表示（Chrome, Safari） */
        .tabsWrap::-webkit-scrollbar {
          display: none;
        }
        .tab {
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 900;
          color: #555;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tab:hover {
          background: #f1f3f6;
          color: #111;
        }
        .tab.active {
          background: #111;
          color: #fff;
        }
        .extTab {
          color: #2b6cff; /* 外部リンクは少し青っぽくして区別 */
        }
        .extTab:hover {
          background: #eef4ff;
          color: #0047e0;
        }

        @media (max-width: 520px) {
          .tab {
            padding: 7px 12px;
            font-size: 12px;
          }
        }
      `}</style>
    </nav>
  );
}