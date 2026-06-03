// 익명 좋아요용 세션 ID — localStorage UUID 1개 (개인정보·IP 미수집, ADR-026). "동일 브라우저 중복 완화" 용도이며 1인 1회 보장 아님
const KEY = "sg_anon_sid";

export function getAnonSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(KEY, id);
  }
  return id;
}
