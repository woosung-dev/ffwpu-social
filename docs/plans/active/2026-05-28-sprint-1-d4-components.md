# Sprint 1 D-4 자율 진행 프롬프트 — F3 폴더 + 공통 컴포넌트

> **사용법**: 다음 세션 첫 메시지에 아래 코드블럭 내용을 *그대로 복붙*.
>
> **작성됨**: 2026-05-27 (D-5 종결 직후)
>
> **목표**: D-4 (2026-05-28) — F3 폴더 구조 신규 생성 + shadcn/ui 초기화 + 디자인 토큰 + SUIT 폰트 + 공통 컴포넌트 11개

---

## 📋 다음 세션 첫 메시지 — 그대로 복붙

```
ffwpu-social Sprint 1 D-4 시작.

## 컨텍스트 동기화 (필수, 작업 전 수행)
1. AGENTS.md 읽기 (현재 컨텍스트·Golden Rules·개인 원칙·F3·서브도메인)
2. .ai/rules/domain.md 읽기 (절대 제약·자주 하는 실수·카테고리 enum 5개)
3. .ai/rules/fullstack.md / nextjs-shared.md / anti-slop.md 읽기 (스택 규칙)
4. .ai/rules/frontend.md §React Hooks 안전 (useEffect/useState/RHF/Query 함정)
5. docs/current.md 읽기 (사이트맵·동적 영역·인터랙션·헤더 스크롤스파이)
6. docs/decisions.md 마지막 5 ADR (ADR-020/021/022/023/024) 우선 확인
7. docs/design.md 읽기 (Figma 토큰·컴포넌트 인벤토리·반응형 4 BP·SUIT 폰트)
8. docs/tech.md F3 폴더 구조 + 결정 규칙
9. checklist.md D-4 항목 + context-notes.md (의사결정 이력)
10. docs/plans/active/2026-05-27-sprint-1-ralph.md (전체 5일 sprint plan)

## D-5 완료 상태 (이전 세션, PR #1 머지됨 — main 기준)
- Docker Compose (postgres 5433 + minio 9000/9001) ✅
- Drizzle 5 테이블 마이그레이션 + seed 9 news / 27 tags / admin 1명 ✅
- NextAuth v5 (Credentials, super 단일) + proxy.ts + handlers ✅
- features/news/{actions,service,db,schemas}.ts 3-Layer 골격 ✅
- 임시 홈 src/app/page.tsx (D-3에 디자인 시안으로 교체)
- pnpm build 통과, / Partial Prerender, NextAuth Dynamic

## 잠금 결정 (ADR-020~024) — 절대 어기지 말 것
- Auth: NextAuth v5 Credentials, super 단일 (ADR-020)
- DB: Docker Postgres 16-alpine 로컬 5433, 배포는 Neon/RDS (ADR-020)
- Storage: MinIO 로컬 9000, 배포는 R2/S3 (ADR-020)
- Sprint 시안 C: 공통 토대 → 평행 (ADR-021)
- 데이터 5 테이블: news / news_tags / heart_events / users / audit_logs (ADR-022)
- 카테고리 enum 5: all / family_healing / local_volunteer / environment / rice_sharing
- 도메인: 서브도메인 옵션 2 — admin.<main>, host 분기 코드는 D-1 (ADR-023)
- 폴더 구조 F3 (ADR-024): src/client/ + src/admin/ + src/features/

## 방법론
methodology-tooled Stage 4 (실행) → Stage 5 (검증).
Stage 0~3는 D-5에 완료. 아이디어·plan·검토 끝.

## D-4 작업 단계별 (F3 폴더 신규 생성 + 공통 컴포넌트)

### 1. F3 폴더 신규 생성 + shadcn/ui 초기화
- mkdir 신규: src/client/{layouts,sections,hooks}/ + src/admin/{layouts,components,hooks}/
- 기존 유지: src/features/news/, src/db/, src/lib/, src/auth.ts, src/proxy.ts
- pnpm dlx shadcn@latest init (베이스 컬러는 docs/design.md 보라 #501F7E 권장)
- shadcn primitive 추가: button, input, label, card, select, dialog, form, separator

### 2. 디자인 토큰 매핑 (docs/design.md 기반)
- src/app/globals.css에 CSS vars 추가:
  * 보라 9단계 (--color-primary-darkest 부터 --color-primary-pale 까지)
  * 액센트 (--color-accent #F4B600)
  * KPI 카드 (--color-kpi-yellow #FFCF41, --color-kpi-lime #DCEF7D)
  * 텍스트 (--color-text #3E404E, --color-text-subtle, --color-text-disabled)
  * 그레이 (--color-bg-soft, --color-bg-card)
- Tailwind v4 @theme directive에서 토큰 노출 (CSS-first 방식)

### 3. SUIT 폰트 셋업 (ADR-008 — SUIT 단일)
- next/font/local 사용 (SUIT 6 weight: Heavy/ExtraBold/Bold/SemiBold/Medium/Regular)
- 또는 CDN/Google Fonts 우회 (한국 폰트라 CDN 없음 — local 권장)
- Gmarket Sans Medium (히어로 슬로건 60px 전용) — 별도 변수
- src/app/layout.tsx에 font className 적용

### 4. 사용자 공통 컴포넌트 (src/client/)
- layouts/PublicHeader.tsx (4 BP variants — 1920/1440/1024/768/375)
  * 스크롤스파이 4메뉴 (임팩트 데이터·활동 스토리·쌀 나눔 소식·쌀나눔 프로젝트)
  * 1024 이하 햄버거 전환
- layouts/PublicFooter.tsx (다크 카피라이트 #242424)
- layouts/Banner.tsx (Sow Good 안내 띠 — "Sow Good 가족이 아니어도...")
- hooks/useScrollSpy.ts (Intersection Observer, 섹션 ID → active 메뉴 인덱스)

### 5. 어드민 공통 컴포넌트 (src/admin/)
- layouts/AdminSidebar.tsx (좌측 네비, 대시보드·소식·로그아웃)

### 6. 도메인 공유 컴포넌트 (src/features/news/components/)
- ArticleCard.tsx (12 variants: size 1~4 × Default/Hover/None)
  * None 상태는 보라 그라디언트 placeholder (#7B2AC7 → #AC69EA)
- StoryCard.tsx (라벤더 텍스트 #F1E3FF)
- FeaturedStoryCard.tsx (피처드 큰 카드, 캐러셀 1슬라이드)
- Heart.tsx (Client Component, 익명 좋아요 + optimistic toggle)
- CategoryTabs.tsx (5 카테고리, 가로 스크롤 모바일)
- Pagination.tsx (Prev / 번호 / Next, 9개/페이지)
- KpiCard.tsx (4 variants — 누적 봉사자/기간/횟수/가정)

### 7. features/news/index.ts public API (D 패턴 흡수, ADR-024)
- actions·service·types만 export
- db.ts는 export 안 함 (외부 직접 호출 금지)

### 8. Route Group layout 골격 (D-3 진입 직전 minimal만)
- app/(public)/layout.tsx — PublicHeader + main + PublicFooter wrap
- app/admin/(auth)/layout.tsx — 중앙 카드 + <meta robots noindex>
- app/admin/(panel)/layout.tsx — AdminSidebar wrap + noindex
- 기존 src/app/page.tsx는 그대로 (D-3에 교체)

## Ralph 자율 진행 가드 (자동 멈춤 지점)
1. 새 컴포넌트 큰 디자인 결정 변경 발견 — 사용자 확인
2. shadcn/ui 컴포넌트 vs 자체 구현 결정 모호 — 사용자 확인
3. SUIT 폰트 파일 부재 (otf/woff2) — 사용자에게 폰트 파일 요청 또는 CDN 폴백 결정
4. 동일 에러 3회 반복 — 즉시 멈추고 새 세션 또는 사용자 호출
5. 30분 또는 5파일 상한 초과 — 진행 보고 후 다음 단계 승인 대기
6. 컨텍스트 오염 감지 — 새 세션 호출
7. 결정 변경 발견 — AGENTS.md/domain.md/current.md/decisions.md 충돌 시 즉시 멈춤
8. 커밋·푸쉬 — Git Safety Protocol §3 단계별 사용자 승인. main 직접 push 절대 금지

## 작업 단위 원칙
- F3 폴더 결정 규칙 엄수 (위치 결정 5초 안):
  * 사용자 전용 UI → src/client/
  * 어드민 전용 UI → src/admin/
  * 양쪽 공유 도메인 UI → src/features/news/components/
- vertical slice: FE + 서비스 호출 둘 다 — 컴포넌트만 또는 hooks만 금지
- Server Component 기본, Client Component는 useState/onClick/useEffect 필요한 leaf만
- React Hooks 안전 (.ai/rules/frontend.md): useEffect로 derived state 금지,
  eslint-disable react-hooks/* 금지, 객체 prop을 dep로 쓰지 말 것
- 매 task 종료 전: pnpm tsc --noEmit + pnpm build 통과
- .ai/rules/anti-slop.md §3 디자인 slop 통과:
  * 그라데이션 3색+ 금지 (Figma에 정의된 #7B2AC7 → #AC69EA 그대로)
  * 이모지 남용 금지 (lucide-react만)
  * 한 화면 폰트 크기 7개+ 금지
  * 모든 카드 같은 shadow 금지

## 검증 증거 표준 (methodology-tooled §6)
완료 주장 시 다음 증거 동반:
- 컴포넌트별 스크린샷 (Playwright MCP 또는 dev server 수동 — D-3 GATE 3에 종합)
- console.error 0건
- pnpm tsc --noEmit 0 에러
- pnpm build 통과
- 반응형: 1920·1440·1024·768·375 모두 가로 스크롤 없음 (anti-slop 모바일)

## 진행하면서 매 단계 끝마다
- checklist.md 해당 항목 체크
- context-notes.md에 결정 사항 누적 (큰 결정만)
- 새 ADR 필요 시 docs/decisions.md에 추가
- Atomic Update: 코드 변경 시 관련 docs 동일 세션에 함께 수정

## Git
- 현재 브랜치: feat/sprint-1-d4-components (main에서 분기, PR #1 머지 후)
- 커밋: 논리 단위 분할 예시
  * chore: shadcn/ui 초기화 + primitive 8종 추가
  * feat(design): 디자인 토큰 globals.css + SUIT 폰트 셋업
  * feat(client): PublicHeader + Footer + Banner + useScrollSpy
  * feat(admin): AdminSidebar
  * feat(news): ArticleCard 12 variants + StoryCard + FeaturedStoryCard
  * feat(news): Heart + CategoryTabs + Pagination + KpiCard
  * feat(news): index.ts public API
  * chore(layouts): app/(public) + app/admin/(auth)/(panel) Route Group layout 골격
- main 직접 push 금지 (PreToolUse hook이 차단)
- push는 사용자 승인 후

---

지금 D-4 첫 작업부터 시작해. AGENTS.md + .ai/rules/domain.md + ADR-024 부터 읽고,
vertical slice 분해 후 F3 폴더 신규 생성 → shadcn 초기화 → 디자인 토큰 → SUIT 폰트
→ PublicHeader 순으로 진입. Ralph 가드 8개 항상 지키며 자율 진행.
```

---

## 📌 보조 정보 (다음 세션 진입 전 알아두면 좋은 것)

### D-4 작업 분량 (vertical slice 분해)
- 폴더 생성·shadcn·디자인 토큰·폰트 = 4~5시간
- 사용자 컴포넌트 (PublicHeader/Footer/Banner/useScrollSpy) = 3~4시간
- 어드민 컴포넌트 (AdminSidebar) = 1시간
- 도메인 컴포넌트 (ArticleCard 12 + StoryCard + Featured + Heart + Tabs + Pagination + KpiCard) = 5~6시간
- Route Group layout 골격 = 1시간
- **총 14~17시간** — 1일에 빠듯, D-5와 D-3 일부 흡수 가능

### 미해결 TBD (블로커 아님)
- 도메인 확정 (사회공헌국 회신 대기)
- "쌀나눔 프로젝트" 메뉴 → StorySection 추론 확정
- SUIT 폰트 otf/woff2 파일 위치 (사용자 제공 필요 또는 GitHub `sunn-us/SUIT` 다운로드)
- Gmarket Sans Medium 폰트 파일 (히어로 슬로건 60px 전용)

### Figma 컴포넌트 ID (D-4 작업 시 design_context 추출 필요 시)
- Header: `97:9431` (4 BP variants)
- Menu: `9:3300`
- StoryCard: `44:1840`
- ArticleCard: `114:8164` (12 variants)
- Heart: 변경 위치 — context-notes.md 4차 참조
- FeaturedStoryCard: 캐러셀 4슬라이드 — design.md 참조
- ArticleGrid: 마조네리 3열 + 좌측 다크 블록
- CategoryTabs: 5 카테고리 가로 스크롤
- Pagination: Pretendard에서 SUIT로 교체 (ADR-008)

### 비상 시 폴백
- SUIT 폰트 파일 부재 → Pretendard CDN 임시 사용 + D-1에 SUIT 교체
- shadcn/ui v4 호환 이슈 → Tailwind v3 호환 모드로 단계 다운그레이드 검토
- 디자인 토큰 매핑 시간 부족 → 색 토큰만 먼저, 타이포·스페이싱은 D-3
- Playwright MCP 부재 → 수동 스크린샷 + 브라우저 확인 (사용자 협조)
