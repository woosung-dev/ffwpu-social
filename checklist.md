<!-- 프로젝트 단계별 작업 체크리스트. 진행하며 체크박스 표시 -->

# 작업 체크리스트

## Phase 0 — 문서 골격 셋업

- [x] 디렉토리 구조 생성
- [x] 루트 문서 4개 골격 작성 (README, CLAUDE.md, checklist, context-notes)
- [x] `docs/` 핵심 문서 4개 골격 작성 (current, design, tech, decisions)
- [x] `docs/source/README.md` 작성

## Phase 1 — 자료 수령 및 원본 보존

- [ ] Figma URL 받기 (Viewer 권한) — MCP 또는 스크린샷 결정 후
- [x] 기획안 v5(2026-03-18) `docs/source/`에 저장
- [x] 의도서 v1(2026-04-14) `docs/source/`에 저장
- [x] 사회공헌단 BI PPT(2026-04-22) `docs/source/`에 저장
- [ ] 로고·미디어 자산 받기 (Sow Good 로고 확정 후)
- [ ] 추가 회의록·요청 변동분 있는 경우 수령

## Phase 2 — current.md / design.md 채우기

- [x] 의도서·기획안 기반 `docs/current.md` 재작성 (정의·사용자 그룹·사이트맵·동적 영역·비기능 요구·톤앤매너·운영 체계·성공 기준·TBD)
- [x] `docs/design.md` BI(Sow Good)·톤앤매너 키워드·레퍼런스 사이트 정리
- [x] `docs/design.md` 상단에 Figma URL + 확인 날짜 기록
- [x] Figma 캔버스 구조 파악 (홈-반응형 + 소식 전체/상세 + 컴포넌트 섹션)
- [x] Figma Variables(컬러) 추출 → 토큰 표 채움
- [ ] 홈 시안 좌/우 최종 결정 (사회공헌국·사용자 확인 대기)
- [ ] Figma에 추가 페이지 있는지 확인 (사용자 재확인 대기)
- [ ] 홈 페이지 노드별 디자인 컨텍스트 + 스크린샷 추출 (`get_design_context` + `get_screenshot`)
- [ ] 소식 페이지(목록·상세) 디자인 컨텍스트 + 스크린샷 추출
- [ ] 재사용 컴포넌트 인벤토리 (헤더·푸터·카드·KPI 등) 채우기
- [ ] 본문/배경/그레이 스케일 토큰 화면별 인라인 값에서 추출해 토큰화

## Phase 3 — 사회공헌국 확답 받기 (TBD 일괄 정리)

- [ ] 재합의된 데드라인
- [ ] 개발 방식 (별도 사이트 vs 협회 홈페이지 통합 페이지)
- [ ] 도메인 / 호스팅·인프라
- [ ] 다국어 지원 여부
- [ ] 개인정보처리방침·이용약관 작성 주체
- [ ] 이메일 수신처 (파트너십 문의, 참여하기)
- [ ] 첨부 파일 허용 종류·용량
- [ ] 애널리틱스 도입 여부
- [ ] CSV/PDF 다운로드 실제 제공 여부
- [ ] 어드민 권한 단계·인원
- [ ] BI 시안 A/B 최종 확정
- [ ] 콘텐츠 제작 워크플로우 (문화홍보국 → 사회공헌국 어드민)
- [ ] **미디자인 3개 페이지(임팩트 데이터/활동 스토리/쌀나눔 프로젝트) 시안 수령 일정**
- [ ] **소식 카테고리 전체 목록** (현재 확인: `쌀나눔`·`보도자료`)
- [ ] **좋아요 정책** (익명 토글, 어뷰징 방지)
- [ ] **검색 대상·결과 UI**
- [ ] **문의/연락 폼 필요 여부** (Figma에 없음)

## Phase 4 — 기술 스택 결정

- [ ] CMS 방식 결정 (자체 어드민 vs Headless CMS)
- [ ] 스택 후보 정리 + ADR-001 작성 (`docs/decisions.md`)
- [ ] `docs/tech.md` 폴더 구조 컨벤션 확정
- [ ] `docs/tech.md` 데이터 모델 최종화
- [ ] `docs/tech.md` API 엔드포인트 확정
- [ ] `docs/tech.md` 배포·호스팅 전략
- [ ] `CLAUDE.md` 코드 컨벤션 섹션 보강

## Phase 5 — 코드 작업 시작 가능

위 Phase 0~4가 끝나야 코드 작업 시작.

## Sprint 1 D-5 (2026-05-27) — 셋업 + 공통 토대

- [x] `docker-compose.yml` 작성 (postgres 16-alpine + minio + minio-init 자동 버킷)
- [x] `package.json` + `tsconfig.json` + `next.config.ts` + `eslint.config.mjs` + `postcss.config.mjs`
- [x] 의존성 설치 (drizzle/next-auth/tiptap/aws-sdk/bcryptjs/zod/dotenv/dayjs 등)
- [x] `next.config.ts`: `output: 'standalone'` + `images.remotePatterns` (localhost:9000 + R2/S3) + `cacheComponents: true`
- [x] `drizzle.config.ts`: `strict: true` + postgresql + dotenv 명시 로드
- [x] `.env.local` 생성 (`.env.example` 기반, POSTGRES_PORT 5433로 격리)
- [x] `src/db/schema/` 5개 (news/news_tags/heart_events/users/audit_logs) + index.ts 배럴
- [x] **🚨 GATE 1 통과** — 스키마 SQL 검토 + 사용자 승인 + `drizzle-kit migrate` 적용
- [x] seed 데이터 (news 9건 + 태그 27건 + admin 1명)
- [x] NextAuth v5 셋업 (`src/auth.ts` + `src/proxy.ts` + handlers route + `src/types/next-auth.d.ts`)
- [x] **🚨 GATE 2 통과** — 임시 비밀번호 자동 생성 → bcrypt → seed users
- [x] `features/news/` 3-Layer 골격 (actions/service/db/schemas) — listNews/getNewsDetail 구현, create/update/toggleHeart는 D-2에
- [x] `tech.md` ADR-022 + ADR-020 반영 (5 테이블 + NextAuth + Docker 로컬 스택)
- [x] 임시 홈 `src/app/page.tsx` — Suspense 패턴으로 시드 9건 표시 (D-3에 디자인 시안으로 교체)
- [x] `pnpm tsc --noEmit` 통과
- [x] `pnpm build` 통과 (`/` Partial Prerender, NextAuth handler dynamic, proxy 인식)

## Sprint 1 D-4 (2026-05-27) — 공통 컴포넌트 (F3 폴더 구조, ADR-024)

- [x] shadcn/ui 초기화 (Neutral base, RSC, css variables) + primitive 9종 (button/input/label/card/select/dialog/form/separator/carousel)
- [x] `src/client/layouts/PublicHeader.tsx` (4 BP variants + 스크롤스파이 hook + 햄버거 1024↓ + 검색 disabled)
- [x] `src/client/layouts/PublicFooter.tsx` (--color-surface-dark + © 2026 정적)
- [x] `src/client/layouts/Banner.tsx` (Sow Good 워드마크 + 참여 권유 placeholder, D-3 카피 확정)
- [x] `src/client/hooks/useScrollSpy.ts` (IntersectionObserver, idsKey join 으로 dep 안정화)
- [x] `src/admin/layouts/AdminSidebar.tsx` (Client, 대시보드·소식·로그아웃, 1024↓ 토글 + 오버레이)
- [x] `src/features/news/components/ArticleCard.tsx` (size 1~4 × state default/hover/none = 12 variants 통합 컴포넌트)
- [x] `src/features/news/components/StoryCard.tsx` (278×425 + 라벤더 텍스트)
- [x] `src/features/news/components/FeaturedStoryCard.tsx` (shadcn Carousel + Active 22px / Inactive 17px 인디케이터)
- [x] `src/features/news/components/Heart.tsx` (Client, optimistic UI useTransition, onToggleAction prop)
- [x] `src/features/news/components/CategoryTabs.tsx` (5 enum 탭, Active text-ink-strong + brand-vivid 2px 라인)
- [x] `src/features/news/components/Pagination.tsx` (Active text-brand-primary 무배경, 7+ 페이지 시 ellipsis)
- [x] `src/features/news/components/KpiCard.tsx` (4 variants gray/green/purple/yellow)
- [x] `src/features/news/index.ts` server-only public API (actions/service/schemas) + `src/features/news/components/index.ts` client-safe barrel 분리
- [x] 디자인 토큰 매핑 — `globals.css` @theme inline (보라 9단계 brand-* + KPI 4색 + 텍스트 다단계 ink-* + 배경 surface-* + 태그 + 그라디언트)
- [x] SUIT 폰트 셋업 (next/font/local 6 weight sun-typeface/SUIT v3 OFL, public/fonts/)
- [x] `app/(public)/layout.tsx` (Banner + PublicHeader + main + PublicFooter wrap)
- [x] `app/admin/(auth)/layout.tsx` (중앙 카드, robots noindex meta) + `(auth)/login/page.tsx` placeholder
- [x] `app/admin/(panel)/layout.tsx` (AdminSidebar wrap, robots noindex meta) + `(panel)/page.tsx` 대시보드 placeholder
- [x] D-4 검증 게이트 통과 — pnpm tsc/lint/build 0 error + 5 BP 가로 스크롤 0 + console.error 0 (favicon 404 만 D-3 백로그)
- [x] Multi-Agent 검증 — designer(RE-HIERARCHY)·code-reviewer(NIT-ONLY)·human(CONFUSED→ITERATE)·docs-sync(DOC_UPDATE_REQUIRED)·codex(GATE PASS) + evaluator 메타 (ITERATE 보완 후 D-3 진입 가능)
- [x] P0 후속 수정 — CategoryTabs/Pagination active 색 Figma 정합 + 홈 placeholder 카피 (사회공헌국 H-1 결정)

## Sprint 1 D-1 추가 백로그

- [ ] ESLint flat config 정식 셋업 (eslint-config-next 16 flat 패턴) — 현재 빈 config
- [ ] next-auth peer dep 경고 검증 — next 16 호환 확인 또는 별도 패치
- [ ] 임시 비밀번호 변경 — 첫 어드민 로그인 후 즉시
