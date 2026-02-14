"use client";

import { useEffect, useState } from "react";

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={btn}
    >
      ↑
    </button>
  );
}

const btn: React.CSSProperties = {
  position: "fixed",
  bottom: 30,
  right: 20,
  width: 45,
  height: 45,
  borderRadius: "50%",
  background: "#111",
  color: "#fff",
  border: "none",
  fontSize: 18,
  cursor: "pointer",
  zIndex: 999,
};
