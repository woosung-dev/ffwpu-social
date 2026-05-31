-- 초기 마이그레이션 placeholder — schema 변경 후 `pnpm db:generate` 로 재생성 권장. 본 파일은 빈 base (drizzle-kit 첫 실행 시 새 SQL 이 추가됨).
-- 직접 운영 DB 적용 시: 본 파일 삭제 후 `pnpm db:generate` 로 5 테이블 전체 init SQL 을 생성하세요.

-- NOTE: lean-monorepo-base 템플릿 복제 직후엔 아래 명령을 실행하세요.
--   1) pnpm db:generate    # users / categories / news / news_tags / heart_events 전체 init SQL 생성
--   2) pnpm db:migrate     # 위 SQL 을 DB 에 적용
--   3) pnpm db:seed        # 카테고리 4종 + super 어드민 + 샘플 news upsert
