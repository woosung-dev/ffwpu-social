# 프로덕션 표준 감사 — 보안·성능·E2E (2026-10-07)

> branch `claude/production-web-app-standards-7f0cb1` · ADR-067 · 후속은 `docs/TODO.md` "프로덕션 표준 감사 후속"

## 1. 감사 결과 → 조치

| 영역 | 항목 | 감사 전 | 조치 |
|---|---|---|---|
| 보안 | 보안 헤더 | 0개 | CSP·XFO·nosniff·Referrer·Permissions·HSTS 6종 (`src/lib/security-headers.ts`, ADR-067) |
| 보안 | Zod 검증 | `searchTagsAction`·`authorize` 미검증, `getNewsDetailAction` 죽은 코드 | 스키마 적용, 로그인 스키마 클라·서버 공용화(`features/accounts/schemas.ts`), 죽은 액션 삭제 |
| 보안 | 잘못된 소식 id | `/news/not-a-uuid` → Postgres 캐스팅 오류(서버 렌더 실패) | service 에서 uuid 검사 후 404 |
| 보안 | 어드민 인가·에러 응답·sanitize·NEXT_PUBLIC | 양호 (`requireSuperAdmin` 전수, `toActionError`, 본문 화이트리스트, 공개 env 3종 비민감) | 변경 없음 |
| 안정성 | 공개 오류 화면 | 없음 → DB 장애 시 Next 기본 "This page couldn't load" | `src/app/(public)/error.tsx` — 헤더·푸터 유지 + 다시 시도 |
| 성능 | 폰트 preload | SUIT 6 weight + Gmarket 루트·Hero 이중 → 전 라우트 1,498 KB | 미사용 900 제거·Gmarket 루트 제거 → 1,340 KB(−158 KB) |
| 성능 | React Query | 공개 레이아웃 전역 | `/news`·`/press` 페이지에서만 Provider |
| 성능 | 이미지 | /news 히어로 우선순위 없음, 랜딩 하단 사진 eager | 첫 슬라이드 `preload`, StorySection `loading="lazy"` |
| 테스트 | E2E | 없음 (vitest 단위 테스트만) | Playwright 28개 시나리오 (desktop + 375 mobile) |

## 2. E2E (Playwright) — `pnpm e2e`

로컬 prod 빌드 대상. 모든 테스트에 자동 가드(`e2e/fixtures.ts`): `console.error` · `pageerror`(Uncaught·Unhandled Rejection) · 4xx/5xx · CSP 위반 이벤트 → 0건이어야 통과. GA 요청은 빈 응답으로 대체(운영 GA 오염 방지, CSP 검사는 그대로 수행).

| 파일 | 정상 흐름 | 예외 흐름 |
|---|---|---|
| `security-headers.spec.ts` | `/`·`/news`·`/notices`·`/admin/login` 헤더 6종 | prod 빌드에 `'unsafe-eval'` 미포함 |
| `public.spec.ts` | 홈 섹션 → 소식 목록 → 상세 → 공감 누름·취소 / 공지 목록 | 잘못된 소식·공지 주소 → 404 / `/api/news` 차단 시 크래시 없이 목록 유지 |
| `admin.spec.ts` | 로그인 → 대시보드 → 새 글 에디터 로드 | 빈 값 → 필드 메시지 / 틀린 비밀번호 → 안내 / 비로그인 접근 → 로그인 리다이렉트 |

결과: **28/28 통과**, `--repeat-each=10` 280/280 통과.

추가 수동 확인 (스크립트, 같은 prod 빌드):
- 어드민 커버 업로드(MinIO presigned PUT) → 업로드 이미지 로드 556×436, CSP 위반 0
- 유튜브 삽입 → `youtube-nocookie.com/embed/…` iframe, CSP 위반 0
- DB 중지 상태: main = 영문 기본 오류 페이지 / 이 브랜치 = 헤더·푸터 + "페이지를 불러오지 못했습니다" + 다시 시도

허용(known issue) — E2E 가 해당 테스트에서만 통과시킴:
- **#418 hydration 불일치** — 홈(5/5), `/admin/news/new` 하드 로드. **main 에서도 동일 재현**, dev 미재현. TODO 등록.
- **#419** — Suspense 안 `notFound()` 가 부하 시 간헐 클라 렌더 폴백(약 1/280). 보이는 결과(404)는 동일.

## 3. Lighthouse (mobile, 로컬 prod 빌드, 3회 중앙값)

main(HEAD a2669f7) vs 이 브랜치, 같은 DB·같은 머신.

| 페이지 | LCP main → 브랜치 | CLS | TBT | 폰트 전송 |
|---|---|---|---|---|
| `/` | 17.0s → **12.4s** | 0.003 → 0.003 | 67 → 56ms | 1,498 → 1,340 KB |
| `/news/[id]` | 12.0s → **8.3s** | 0.000 → 0.027 | 66 → 60ms | 1,498 → 1,340 KB |
| `/news` | 18.0s → 19.2s (노이즈 범위, 아래) | **0.620 → 0.620** | 78 → 63ms | 1,498 → 1,340 KB |

홈 초기 HTML 이 참조하는 JS(gzip): 247 → 239 KB (React Query 청크 2개 제거).

**해석 주의**
- LCP 절대값은 운영과 다르다. 로컬 시드 커버가 Figma 추출 PNG(장당 0.8~1.1 MB)라 이미지가 페이지당 2~4 MB 다. 운영 커버는 업로드 시 정규화된 JPEG(~138 KB, ADR-051). 같은 데이터로 비교한 **상대 변화**만 의미가 있다.
- `/news` LCP 는 preload 제거 A/B 에서도 15.3/20.1/20.4s — 15~20s 노이즈 범위라 preload 효과는 로컬에서 판별 불가. 히어로가 Suspense 로 늦게 스트리밍되는 구조가 지배 요인이다.
- `/news` CLS 0.62 는 **기존 결함**(main 동일): `NewsHero` 가 `fallback={null}` 로 늦게 들어와 목록 섹션을 밀어낸다. 캐싱 PR 에서 해소 예정(TODO).
- INP 는 실사용 지표라 Lighthouse 로 못 잰다. TBT(대리 지표)는 전 페이지 56~63ms 로 양호.

## 4. 범위 밖 (TODO 등록)

공개 조회 `"use cache"`(+ /news CLS) · #418 hydration · CI 게이트(lint·tsc·test·build·E2E) · 배포 후 PSI 필드 실측 · 업로드 시 WebP/AVIF.

## 5. 재현

```bash
pnpm infra:up                 # Postgres·MinIO (.env.local 포트 확인)
pnpm db:migrate && pnpm db:seed   # ⚠️ seed 는 전 테이블 TRUNCATE — 전용 DB 에서만
pnpm e2e                      # prod 빌드 후 :3100 에서 실행 (기존 서버 있으면 재사용)
```
