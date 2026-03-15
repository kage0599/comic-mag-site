"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopLeftTabs() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <nav className="headerBar">
      <div className="tabsWrap">
        <Link href="/" className={`tab ${isActive("/") ? "active" : ""}`}>発売日一覧</Link>
        <Link href="/favorites" className={`tab ${isActive("/favorites") ? "active" : ""}`}>お気に入り ★</Link>
        <Link href="/prizes" className={`tab ${isActive("/prizes") ? "active" : ""}`}>懸賞一覧</Link>
        <Link href="/services" className={`tab ${isActive("/services") ? "active" : ""}`}>全プレ一覧</Link>
        {/* 漫画サイトへのリンク（ドメインはご自身のものに合わせてください） */}
        <a href="https://manga-tokuten.com" target="_blank" rel="noreferrer" className="tab extTab">漫画発売日一覧</a>
      </div>

      <style jsx>{`
        .headerBar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #f6f7fb;
          width: 100%;
          display: flex;
          justify-content: flex-start;
          padding: 12px 16px;
        }
        .tabsWrap {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          white-space: nowrap;
          scrollbar-width: none;
        }
        .tabsWrap::-webkit-scrollbar { display: none; }
        .tab {
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 999px; /* 丸いタブ */
          font-size: 13px;
          font-weight: 900;
          color: #111;
          background: #fff;
          border: 1px solid #ddd;
          transition: 0.2s;
        }
        .tab.active {
          background: #111;
          color: #fff;
          border-color: #111;
        }
        .extTab { background: #eee; border: none; }
      `}</style>
    </nav>
  );
}