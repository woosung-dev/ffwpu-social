// 홈 팝업 "일주일간 보지 않기" 상태를 브라우저에만 저장한다. 개인정보를 수집하거나 서버로 전송하지 않는다.
// 그냥 닫기는 저장하지 않는다(사용자 결정 2026-07-18) — 새로고침·재진입 시 다시 노출.
const WEEK_KEY = "sg_popup_dismissed";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function getWeekDismissals(): Record<string, number> {
  const raw = window.localStorage.getItem(WEEK_KEY);
  if (!raw) return {};

  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {};
  }

  const now = Date.now();
  const dismissals: Record<string, number> = {};
  let hasExpired = false;
  for (const [id, expiresAt] of Object.entries(parsed)) {
    if (typeof expiresAt === "number" && expiresAt > now) {
      dismissals[id] = expiresAt;
    } else {
      hasExpired = true;
    }
  }
  if (hasExpired) {
    window.localStorage.setItem(WEEK_KEY, JSON.stringify(dismissals));
  }
  return dismissals;
}

export function isPopupSuppressed(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return getWeekDismissals()[id] != null;
  } catch {
    return false;
  }
}

export function dismissPopupForWeek(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const dismissals = getWeekDismissals();
    dismissals[id] = Date.now() + WEEK_MS;
    window.localStorage.setItem(WEEK_KEY, JSON.stringify(dismissals));
  } catch {
    // no-op — 저장 불가 환경에서는 다음 방문에 다시 노출
  }
}
