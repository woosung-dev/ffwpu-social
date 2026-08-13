// 게시판 구분 (ADR-056) — 활동 스토리(/news)와 언론 속 사회공헌(/press)이 같은 테이블을 쓰되 완전히 분리된다.
// client-safe: "server-only" 없음 — 공개 컴포넌트·어드민 UI 가 라벨·경로를 여기서 읽는다.
export const NEWS_BOARDS = ["story", "press"] as const;
export type NewsBoard = (typeof NEWS_BOARDS)[number];

export const BOARD_LABELS: Record<NewsBoard, string> = {
  story: "활동 스토리",
  press: "언론 속 사회공헌",
};

// 게시판별 라우트 — 카드 링크·목록 경로·어드민 이동을 하드코딩하지 않기 위한 단일 출처
export const BOARD_PATHS: Record<NewsBoard, { public: string; admin: string }> = {
  story: { public: "/news", admin: "/admin/news" },
  press: { public: "/press", admin: "/admin/press" },
};
