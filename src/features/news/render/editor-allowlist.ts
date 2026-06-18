// 에디터 허용값 단일 출처(pure, 클라 툴바 ↔ 서버 sanitize 공용) — 드리프트/XSS 차단.
// 툴바는 여기 값만 노출하고, sanitize 는 여기 값만 통과시킨다. inline style 값은 반드시 화이트리스트.

// 글자 크기 프리셋 + 직접 입력 허용 범위. 저장값은 반드시 정수 px 로 정규화한다.
// docx 붙여넣기(pt) 보존을 위해 상한을 64px 로 확장 — pt 는 normalizeFontSize 가 px 로 변환.
export const FONT_SIZE_MIN = 12;
export const FONT_SIZE_MAX = 64;
export const ALLOWED_FONT_SIZES = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
  "40px",
  "48px",
  "56px",
  "64px",
] as const;

// 글자 색 "빠른 선택" 팔레트(툴바 프리셋) — 먹/회색 + 브랜드 + 강조 6.
// 자유 색은 normalizeColor 가 hex 검증으로 통과시킨다(고정 화이트리스트 아님).
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

// 이미지 크기 — 네이티브 resize 가 px(width/height)로 저장. 공개 렌더는 max-width:100% 로 모바일 캡.
export const IMAGE_PX_MAX = 4000;

// YouTube video id — 11자
export const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

// 값이 화이트리스트에 있나 — sanitize 가드
export function isAllowedValue(
  list: readonly string[],
  v: unknown,
): v is string {
  return typeof v === "string" && list.includes(v);
}

// 공식 ColorHighlightPopover 는 형광색을 var(--tt-color-highlight-*) 문자열로 저장 →
// 공개 사이트(해당 변수 미정의)에서도 렌더되도록 hex 로 해석. 옛 hex 값은 그대로 통과.
export const HIGHLIGHT_VAR_TO_HEX: Record<string, string> = {
  "var(--tt-color-highlight-yellow)": "#fef9c3",
  "var(--tt-color-highlight-green)": "#dcfce7",
  "var(--tt-color-highlight-blue)": "#e0f2fe",
  "var(--tt-color-highlight-purple)": "#f3e8ff",
  "var(--tt-color-highlight-red)": "#ffe4e6",
  "var(--tt-color-highlight-gray)": "rgb(248, 248, 247)",
  "var(--tt-color-highlight-brown)": "rgb(244, 238, 238)",
  "var(--tt-color-highlight-orange)": "rgb(251, 236, 221)",
  "var(--tt-color-highlight-pink)": "rgb(252, 241, 246)",
};

export function resolveHighlightColor(color: unknown): string | null {
  if (typeof color !== "string") return null;
  if (color in HIGHLIGHT_VAR_TO_HEX) return HIGHLIGHT_VAR_TO_HEX[color];
  if (isAllowedValue(ALLOWED_HIGHLIGHTS, color)) return color;
  return null;
}

// pt → px 환산 계수 (CSS 표준: 96px / 72pt)
const PT_TO_PX = 96 / 72;

// 글자크기 정규화 — px/pt 입력을 정수 px 로. 범위를 벗어나면 clamp(드롭 아님 — 붙여넣기 손실 방지),
// px/pt 외 단위(rem/em/%)나 비수치는 null. docx 는 pt 로 들어오므로 pt 변환 필수.
export function normalizeFontSize(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const match = v.trim().match(/^(\d+(?:\.\d+)?)(px|pt)$/i);
  if (!match) return null;
  let n = Number(match[1]);
  if (!Number.isFinite(n)) return null;
  if (match[2].toLowerCase() === "pt") n *= PT_TO_PX;
  n = Math.round(n);
  if (n < FONT_SIZE_MIN) n = FONT_SIZE_MIN;
  if (n > FONT_SIZE_MAX) n = FONT_SIZE_MAX;
  return `${n}px`;
}

// 글자 색 정규화 — #rgb/#rrggbb 또는 rgb()/rgba() 만 통과(소문자 #rrggbb 로). 키워드(windowtext 등)·
// 임의 CSS·url()·expression 은 null. 붙여넣기 시 브라우저가 색을 rgb() 로 직렬화하므로 rgb 변환 필수(XSS 가드).
export function normalizeColor(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim().toLowerCase();
  const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hex) {
    const body = hex[1];
    return body.length === 3
      ? `#${body
          .split("")
          .map((c) => c + c)
          .join("")}`
      : `#${body}`;
  }
  const rgb = s.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*[\d.]+\s*)?\)$/,
  );
  if (rgb) {
    const toHex = (x: string) => {
      const n = Math.min(255, Math.max(0, Number(x)));
      return n.toString(16).padStart(2, "0");
    };
    return `#${toHex(rgb[1])}${toHex(rgb[2])}${toHex(rgb[3])}`;
  }
  return null;
}

export function fontSizeToNumber(v: unknown): number | null {
  const normalized = normalizeFontSize(v);
  return normalized ? Number(normalized.slice(0, -2)) : null;
}

// 이미지 px 치수 clamp — 양의 정수 1~MAX, 유효하지 않으면 null(미지정).
export function clampImagePx(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.min(IMAGE_PX_MAX, Math.round(n));
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
