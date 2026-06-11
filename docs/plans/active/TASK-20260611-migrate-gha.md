---
status: active
opened: 2026-06-11
branch: feat/migrate-gha
slice_id: TASK-20260611-migrate-gha
spec_status: confirmed
brainstorming_done: 2026-06-11
related_adr: 039-migrate-gha
---

# 배포 마이그레이션 자동화 (B안) — Vercel 자동배포 유지 + GHA migrate 분리

## 배경

프로덕션 어드민 백스크린(2026-06-11) 루트코즈 = 마이그레이션 0007 프로덕션 미적용. Vercel은 `next build`만 돌리고 `drizzle-kit migrate`를 자동 실행하지 않음. 배포마다 수동 migrate는 누락 위험.

## 결정 (3안 비교 후 B안 채택)

| 안 | 내용 | 결과 |
|---|---|---|
| 기존 #49 | GHA가 배포까지 소유(migrate 승인게이트 → vercel deploy) | 견고하나 무거움·Vercel 자동배포 포기 → **폐기(PR #49 닫음)** |
| A | Vercel 빌드커맨드에 migrate 끼워넣기 | 가장 단순하나 Vercel 강결합 |
| **B (채택)** | **Vercel 자동배포 유지 + 마이그레이션만 GHA 분리** | Vercel 무변경·이식성·가벼움. 순서 비보장은 가산형이면 무해 |

상세: ADR-039. 사용자 결정 — Vercel 자동배포 유지, 마이그레이션만 자동화.

## 작업 환경

- **워크트리** `ffwpu-social-migrate-gha` (다른 세션이 메인 트리에서 작업 중이라 격리). 브랜치 `feat/migrate-gha` ← 깨끗한 origin/main(#48).
- PR #49(`feat/migrate-on-deploy`)는 접근 폐기 → 닫을 예정. migrate.ts 등은 #49 커밋(82e56a9)에서 내용 재사용.

## 체크리스트

- [x] `src/db/migrate.ts` — advisory-lock 러너 (#49 그대로)
- [x] `package.json` — `db:migrate:deploy` 스크립트
- [x] `.github/workflows/migrate.yml` — main push → migrate만 (배포는 Vercel)
- [x] `.github/workflows/migrate-preview.yml` — PR from-scratch 검증 (#49 그대로)
- [x] ADR-039 (B안 버전) + deploy-env-checklist §5
- [x] tsc / lint / test 통과 확인 (tsc0 · lint0 · test54)
- [x] 워크플로 YAML 유효성 확인 (js-yaml 파싱 OK)
- [ ] (사용자 승인 후) 커밋 → 푸쉬 → PR
- [ ] (사용자) GitHub Secret `PROD_DATABASE_URL_DIRECT` 등록
- [ ] (사용자) 막힌 prod 0007 1회 수동 적용
- [ ] (사용자) PR #49 닫기

## 의도적으로 안 한 것 (#49 대비 삭제)

- `vercel.json`(자동배포 off) — **B안은 Vercel 자동배포 유지**라 불필요/유해.
- `deploy.yml`의 deploy 잡 — Vercel이 배포 담당.
- `Dockerfile` — AWS-time 산출물. 지금 Vercel 범위엔 speculative라 보류(ADR-039에 증분 경로 명시).
- `CLAUDE.md` 현재 작업 pointer 수정 — 다른 세션과 hot-file 충돌 회피 위해 생략(이 plan 문서가 SSOT).

## Context Notes

- migrate.ts 는 `process.env.DATABASE_URL` 을 읽음. GHA `migrate` 잡이 그 값에 `PROD_DATABASE_URL_DIRECT`(Neon direct)를 주입. 앱 런타임 DATABASE_URL(pooled)과 별개 — advisory lock(세션 단위)이 PgBouncer transaction 풀러에선 안 먹으므로 **direct 필수**.
- migrate.yml 트리거 = 모든 main push (path 필터 없음). 이유: idempotent·수 초라 비용 무시 가능 + prod 스키마 항상 수렴 보장.
- 승인 게이트는 의도적으로 뺌(B안 = 가벼움). 필요 시 `environment: production` 한 줄로 옵트인(ADR-039·§5 명시).
