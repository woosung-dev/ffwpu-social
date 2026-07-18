// 홈 팝업 노출 해제 상태를 브라우저에만 저장한다. 개인정보를 수집하거나 서버로 전송하지 않는다.
const WEEK_KEY = "sg_popup_dismissed";
const SESSION_KEY = "sg_popup_closed";
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
    const dismissedForWeek = getWeekDismissals();
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    const closedForSession: unknown = raw ? JSON.parse(raw) : {};
    const isClosedForSession =
      typeof closedForSession === "object" &&
      closedForSession !== null &&
      !Array.isArray(closedForSession) &&
      (closedForSession as Record<string, unknown>)[id] === true;
    return dismissedForWeek[id] != null || isClosedForSession;
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

export function closePopupForSession(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    const closed: Record<string, unknown> =
      typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    closed[id] = true;
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(closed));
  } catch {
    // no-op — 저장 불가 환경에서는 현재 페이지 상태만 닫는다.
  }
}
