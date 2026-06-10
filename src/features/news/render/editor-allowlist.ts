// 에디터 허용값 단일 출처(pure, 클라 툴바 ↔ 서버 sanitize 공용) — 드리프트/XSS 차단.
// 툴바는 여기 값만 노출하고, sanitize 는 여기 값만 통과시킨다. inline style 값은 반드시 화이트리스트.

// 글자 크기 프리셋 + 직접 입력 허용 범위. 저장값은 반드시 정수 px 로 정규화한다.
export const FONT_SIZE_MIN = 12;
export const FONT_SIZE_MAX = 40;
export const ALLOWED_FONT_SIZES = [
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
] as const;

// 글자 색 팔레트(자유 컬러피커 금지) — 먹/회색 + 브랜드 + 강조 6
export const ALLOWED_COLORS = [
  "#242424",
  "#8a8f98",
  "#7b2ac7",
  "#c0392b",
  "#e67e22",
  "#1f9d55",
  "#2563eb",
  "#d6336c",
] as const;

// 형광펜(배경) 파스텔 4
export const ALLOWED_HIGHLIGHTS = [
  "#fff3a3",
  "#ffd1e8",
  "#cdeccf",
  "#d6e4ff",
] as const;

export const ALLOWED_ALIGN = ["left", "center", "right"] as const;

// 이미지 폭(%) 단계
export const IMAGE_WIDTH_STEPS = [25, 50, 75, 100] as const;

// YouTube video id — 11자
export const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

// 값이 화이트리스트에 있나 — sanitize 가드
export function isAllowedValue(
  list: readonly string[],
  v: unknown,
): v is string {
  return typeof v === "string" && list.includes(v);
}

export function normalizeFontSize(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const match = v.trim().match(/^(\d{1,2})px$/);
  if (!match) return null;
  const n = Number(match[1]);
  if (!Number.isInteger(n) || n < FONT_SIZE_MIN || n > FONT_SIZE_MAX) {
    return null;
  }
  return `${n}px`;
}

export function fontSizeToNumber(v: unknown): number | null {
  const normalized = normalizeFontSize(v);
  return normalized ? Number(normalized.slice(0, -2)) : null;
}

// 이미지 폭 단계로 clamp(가장 가까운 허용값, 기본 100)
export function clampImageWidth(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return 100;
  return IMAGE_WIDTH_STEPS.reduce((best, step) =>
    Math.abs(step - n) < Math.abs(best - n) ? step : best,
  );
}

// 정렬 enum 으로 정규화(기본 center)
export function normalizeAlign(v: unknown): (typeof ALLOWED_ALIGN)[number] {
  return typeof v === "string" &&
    (ALLOWED_ALIGN as readonly string[]).includes(v)
    ? (v as (typeof ALLOWED_ALIGN)[number])
    : "center";
}

// YouTube URL/ID → video id(없으면 null). 임의 iframe src 금지 — id 만 신뢰
export function extractYoutubeId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (YOUTUBE_ID_REGEX.test(trimmed)) return trimmed;
  const m = trimmed.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}
