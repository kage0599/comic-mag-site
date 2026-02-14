export const metadata = {
  title: "運営者情報",
};

export default function AboutPage() {
  return (
    <main style={wrap}>
      <h1>運営者情報</h1>
      <p>サイト名：コミック誌情報まとめ</p>
      <p>運営者：〇〇〇〇</p>
      <p>連絡先：contact@example.com</p>
      <p>
        当サイトは漫画雑誌の発売日・懸賞情報をまとめる情報提供サイトです。
      </p>
      <p>
        Amazonアソシエイト等のアフィリエイト広告を利用しています。
      </p>
    </main>
  );
}

const wrap: React.CSSProperties = {
  maxWidth: 800,
  margin: "0 auto",
  padding: 20,
};
