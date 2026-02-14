export const metadata = {
  title: "お問い合わせ",
};

export default function ContactPage() {
  return (
    <main style={wrap}>
      <h1>お問い合わせ</h1>
      <p>お問い合わせは下記メールアドレスまでお願いいたします。</p>

      <p style={{ marginTop: 10 }}>
        <a href="songjingheye3@gmail.com">
          contact@example.com
        </a>
      </p>
    </main>
  );
}

const wrap: React.CSSProperties = {
  maxWidth: 800,
  margin: "0 auto",
  padding: 20,
};
