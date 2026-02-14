export const metadata = {
  title: "プライバシーポリシー",
};

export default function PrivacyPage() {
  return (
    <main style={wrap}>
      <h1>プライバシーポリシー</h1>

      <h2>広告配信について</h2>
      <p>
        当サイトでは第三者配信の広告サービスを利用しています。
        Cookieを使用する場合があります。
      </p>

      <h2>アクセス解析</h2>
      <p>
        当サイトではアクセス解析ツールを利用する場合があります。
      </p>

      <h2>免責事項</h2>
      <p>
        情報の正確性には努めていますが、内容を保証するものではありません。
      </p>

      <h2>著作権について</h2>
      <p>
        掲載画像・情報の著作権は各出版社・権利者に帰属します。
      </p>
    </main>
  );
}

const wrap: React.CSSProperties = {
  maxWidth: 800,
  margin: "0 auto",
  padding: 20,
};
