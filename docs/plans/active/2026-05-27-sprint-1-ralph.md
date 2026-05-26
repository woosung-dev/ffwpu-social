# Sprint 1 Ralph 자율 진행 프롬프트

> **사용법**: 다음 세션 첫 메시지에 이 파일 내용을 *그대로 복붙*. AI가 Ralph 느낌으로 자율 진행.
>
> **언제 작성됨**: 2026-05-26 세션 말 (다음 세션은 2026-05-27 진입).
>
> **목표**: 데드라인 2026-05-31까지 1차 런칭 (홈 + 소식 + 어드민).

---

## 📋 다음 세션 첫 메시지 — 그대로 복붙

```
ffwpu-social Sprint 1 시작.

## 컨텍스트 동기화 (필수, 작업 전 수행)
1. AGENTS.md 읽기 (현재 컨텍스트·Golden Rules·개인 원칙)
2. .ai/rules/domain.md 읽기 (프로젝트 도메인·절대 제약·자주 하는 실수)
3. .ai/rules/fullstack.md, nextjs-shared.md, anti-slop.md 읽기 (스택 규칙)
4. docs/current.md 읽기 (지금 유효한 합의 — 사이트맵·동적 영역·인터랙션)
5. docs/decisions.md 마지막 4개 ADR (ADR-020/021/022 + ADR-001b) 우선 확인
6. docs/design.md (Figma 토큰·컴포넌트·반응형 매트릭스)
7. checklist.md + context-notes.md (작업 트래킹 + 의사결정 이력)

## 이번 Sprint 결정 (이전 세션 종결, ADR-020/021/022)
- **Auth**: NextAuth.js v5 (Credentials Provider, super 단일 계정) — Clerk 폐기
- **로컬 스택**: Docker Compose Postgres 16-alpine + MinIO (S3 호환) + NextAuth
- **작업 시안**: C (공통 토대 → 사용자·어드민 평행)
- **데이터 전략**: API 직결 + Drizzle seed (더미 데이터 단계 생략)
- **데이터 모델**: news / news_tags / heart_events / users / audit_logs (5개)
- **카테고리 enum 5개 고정**: all / family_healing / local_volunteer / environment / rice_sharing

## 방법론
methodology-tooled (Stage 3 → Stage 4 → Stage 5)를 따른다.
Stage 0~2는 이전 세션에 완료 (AGENTS.md + .ai/rules/domain.md + docs/decisions.md + Figma).

진입 단계: **Stage 3 Step 4 — writing-plans 스킬로 vertical slice plan 작성**.

## Ralph 자율 진행 가드 (자동 멈춤 지점)
다음 시점에 **반드시 사용자에게 보고**하고 멈춘다.

1. **DB 첫 마이그레이션 적용 직전** — drizzle-kit migrate 실행 전 스키마 사용자 확인.
2. **NextAuth super 계정 비밀번호 설정** — 사용자에게 비밀번호 받아 bcrypt 해시 후 seed.
3. **첫 페이지 시각 확인 (D-3 진입 직전)** — 랜딩 페이지 첫 빌드 후 Playwright MCP 스크린샷 보고.
4. **커밋·푸쉬·배포** — Git Safety Protocol (AGENTS.md §3). 단계별 사용자 승인 필수.
5. **동일 에러 3회 반복** — 즉시 멈추고 새 세션 또는 사용자 호출.
6. **30분 또는 5파일 상한 초과** — 진행 보고 후 다음 단계 승인 대기.
7. **컨텍스트 오염 감지** (반복 헛돌이·잘못된 가정 누적) — 새 세션 호출.
8. **결정 변경 발견** — AGENTS.md / domain.md / current.md / decisions.md와 충돌 시 즉시 멈춤.

## 작업 계획 (5일 데드라인)

### D-5 (오늘, 2026-05-27): 셋업 + 공통 토대
- [ ] `docker-compose.yml` 작성 (postgres + minio)
- [ ] `pnpm create next-app` (스타터팩 기준 검증 후) — Next.js 16 + TS + Tailwind v4 + App Router
- [ ] `pnpm add` 의존성 (drizzle-orm, drizzle-zod, next-auth@beta, @auth/drizzle-adapter, bcrypt, @tiptap/*, @aws-sdk/client-s3, zod, react-hook-form, @hookform/resolvers, dayjs)
- [ ] `next.config.ts`: `output: 'standalone'` + `images.remotePatterns` (localhost:9000 + 추후 도메인)
- [ ] `drizzle.config.ts`: `strict: true` + dialect postgresql
- [ ] `.env.local` 생성 (`.env.example` 기반)
- [ ] `src/db/schema/` 5개 파일 작성 (news, news-tags, heart-events, users, audit-logs)
- [ ] **🚨 GATE**: 사용자에게 스키마 보여주고 마이그레이션 적용 승인 요청
- [ ] `pnpm drizzle-kit generate` + `pnpm drizzle-kit migrate`
- [ ] seed 데이터 (소식 9개 — Figma의 샘플 콘텐츠 활용)
- [ ] `features/auth/` (NextAuth Credentials + middleware proxy.ts)
- [ ] **🚨 GATE**: 사용자에게 super 비밀번호 받기 → bcrypt 해시 → seed users
- [ ] `features/news/{actions,service,db,schemas}.ts` 3-Layer 골격

### D-4 (2026-05-28): 공통 컴포넌트 (shadcn/ui + 도메인)
- [ ] shadcn/ui 초기화 + 필요 컴포넌트 추가
- [ ] `components/layout/Header.tsx` (4 BP variants + 스크롤스파이 hook)
- [ ] `components/layout/Footer.tsx`
- [ ] `components/layout/Banner.tsx` ("Sow Good 가족이 아니어도...")
- [ ] `features/news/components/ArticleCard.tsx` (12 variants: size 1~4 × Default/Hover/None)
- [ ] `features/news/components/StoryCard.tsx`
- [ ] `features/news/components/Heart.tsx` (클라이언트 컴포넌트)
- [ ] `features/news/components/CategoryTabs.tsx`
- [ ] `features/news/components/Pagination.tsx`
- [ ] `components/ui/` 보강 (PrimaryButton variants, TagChip, CarouselIndicator)
- [ ] 디자인 토큰 Tailwind 설정 (`globals.css` CSS vars + tailwind.config 확장)

### D-3 (2026-05-29): 사용자 페이지 (평행 A) + 어드민 셸 (평행 B)
- [ ] **A**: 랜딩 페이지 진입점 `app/(public)/page.tsx`
- [ ] **A**: HeroBanner 섹션 (Gmarket Sans 슬로건 + 해바라기 SVG + CTA)
- [ ] **A**: KpiSection 섹션 (KpiCard 4 variants + 부가 카드)
- [ ] **A**: StorySection 섹션 (이미지 2개 + Result 통계 3개)
- [ ] **A**: 스크롤스파이 hook (Intersection Observer + 헤더 메뉴 active 동기화)
- [ ] **B**: `app/admin/layout.tsx` + 사이드바
- [ ] **B**: `app/admin/login/page.tsx` (NextAuth SignIn)
- [ ] **B**: `app/admin/page.tsx` 대시보드 (최근 글 5개)
- [ ] **B**: `app/admin/news/page.tsx` 글 목록 (필터 + 페이지네이션)
- [ ] **🚨 GATE**: 랜딩 첫 빌드 후 Playwright MCP로 스크린샷 → 보고

### D-2 (2026-05-30): 사용자 페이지 (평행 A) + 어드민 글 작성 (평행 B)
- [ ] **A**: ArticleGrid 섹션 (마조네리 3열 + 다크 헤더 블록)
- [ ] **A**: Section5 Partners (파트너 로고 5개 + Sow Good 아이콘)
- [ ] **A**: Footer (다크 카피라이트)
- [ ] **A**: 소식 목록 `/news` (FeaturedStoryCard 캐러셀 + CategoryTabs + 3×3 그리드 + Pagination)
- [ ] **A**: 소식 상세 `/news/[id]` (카테고리 칩 + 제목 + Heart + 태그 + Tiptap 렌더 + 소셜 공유 + 관련 글 3개 + ScrollTopButton)
- [ ] **B**: `app/admin/news/new/page.tsx` 글 작성 (Tiptap + 이미지 업로드 to MinIO + 태그 자유 입력 + 카테고리 선택)
- [ ] **B**: `app/admin/news/[id]/edit/page.tsx` 수정
- [ ] **B**: Server Actions (`features/news/actions.ts` mutation + revalidateTag)
- [ ] **B**: `app/api/heart/route.ts` 익명 좋아요 토글 (IP+세션 + soft delete)

### D-1 (2026-05-31): QA + 배포
- [ ] Anti-Slop 체크리스트 self-check (`.ai/rules/anti-slop.md`)
- [ ] Playwright E2E smoke (홈 → 소식 클릭 → 상세 → 좋아요 → 어드민 로그인 → 글 작성)
- [ ] 반응형 4 BP 시각 검증 (1920·1440·1024·768·375)
- [ ] WCAG AA 자가 검증 (axe-core 또는 Lighthouse)
- [ ] `pnpm tsc --noEmit` + `pnpm lint` + `pnpm build` 통과
- [ ] **🚨 GATE**: 사용자에게 Vercel 배포 승인 요청
- [ ] Vercel 배포 + 도메인 연결 (도메인 대기 중이면 vercel.app 임시)
- [ ] 배포 후 30분 모니터링

## 작업 단위 원칙
- **vertical slice**: 각 task는 FE+BE 관통. *컴포넌트만* 또는 *API만*은 금지.
- **테스트 강제**: 매 task 종료 전 `pnpm tsc --noEmit` + `pnpm lint` 통과 (Anti-Slop §검증).
- **3-Layer 엄수**: actions.ts(Zod+auth) → service.ts(비즈니스, db ❌) → db.ts(Drizzle 전담). 위반 시 코드 거부.
- **Server Component 기본**: Client Component는 `useState`/`onClick`/`useEffect` 정말 필요한 *leaf 컴포넌트만*.
- **`.ai/rules/anti-slop.md` 통과**: PR 직전 자가 점검.

## 검증 증거 표준 (methodology-tooled §6)
완료 주장 시 다음 증거 동반.
- **FE**: 스크린샷 + `console.error` 0건
- **DB**: `drizzle-kit generate` 마이그레이션 SQL diff + 의도 설명
- **API**: 실제 호출 결과 (curl 또는 Playwright network 캡처)

## 사용자 게이트 (정리)
다음 5가지 시점에 반드시 보고하고 사용자 응답 대기:
1. DB 첫 마이그레이션 적용 직전 (D-5)
2. NextAuth super 비밀번호 받기 (D-5)
3. 랜딩 첫 빌드 시각 확인 (D-3)
4. 동일 에러 3회 반복 (언제든)
5. 커밋·푸쉬·배포 (단계별)

## 진행하면서 매 단계 끝마다
- [ ] `checklist.md` 해당 항목 체크
- [ ] `context-notes.md`에 결정 사항 누적 (큰 결정만)
- [ ] 새 ADR 필요 시 `docs/decisions.md`에 추가

---

지금 D-5 첫 작업부터 시작해. AGENTS.md + .ai/rules/domain.md 부터 읽고, vertical slice plan을 짠 다음, Docker Compose 셋업으로 진입. 진행해.
```

---

## 📌 보조 정보 (사용자가 다음 세션 들어가기 전 알아두면 좋은 것)

### 외부 가입 (이번 Sprint에서 필요 없음)
- ❌ Clerk — NextAuth 채택으로 가입 불필요
- ❌ Neon — 로컬 Docker Postgres로 시작. 배포 시 결정.
- ❌ Cloudflare R2 — 로컬 MinIO로 시작. 배포 시 결정.
- ⚠️ Vercel — D-1 배포 시 가입 필요 (또는 기존 계정 사용)

### 이번 Sprint에서 미사용 (v1.1 백로그)
- Clerk 도입 시 NextAuth → Clerk 마이그레이션 시나리오
- 어드민 권한 분리 (editor/viewer) — 1차는 super 단일
- CSV 내보내기
- PDF/Word 첨부
- 다국어
- 애널리틱스
- 미디자인 3 페이지 (임팩트 데이터/활동 스토리/쌀나눔 프로젝트)

### 미해결 TBD (블로커 아님, 사회공헌국 회신 대기)
- 도메인 확정 (배포 시 Vercel DNS 연결)
- "쌀나눔 프로젝트" 메뉴 → StorySection 추론 확정

### 비상 시 폴백
- Drizzle 인텔리센스 느림 보고 시 → `tsconfig.json` `incremental: true` + `tsBuildInfoFile`
- NextAuth v5 베타 이슈 시 → `next-auth@beta` 버전 고정
- Tiptap rich text 복잡도 ↑ 시 → 단순 textarea + markdown으로 다운그레이드
- 데드라인 위협 시 → 어드민 글 수정만 빼고 글 생성만으로 출시 (D-2 작업 절반)
