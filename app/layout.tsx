// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import TopLeftTabs from "../components/TopTabs"; // ✅ 名前を合わせたコンポーネントに変更
import BackToTop from "../components/BackToTop";

// ✅ メタデータの大幅強化
export const metadata: Metadata = {
  metadataBase: new URL('https://manga-tokuten.online'), 
  title: {
    default: "コミック誌発売日・懸賞・全プレまとめ",
    template: "%s | コミック誌発売日・懸賞・全プレまとめ",
  },
  description: "週刊少年ジャンプ、マガジン、サンデーから青年誌、成人向け雑誌まで。最新号の発売日、店舗特典、懸賞の締切、応募者全員サービス情報を毎日更新！",
  verification: {
    google: "8QSiGgapWP7-gtzGn6QKnfTjMa7JSvPPStEtoPglIO8",
  },
  openGraph: {
    title: "コミック誌発売日・懸賞・全プレまとめ",
    description: "雑誌ごとの発売日や懸賞の締切を一目でチェック！",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, background: "#f6f7fb", color: "#111" }}>
        {/* ✅ Google AdSense (lazyOnloadで初期表示を高速化) */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8658592043491821"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />

        {/* ✅ ヘッダー：共通タブ */}
        <header style={{ padding: "10px 16px 0" }}>
          <TopLeftTabs />
        </header>

        <main>{children}</main>

        <BackToTop />

        {/* ✅ フッター：漫画サイトとトーンを統一 */}
        <footer style={footerStyle}>
          <div style={footerLinks}>
            <a href="/about" style={footerLink}>運営者情報</a>
            <a href="/privacy" style={footerLink}>プライバシーポリシー</a>
            <a href="/contact" style={footerLink}>お問い合わせ</a>
          </div>

          <div style={{ fontSize: 13, marginTop: 24, fontWeight: 900 }}>
            © {new Date().getFullYear()} コミック誌発売日・懸賞まとめ
          </div>

          <p style={{ fontSize: 11, marginTop: 10, opacity: 0.6, lineHeight: 1.6 }}>
            当サイトは雑誌の発売情報や懸賞情報をまとめたファンサイトです。<br/>
            ※一部作品には18歳以上向けコンテンツが含まれます。
          </p>
        </footer>
      </body>
    </html>
  );
}

// --- デザイン定義 ---
const footerStyle: React.CSSProperties = {
  marginTop: 60,
  padding: "40px 20px",
  background: "#fff", // 漫画サイトと同じ白ベースに変更
  borderTop: "1px solid #eee",
  color: "#111",
  textAlign: "center",
};

const footerLinks: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: 24,
  flexWrap: "wrap",
};

const footerLink: React.CSSProperties = {
  color: "#555",
  fontSize: 13,
  fontWeight: 900,
  textDecoration: "none",
};