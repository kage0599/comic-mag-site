"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MANGA_SITE_URL = "https://manga-tokuten.com";

export default function TopLeftTabs() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <nav className="headerBar">
      <div className="tabsWrap">
        <Link href="/" className={`tab ${isActive("/") ? "active" : ""}`}>発売日一覧</Link>
        <Link href="/prizes" className={`tab ${isActive("/prizes") ? "active" : ""}`}>懸賞一覧</Link>
        <Link href="/services" className={`tab ${isActive("/services") ? "active" : ""}`}>全プレ一覧</Link>
        <Link href="/favorites" className={`tab ${isActive("/favorites") ? "active" : ""}`}>★お気に入り</Link>
        
        <a href={MANGA_SITE_URL} target="_blank" rel="noreferrer" className="tab extTab">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            漫画発売日
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
          </span>
        </a>
      </div>

      <style jsx>{`
        .headerBar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #fff;
          border-bottom: 1px solid #eee;
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 8px 0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .tabsWrap {
          display: flex;
          gap: 4px;
          max-width: 1100px;
          width: 100%;
          padding: 0 16px;
          overflow-x: auto;
          white-space: nowrap;
          scrollbar-width: none;
        }
        .tabsWrap::-webkit-scrollbar { display: none; }
        .tab {
          text-decoration: none;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 900;
          color: #666;
          transition: 0.2s;
        }
        .tab.active { background: #111; color: #fff; }
        .extTab { color: #2b6cff; }
        @media (max-width: 500px) {
          .tab { padding: 8px 10px; font-size: 12px; }
        }
      `}</style>
    </nav>
  );
}