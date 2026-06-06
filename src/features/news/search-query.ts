// 소식 검색 쿼리 헬퍼 — LIKE 패턴 이스케이프(순수, DB 무관). db.ts searchWhere 가 사용. 단위테스트 대상

// 사용자 입력의 LIKE 메타문자(% _ \)를 리터럴로 이스케이프 후 양끝 부분일치 패턴 생성.
// 왜: 이스케이프 없으면 "100%" 같은 입력이 와일드카드로 해석돼 의도치 않은 매칭(주입) 발생. Postgres 기본 escape char = '\'
export function likePattern(q: string): string {
  const escaped = q.replace(/[\\%_]/g, (ch) => `\\${ch}`);
  return `%${escaped}%`;
}
