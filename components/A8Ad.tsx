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
      }}
    >
      <style>{`
        .a8-ad-wrapper img {
          max-width: 100% !important;
          height: auto !important;
        }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}