import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "コミック誌 情報まとめ",
  description: "発売日 / 懸賞 / 応募者全員サービス",
  verification: {
    google: "QvjZIVXrewSsk_JvwNtbP-cjhxF3Fa143mhYR-G8i7c",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        {/* ✅ AdSense 自動広告コード（正しく反映される形） */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8658592043491821"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
