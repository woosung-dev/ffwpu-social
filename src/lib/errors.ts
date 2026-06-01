// 도메인 검증 실패 마커 — 의존성 없는 순수 모듈 (service 가 import 해도 NextAuth/DB 미유입).
// service 에서 throw, action 의 toActionError 가 사용자 메시지를 그대로 보존한다 (내부 오류는 generic 으로 은닉).
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}
