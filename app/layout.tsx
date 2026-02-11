// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import TopTabs from "@/components/TopTabs";

export const metadata: Metadata = {
  title: "コミック誌 情報まとめ",
  description: "発売日 / 懸賞 / 応募者全員サービス",
  verification: {
    google: "QvjZIVXrewSsk_JvwNtbP-cjhxF3Fa143mhYR-G8i7c",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {/* ✅ AdSense（全ページ共通で読み込み） */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8658592043491821"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* ✅ 全ページ共通タブ */}
        <TopTabs />

        {children}
      </body>
    </html>
  );
}
