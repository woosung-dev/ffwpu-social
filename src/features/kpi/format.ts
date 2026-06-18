// KPI 표시값 — 숫자 우선 모델(사용자 결정 2026-06-18). 숫자 있으면 천단위 콤마+단위 자동, 없으면 직접 입력한 특수 표기(또는 fallback).
// 순수 함수 — 서버/클라이언트 공용. 동기화는 value(숫자)만 갱신 → 화면 표시가 자동으로 따라옴.

export function formatKpiDisplay(
  value: number | null,
  unit: string | null,
  displayValue: string,
  fallback = "—",
): string {
  if (value != null) return value.toLocaleString("ko-KR") + (unit ?? "");
  return displayValue.trim() || fallback;
}
