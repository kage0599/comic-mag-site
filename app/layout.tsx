import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

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
      <body style={{ margin: 0 }}>
        {children}

        {/* ✅ ここからフッター */}
        <footer style={footerStyle}>
          <div style={footerLinks}>
            <Link href="/about">運営者情報</Link>
            <Link href="/privacy">プライバシーポリシー</Link>
            <Link href="/contact">お問い合わせ</Link>
          </div>
          <p style={{ fontSize: 12, marginTop: 10 }}>
            © {new Date().getFullYear()} コミック誌情報まとめ
          </p>
          <p style={{ fontSize: 11, marginTop: 6 }}>
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

