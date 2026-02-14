import "./globals.css";
import type { Metadata } from "next";
import TopTabs from "../components/TopTabs";
import BackToTop from "../components/BackToTop";

export const metadata: Metadata = {
  title: "コミック誌発売日・懸賞まとめ",
  description: "漫画雑誌の発売日・懸賞・応募者全員サービス情報まとめ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, background: "#f6f7fb" }}>
        {/* ✅ タブ表示（制御はTopTabs内でやる） */}
        <TopTabs />

        {children}

        <BackToTop />

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
