# Context Notes

- 2026-06-10. 현재 `heart_events`는 `sessionId`만 저장하며 IP를 수집하지 않는다. 분석도 이 방향을 유지한다.
- 2026-06-10. `news.publishedAt` 컬럼은 이미 존재한다. 예약 발행을 위해 별도 상태 컬럼을 추가하지 않고, 미래 시각을 허용한다.
- 2026-06-10. 공개 조건은 기존 `publishedAt IS NOT NULL`에서 `publishedAt <= now()`로 바뀌어야 한다.
- 2026-06-10. 현재 FontSize extension은 커스텀이지만 TextStyle mark 기반 구조가 공식 방식과 유사하다. 패키지 추가 없이 범위 검증을 보강한다.
- 2026-06-10. Next 16 Cache Components 빌드는 Server Component prerender 중 JS `new Date()` 선행 호출을 막는다. 공개 조건은 Postgres `now()` 기준으로 구현한다.
- 2026-06-10. `drizzle/0007_chunky_doctor_doom.sql`은 `analytics_events` 테이블 추가만 포함한다. 배포 시 DB 마이그레이션 적용이 필요하다.
- 2026-06-10. 검증 결과는 `pnpm tsc --noEmit`, `pnpm lint`, `pnpm test`, `pnpm build` 모두 통과다.
