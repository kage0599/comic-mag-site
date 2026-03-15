"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFavorites } from "./useFavorites";

// ✅ コミック誌サイトから「漫画サイト」へ飛ばすためのURL
const MANGA_RELEASE_SITE_URL = "https://manga-tokuten.com";

export default function TopLeftTabs() {
  const pathname = usePathname();
  const fav = useFavorites();
  
  // ✅ カッコ()を外してエラーを解消（安全のため初期値0も設定）
  const favCount = fav.list ? fav.list.length : 0;

  const isActive = (href: string) => pathname === href;

  const Tab = ({ href, label }: { href: string; label: string }) => (
    <Link href={href} className={`tab ${isActive(href) ? "active" : ""}`}>
      {label}
    </Link>
  );

  const ExtTab = ({ href, label }: { href: string; label: string }) => (
    <a href={href} target="_blank" rel="noreferrer" className="tab extTab">
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        {label}
        {/* ✅ 絵文字↗は端末で崩れるのでSVG固定 */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <path
            d="M14 5h5v5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 14L19 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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
    <nav className="headerFullBar">
      <div className="tabsWrap">
        <Tab href="/" label="発売日一覧" />
        <Tab href="/favorites" label={`お気に入り ★${favCount}`} />
        <Tab href="/prizes" label="懸賞一覧" />
        <Tab href="/services" label="全プレ一覧" />
        <ExtTab href={MANGA_RELEASE_SITE_URL} label="漫画発売日一覧" />
      </div>

      <style jsx>{`
        .headerFullBar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #fff;
          border-bottom: 1px solid #eee;
          width: 100%;
          display: flex;
          justify-content: flex-start; /* 左寄せ */
          padding: 12px 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .tabsWrap {
          display: flex;
          gap: 8px;
          max-width: 1100px;
          margin: 0 auto; 
          width: 100%;
          overflow-x: auto;
          white-space: nowrap;
          scrollbar-width: none;
        }
        .tabsWrap::-webkit-scrollbar { display: none; }
        .tab {
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 900;
          color: #555;
          background: #fff;
          border: 1px solid #ddd;
          transition: 0.2s;
        }
        .tab.active { background: #111; color: #fff; border-color: #111; }
        .extTab { color: #2b6cff; border-color: #bbd3ff; background: #f4f8ff; }
        @media (max-width: 480px) {
          .tab { padding: 8px 12px; font-size: 13px; }
        }
      `}</style>
    </nav>
  );
}