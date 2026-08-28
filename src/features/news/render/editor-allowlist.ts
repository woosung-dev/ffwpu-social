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

// 글꼴 — 툴바 드롭다운 · sanitize · 공개 렌더 · 웹폰트 로딩의 단일 출처.
// 저장값(value)은 구글 폰트의 **대표 패밀리명 하나**다. 스택(stack)은 렌더 시점에 붙인다 —
// 나중에 폴백을 손봐도 이미 발행된 글이 글꼴을 잃지 않는다.
// 전부 SIL Open Font License 1.1 (google/fonts METADATA.pb `license: "OFL"` 확인, 2026-08-28) — 상업 이용·웹폰트 임베딩 무료.
export type EditorFont = {
  // 마크에 저장되는 값 = 구글 패밀리명. 절대 바꾸지 말 것(발행된 글이 이 문자열을 들고 있다).
  value: string;
  // 드롭다운에 보이는 한글 이름
  label: string;
  // 실제 적용 CSS 스택
  stack: string;
  // 구글 폰트 CSS2 요청용 family 파라미터(웨이트 포함). null 이면 웹폰트 로딩 불필요(사이트 기본 글꼴)
  googleFamily: string | null;
};

// 기본(사이트 글꼴 SUIT)은 마크를 지우는 선택지라 value 가 빈 문자열이다 — 목록 맨 앞에 둔다.
export const DEFAULT_FONT_VALUE = "";

export const EDITOR_FONTS: readonly EditorFont[] = [
  {
    value: DEFAULT_FONT_VALUE,
    label: "기본",
    stack: "",
    googleFamily: null,
  },
  {
    value: "Noto Serif KR",
    label: "본명조",
    stack: "'Noto Serif KR', serif",
    googleFamily: "Noto+Serif+KR:wght@400;700",
  },
  {
    value: "Nanum Myeongjo",
    label: "나눔명조",
    stack: "'Nanum Myeongjo', serif",
    googleFamily: "Nanum+Myeongjo:wght@400;700",
  },
  {
    value: "Gowun Batang",
    label: "고운바탕",
    stack: "'Gowun Batang', serif",
    googleFamily: "Gowun+Batang:wght@400;700",
  },
  {
    value: "Nanum Gothic",
    label: "나눔고딕",
    stack: "'Nanum Gothic', sans-serif",
    googleFamily: "Nanum+Gothic:wght@400;700",
  },
  {
    value: "Gaegu",
    label: "개구",
    stack: "'Gaegu', cursive",
    googleFamily: "Gaegu:wght@400;700",
  },
] as const;

// 웹폰트가 필요한 글꼴만 (기본 제외)
export const WEBFONT_EDITOR_FONTS = EDITOR_FONTS.filter(
  (f): f is EditorFont & { googleFamily: string } => f.googleFamily !== null,
);

// 소문자 패밀리명 → 정의. 브라우저가 대소문자를 보존하지만 비교는 관대하게 한다.
const FONT_BY_LOWER_VALUE = new Map(
  WEBFONT_EDITOR_FONTS.map((f) => [f.value.toLowerCase(), f]),
);

// 글꼴 정규화 — 화이트리스트에 있는 대표 패밀리명으로 되돌린다. 없으면 null(= 마크 drop, 사이트 기본 글꼴).
// 브라우저는 style.fontFamily 를 `"Nanum Myeongjo", serif` 처럼 따옴표 붙여 직렬화하므로
// 첫 패밀리만 떼어 따옴표를 벗긴다. docx 붙여넣기의 임의 글꼴(맑은 고딕 등)은 여기서 걸러진다.
export function normalizeFontFamily(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const first = v.split(",")[0]?.trim() ?? "";
  const unquoted = first.replace(/^['"]|['"]$/g, "").trim();
  if (!unquoted) return null;
  return FONT_BY_LOWER_VALUE.get(unquoted.toLowerCase())?.value ?? null;
}

// 대표 패밀리명 → 적용 CSS 스택. 미등록 값은 null(인라인 style 미출력).
export function resolveFontStack(v: unknown): string | null {
  const normalized = normalizeFontFamily(v);
  return normalized
    ? (FONT_BY_LOWER_VALUE.get(normalized.toLowerCase())?.stack ?? null)
    : null;
}

// 구글 폰트 CSS2 URL — 여러 글꼴을 한 요청에 묶는다(연결 1회).
// families 가 비면 null → 호출측이 <link> 자체를 안 그린다(안 쓰는 글에 0 바이트).
export function googleFontsHref(values: readonly string[]): string | null {
  const families = Array.from(
    new Set(
      values
        .map((v) => normalizeFontFamily(v))
        .filter((v): v is string => v !== null)
        .map((v) => FONT_BY_LOWER_VALUE.get(v.toLowerCase())!.googleFamily),
    ),
  ).sort();
  if (families.length === 0) return null;
  return `https://fonts.googleapis.com/css2?${families
    .map((f) => `family=${f}`)
    .join("&")}&display=swap`;
}

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
