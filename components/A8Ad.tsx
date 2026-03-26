// app/components/A8Ad.tsx
import React from "react";

type Props = {
  htmlContent: string;
};

export default function A8Ad({ htmlContent }: Props) {
  return (
    <div
      className="a8-ad-wrapper"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        overflow: "hidden",
        margin: "24px 0", // 記事やリストに密着しないよう上下に余白を追加
      }}
    >
      <style>{`
        .a8-ad-wrapper img {
          max-width: 100% !important;
          height: auto !important;
        }
      `}</style>
      {/* A8.netのタグをそのまま展開 */}
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}