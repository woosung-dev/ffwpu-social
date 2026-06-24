# 어드민 모바일 반응형 전수 감사·수정 리포트 (2026-06-24)

브랜치 `fix/admin-mobile-responsive`. 방식: 격리 워크트리 + **Generator-Evaluator** 루프 + **Playwright MCP** 증거(실측 + 스크린샷). 범위: 깨짐 + 인접 다듬기. 최소 지원 폭 360px. 뷰포트 360/375/768/1024, 데스크탑 무회귀 1024.

## 성공 조건 결과 (C1~C11)

| 기준 | 내용 | 결과 |
|------|------|------|
| C1/C2 | 360 페이지 가로 오버플로 0 | ✅ 깨짐 3건 모두 해소 (실측 CLEAN) |
| C3 | 콘솔 에러 신규 0 | ✅ |
| C5 | 잘림·겹침 없음, 가독 | ✅ |
| C6 | 모바일 내비(드로어/햄버거/백드롭) | ✅ (drawer left:0 w240 + backdrop) |
| C7 | 테이블 카드뷰/contained 스크롤 | ✅ (기존 듀얼 렌더 유지) |
| C8 | 폼·에디터 툴바·다이얼로그 사용성 | ✅ |
| C9 | 드래그 리스트 행 수용 | ✅ (대표글 제목 가독 개선) |
| C10 | 데스크탑(1024) 무회귀 | ✅ pixel-identical (독립 검토자 확인) |
| C11 | tsc0·lint0·test71·build✓ | ✅ |

독립 Evaluator(코드 미작성) 최종 판정: **SHIP** — 7개 수정 화면 전부 PASS, 데스크탑 무회귀, 블로킹 없음.

## 객관 측정 (360px page overflow: scrollWidth − innerWidth, ≤0 = clean)

| 화면 | before | after | 처리 |
|------|--------|-------|------|
| dashboard | +45 ❌ | **-15 ✅** | 분석 2단 grid 자식 `min-w-0` + 인기글 행 모바일 스택 + 제목 `w-full sm:w-auto truncate` |
| news-manage | +17 ❌ | **-15 ✅** | 툴바 액션그룹 `flex-wrap justify-end` |
| editor(new) | +31 ❌ | **-11 ✅** | 에디터 임베드 SCSS — `@media(max-width:480px)` 에서 fixed 툴바 `position:static` (루트코즈: 상위 toolbar.scss 가 positioned wrapper 없는 곳에서 `absolute+width:100%`) |
| editor 768/1024 | clean | clean | 툴바 `sticky` 유지(≤480 스코프라 무영향) |
| news-featured/landing/main-story/categories/kpi/accounts/login | clean | clean | 페이지 오버플로 없음(시각·탭타깃 다듬기만) |

## 시각·탭타깃 다듬기 (페이지 오버플로 아님)

- **대표글(HeroOrderManager)**: 360 행 `gap-2 p-2.5 md:gap-3 md:p-3` + 썸네일 `size-10 md:size-12` → 제목 가시 글자 약 2배. 삭제·소식추가 버튼 `min-h-10 md:min-h-8`.
- **카테고리(CategoryManager)**: 행 동일 패턴 → slug·글 N건 덜 잘림. 수정 버튼 `min-h-10 md:min-h-8`.
- **랜딩(LandingSlotManager)**: 해제 버튼 `min-h-10 md:min-h-8`.
- **계정(AccountManager)**: 액션 `gap-1→gap-2`, 재설정/삭제 `min-h-10 md:min-h-8`.

공통 원칙: 모바일에서 고정 비용 축소·탭타깃 40px 확보, `md:` 로 데스크탑 원복 → 데스크탑 무회귀.

## 변경 파일 (코드 8)
- `src/app/admin/(panel)/page.tsx`
- `src/admin/components/NewsTable.tsx`
- `src/styles/admin-editor-embed.scss`
- `src/admin/components/HeroOrderManager.tsx`
- `src/admin/components/CategoryManager.tsx`
- `src/admin/components/LandingSlotManager.tsx`
- `src/admin/components/AccountManager.tsx`

shadcn `components/ui/*` 미수정(사용처 className override만) · `eslint-disable` 없음 · 훅 변경 없음 · 스키마 변경 없음.

## 증거
`baseline/` (수정 전) · `after/` (수정 후) 각 화면 360/768/1024 PNG + `sidebar-drawer-open-360` + `accounts-dialog-360`. 객관 측정은 `baseline-measurements.md`.

## 잔여(비블로킹)
- 대표글·카테고리 제목은 360에서 여전히 truncate — 의도(페이지 오버플로 방지). 썸네일·카테고리 라벨로 식별 가능.
- 에디터 본문 min-height 로 모바일에서 사이드 카드가 아래로 — 기존 동작, 범위 외.
