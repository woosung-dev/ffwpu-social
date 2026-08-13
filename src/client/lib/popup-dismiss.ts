// 홈 팝업 "보지 않기" 상태를 브라우저에만 저장한다. 개인정보를 수집하거나 서버로 전송하지 않는다.
// 그냥 닫기는 저장하지 않는다(사용자 결정 2026-07-18) — 새로고침·재진입 시 다시 노출.
// 숨김 기간은 팝업별 설정(ADR-055). 저장 형태는 만료 epoch 이라 기존 값과 그대로 호환된다.
import type { PopupDismissDuration } from "@/features/popups/schemas";

const STORAGE_KEY = "sg_popup_dismissed";
const DAY_MS = 24 * 60 * 60 * 1000;
// 둘 다 "닫은 시점부터" 경과 시간 — 자정 기준이 아니라 밤늦게 닫아도 온전히 하루가 보장된다
const DISMISS_MS: Record<PopupDismissDuration, number> = {
  day: DAY_MS,
  week: 7 * DAY_MS,
};

function getDismissals(): Record<string, number> {
  const raw = window.localStorage.getItem(STORAGE_KEY);
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissals));
  }
  return dismissals;
}

export function isPopupSuppressed(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return getDismissals()[id] != null;
  } catch {
    return false;
  }
}

export function dismissPopup(id: string, duration: PopupDismissDuration): void {
  if (typeof window === "undefined") return;
  try {
    const dismissals = getDismissals();
    dismissals[id] = Date.now() + DISMISS_MS[duration];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissals));
  } catch {
    // no-op — 저장 불가 환경에서는 다음 방문에 다시 노출
  }
}
