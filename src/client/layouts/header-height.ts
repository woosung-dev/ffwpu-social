// 공개 헤더 바 높이 SSoT — PublicHeader 바 · (public)/layout.tsx Suspense fallback · useScrollSpy 기준선이 공유
// Figma 헤더(97:9431) 측정 54/70/88 의 4px 그리드 스냅(±2px, 정합 스윕 허용오차 내).
// 세 표현(클래스/px/CSS)은 같은 값 — 변경 시 반드시 함께 수정. CSS 측은 globals.css `--header-h`(3.5/4.5/5.5rem).
export const HEADER_BAR_HEIGHT_CLASS = "h-14 md:h-18 lg:h-22";
export const HEADER_BAR_HEIGHT_PX = { base: 56, md: 72, lg: 88 } as const;
