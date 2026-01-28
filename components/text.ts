export function clean(v: unknown) {
  return String(v ?? "").trim();
}

// ✅ "、" / "," / 改行をうまく分割して箇条書きにする
export function splitByComma(text?: string) {
  const s = clean(text);
  if (!s) return [];
  return s
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split(/\n|、|,/)
    .map((t) => t.trim())
    .filter(Boolean);
}

// ✅ R18判定（true/1/"true"/"R18" などOK）
export function isR18(v: unknown) {
  const s = clean(v).toLowerCase();
  if (v === true) return true;
  if (v === 1) return true;
  if (s === "true" || s === "1" || s === "r18" || s === "yes") return true;
  return false;
}

export function normalizeDate(v?: string) {
  const s = clean(v);
  if (!s) return "";
  return s.replace(/\//g, "-").slice(0, 10);
}

export function formatJpDate(ymd: string) {
  const [y, m, d] = ymd.split("-").map((n) => Number(n));
  const dt = new Date(y, m - 1, d);
  const w = ["日", "月", "火", "水", "木", "金", "土"][dt.getDay()];
  return `${y}年${m}月${d}日（${w}）`;
}

