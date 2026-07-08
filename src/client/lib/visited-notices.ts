// 읽은 공지 ID 목록 — localStorage (개인정보 미수집, anon-session.ts 패턴). 목록 행 "읽음 하이라이트" 용
// 실패(프라이빗 모드 quota·비활성)는 전부 no-op — 하이라이트만 사라지고 기능은 정상

const KEY = "sg_visited_notices";
// 상한 — 오래된 것부터 제거 (localStorage 비대화 방지)
const MAX_ENTRIES = 200;

export function getVisitedNotices(): ReadonlySet<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((v): v is string => typeof v === "string"));
  } catch {
    return new Set();
  }
}

export function markNoticeVisited(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = Array.from(getVisitedNotices());
    if (current.includes(id)) return;
    const next = [...current, id].slice(-MAX_ENTRIES);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // no-op — 저장 불가 환경에선 하이라이트 없이 동작
  }
}
