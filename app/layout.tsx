import "./globals.css";
import TopTabs from "../components/TopTabs";

export const metadata = {
  title: "コミック誌 情報まとめ",
  description: "発売日 / 懸賞 / 応募者全員サービス",
   verification: {
    google: "QvjZIVXrewSsk_JvwNtbP-cjhxF3Fa143mhYR-G8i7c", // ←ここに貼る
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  );
}

