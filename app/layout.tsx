import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import TopTabs from "../components/TopTabs";
import BackToTop from "../components/BackToTop";

// ✅ メタデータの設定（verificationをオブジェクト内に正しく配置）
export const metadata: Metadata = {
  title: "コミック誌発売日・懸賞まとめ",
  description: "漫画雑誌の発売日・懸賞・応募者全員サービス情報まとめ",
  verification: {
    google: "8QSiGgapWP7-gtzGn6QKnfTjMa7JSvPPStEtoPglIO8", // 最新の方を反映
  },
};

<meta name="google-site-verification" content="8QSiGgapWP7-gtzGn6QKnfTjMa7JSvPPStEtoPglIO8" />

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        {/* ✅ Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8658592043491821"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body style={{ margin: 0, background: "#f6f7fb" }}>
        {/* ✅ 共通ヘッダー・タブ */}
        <TopTabs />

        {/* ✅ メインコンテンツ */}
        <main>{children}</main>

        {/* ✅ トップへ戻るボタン */}
        <BackToTop />

        {/* ✅ 共通フッター */}
        <footer style={footerStyle}>
          <div style={footerLinks}>
            <a href="/about" style={footerLink}>
              運営者情報
            </a>
            <a href="/privacy" style={footerLink}>
              プライバシーポリシー
            </a>
            <a href="/contact" style={footerLink}>
              お問い合わせ
            </a>
          </div>

          <p style={{ fontSize: 12, marginTop: 12 }}>
            © {new Date().getFullYear()} コミック誌情報まとめ
          </p>

          <p style={{ fontSize: 11, marginTop: 6, opacity: 0.7 }}>
            ※一部作品には18歳以上向けコンテンツが含まれます。
          </p>
        </footer>
      </body>
    </html>
  );
}

// --- スタイル定義 ---

const footerStyle: React.CSSProperties = {
  marginTop: 60,
  padding: "30px 20px",
  background: "#111",
  color: "#fff",
  textAlign: "center",
};

const footerLinks: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: 20,
  flexWrap: "wrap",
};

const footerLink: React.CSSProperties = {
  color: "#fff",
  fontSize: 14,
  fontWeight: 700,
  textDecoration: "none",
};