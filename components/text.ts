export function splitLines(s?: string) {
  const text = String(s ?? "").trim();
  if (!text) return [];

  // 1セルに「A. ...、B. ...、C. ...」みたいに入ってるケースを見やすく分解
  // ・「、」「,」で分ける
  // ・「A.」「B.」等の前でも分ける
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // まず「A.」等の前に改行を挿入
  const withBreaks = normalized.replace(/([A-Z]\.)/g, "\n$1").replace(/^\n/, "");

  // 改行 or 句読点で分割
  const parts = withBreaks
    .split(/\n|、|,/)
    .map((v) => v.trim())
    .filter(Boolean);

  return parts;
}
