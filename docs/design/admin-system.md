<!-- 어드민(CMS) 디자인 시스템 SSoT — ui-ux-pro-max v2.5 (Swiss Modernism 2.0 base) + globals.css 토큰 + 도메인 톤앤매너 매핑. Phase 0 산출물. -->

# 어드민 디자인 시스템 — `docs/design/admin-system.md`

> **상태**: Phase 0 (2026-06-01). `ui-ux-pro-max:ui-ux-pro-max` 스킬 호출 결과 + 도메인 톤앤매너 (.ai/project/domain.md §7) + 기존 globals.css 토큰을 종합.
> **목적**: 어드민 5 화면 polish (2.5 → 4.5) 의 디자인 SSoT. Phase 1 design-shotgun 시안의 *제약 조건* 으로 사용.
> **베이스 스타일**: **Swiss Modernism 2.0** — Grid 12 컬럼·mathematical spacing·rational·single accent. 워크스페이스/CMS/엔터프라이즈 적합도 ⚡ Excellent + WCAG AAA + Tailwind 10/10 호환.

---

## 1. 핵심 원칙 (4 가지)

| 원칙 | 의미 | 위반 시 결과 |
|---|---|---|
| **Single Accent** | 강조 색은 *한 번에 한 곳* — 보라(brand-primary)는 *현재 선택·발행 상태* 표시만 | 보라 과의존 (현 어드민 문제) → AI-slop |
| **Mathematical Spacing** | 8px base — gap·padding 모두 4·8·12·16·24·32·48·64 만 사용 | 14px·18px·22px 같은 *임의값* 사용 → 시각 노이즈 |
| **Mono 위계** | 텍스트는 `ink-strong / subtle / date` 3 단으로 *위계* 유지. 컬러는 *의미* 일 때만 | 회색 N단계 → 가독성 저하 |
| **Quiet Surface** | 표면(surface-card/cool/soft) 3 단. 그 외는 *동일 surface* 유지 | 카드마다 다른 배경 → 시선 분산 |

---

## 2. 색상 위계 (어드민 전용 매핑)

기존 토큰을 *어드민 컨텍스트* 로 재배치. 신규 토큰 없음 — 의미만 정의.

### 2-1. 기본 (대부분의 화면)

| 역할 | 토큰 | 사용처 |
|---|---|---|
| 기본 텍스트 | `text-ink-strong` (#1F2937) | 제목·본문 |
| 보조 텍스트 | `text-ink-subtle` (#6B7280) | 설명·placeholder·라벨 |
| 메타 텍스트 | `text-ink-date` (#959BA9) | 날짜·카운트·breadcrumb |
| 본 배경 | `bg-background` (= white) | 페이지 본 영역 |
| 카드 배경 | `bg-surface-card` (#FAFAFA) | NewsEditor·테이블 행 |
| 휴식 배경 | `bg-surface-cool` (#F5F6F8) | 사이드바·panel 배경 |
| 강조 배경 | `bg-surface-soft` (#F6F6F6) | 비활성 영역·empty state |
| 경계선 | `border-border` | 테이블·카드·divider |

### 2-2. 단일 accent (보라 — 의미 있을 때만)

| 토큰 | 사용처 | 절대 사용 금지 |
|---|---|---|
| `text-brand-primary` (#501F7E) | 현재 선택된 nav 메뉴·active tab 표시 | 본문 텍스트·일반 버튼 |
| `bg-brand-primary` | Primary CTA 버튼 (저장·발행 등 1개만) | 카드 배경·다중 버튼 |
| `border-brand-primary` | 폼 필드 focus ring·active tab underline | 비활성 영역 |
| `text-brand-vivid` (#B35FEB) | 발행 상태 배지 텍스트 | 본문·라벨 |

→ **Swiss Modernism 2.0 의 single accent 원칙 — 한 화면당 보라 사용 *영역* 3 곳 이하**. 위반 시 anti-slop §3 위반.

### 2-3. 의미 컬러 (status·feedback)

| 의미 | 토큰 | 적용 |
|---|---|---|
| **published** (발행됨) | `bg-warm/15 text-warm-foreground` 또는 `bg-kpi-yellow/30 text-ink-strong` | 발행 배지 |
| **draft** (임시저장) | `bg-surface-soft text-ink-subtle` | 임시저장 배지 |
| **archived** | `bg-surface-cool text-ink-date` (취소선) | 아카이브 배지 |
| **success** | `bg-kpi-lime/30 text-ink-strong` | 저장 완료 toast |
| **error** | `bg-destructive/10 text-destructive` | 폼 오류 |
| **info** (도메인 §2 동의 안내) | `bg-tag-bg text-brand-deep` | 정보 hint |

→ **상태는 *색 + 텍스트* 동시** 표현 (WCAG `color-not-only`).

### 2-4. 데이터 시각화 (Dashboard 한정)

| 토큰 | 의미 |
|---|---|
| `text-kpi-purple` / `bg-kpi-purple/15` | KPI 카드 1 (예: 총 글 수) |
| `text-warm` / `bg-warm/15` | KPI 카드 2 (이번 주 발행) |
| `text-kpi-lime` / `bg-kpi-lime/30` | KPI 카드 3 (활동 카테고리 수) |
| `text-brand-mid` / `bg-tag-bg` | KPI 카드 4 (총 태그) |

→ **4 색 위계** — 보라+오렌지+kpi-* 분산. 보라 단독 ≤ 50%.

---

## 3. 타이포 4 단 위계 (SUIT)

ui-ux-pro-max 추천 (Lexend + Source Sans 3) 의 *역할 구조* 만 차용. 폰트는 우리 SUIT 사용.

| 단 | 토큰 | 용도 | 예시 |
|---|---|---|---|
| **Display** | `text-3xl font-suit font-extrabold tracking-tight` | 페이지 헤더 (대시보드 제목) | "대시보드", "쌀 나눔 소식 관리" |
| **Title** | `text-xl font-suit font-bold tracking-tight` | 섹션 헤더 (카드 제목·dialog 제목) | "최근 발행", "카테고리 추가" |
| **Body** | `text-base font-suit font-medium` | 본문 (입력값·테이블 셀·설명) | (대부분) |
| **Caption** | `text-sm font-suit font-medium text-ink-subtle` | 메타·도움말·라벨 | "마지막 수정 2시간 전" |

> **금지** — `text-2xl` `text-lg` `text-xs` 같이 *4 단 밖* 의 폰트 사이즈. 변형은 *4 단 안* 에서 weight·tracking 으로 조절.

### Line-height·Tracking 규약

- Display·Title: `leading-tight` + `tracking-tight`
- Body: `leading-normal` (1.5)
- Caption: `leading-normal` + 기본 tracking

---

## 4. Surface 3 단 + Radius·Shadow 규약

### 4-1. Surface 위계

| Surface | 토큰 | 사용 빈도 | 예시 |
|---|---|---|---|
| Level 0 (page) | `bg-background` (white) | 페이지 본 | (panel) 본문 |
| Level 1 (panel) | `bg-surface-cool` | 항상 | 사이드바·login 카드 |
| Level 2 (card) | `bg-surface-card` | 자주 | NewsEditor·테이블 행 hover |

→ **카드 안에 카드 안에 카드 (3 nested) 금지** — Level 0 → 1 → 2 까지. 그 이상 nested 면 `border` 만으로 구분.

### 4-2. Radius (4 단)

| 사용처 | 클래스 |
|---|---|
| 이미지·아바타 | `rounded-full` |
| 배지·작은 칩 | `rounded-md` (6px) |
| 카드·입력 필드·버튼 | `rounded-lg` (8px) |
| 큰 컨테이너 (Editor 외곽) | `rounded-xl` (12px) |

> 어드민에서 `rounded-2xl` `rounded-3xl` 등 *과한 곡률* 금지 — 워크스페이스 톤 위반.

### 4-3. Shadow 위계 (2 단)

기존 Tailwind v4 토큰 활용. **2 단만 사용**:

| Shadow | 사용처 |
|---|---|
| `shadow-sm` | 카드·테이블 행 (default state) |
| `shadow-md` | 호버·dropdown·dialog |

> `shadow-lg` `shadow-xl` `shadow-2xl` *금지* — 어드민은 *조용함*. Editor 처럼 focus 가 필요한 곳도 `shadow-md` + border 강조로 처리.

---

## 5. 마이크로 인터랙션 (Hover·Focus·Active)

ui-ux-pro-max Touch & Interaction priority CRITICAL — 정확한 timing·affordance.

### 5-1. Hover (커서·인덱싱)

| 요소 | 패턴 |
|---|---|
| 버튼 | `hover:bg-{base}/90 transition-colors duration-150` |
| 테이블 행 | `hover:bg-surface-card transition-colors duration-150` |
| 링크 | `hover:underline underline-offset-4 hover:text-brand-primary` |
| 카드 (클릭 가능) | `hover:shadow-md hover:-translate-y-0.5 transition-all duration-200` |

→ **transition duration 150~200ms** (Quick Reference §7 `duration-timing`). 300ms 이상 금지.

### 5-2. Focus (키보드)

| 요소 | 패턴 |
|---|---|
| 입력 필드 | `focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:outline-none` |
| 버튼 | 동일 ring 패턴 |
| nav 메뉴 | `focus-visible:bg-surface-cool focus-visible:ring-1 focus-visible:ring-brand-primary` |

→ **focus ring 절대 제거 금지** (`outline-none` 만 쓰지 말고 `focus-visible:ring-*` 동시 적용 — WCAG §1).

### 5-3. Active (클릭 순간)

| 요소 | 패턴 |
|---|---|
| 버튼 | `active:scale-[0.98] transition-transform duration-75` |
| 카드 | `active:bg-surface-cool` |

→ **scale 0.95~1.05 한도** (Quick Reference §7 `scale-feedback`).

### 5-4. Disabled

`disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none` — 모든 인터랙티브 요소에 일관 적용.

---

## 6. 반응형 4 BP (1440·1024·768·375)

기존 사용자 페이지 BP 정합. Tailwind v4 기본값:

| 단계 | min-width | 어드민 적용 |
|---|---|---|
| Mobile | 375px (base) | 사이드바 토글 closed, 폼 필드 1 column |
| Tablet | `md:` 768px | 사이드바 토글 가능, 테이블 일부 컬럼 숨김 |
| Desktop | `lg:` 1024px | 사이드바 펼침, 테이블 전 컬럼 |
| Wide | `xl:` 1280px | NewsEditor side panel (preview·meta) 펼침 |

> **Mobile-first** — base 가 375px, sm:/md: 단계 *누락 금지* (현 어드민 문제 #4 해결).

### 컨테이너 max-width

| 영역 | 클래스 |
|---|---|
| panel 본문 | `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8` |
| NewsEditor | `max-w-4xl mx-auto` |
| 로그인 카드 | `max-w-sm w-full` |

---

## 7. 화면별 토큰 적용 가이드

### 7-1. LoginForm + (auth)/layout

- 배경: `bg-surface-cool min-h-dvh flex items-center justify-center`
- 카드: `bg-surface-card rounded-xl shadow-sm border border-border max-w-sm w-full p-8`
- 헤더 (Sow Good 로고): 상단 32px, Display 위계
- 입력: Body 위계 + focus ring 패턴
- CTA: `bg-brand-primary text-white` (single accent — 이 화면의 유일한 보라)

### 7-2. AdminSidebar

- 배경: `bg-surface-cool border-r border-border`
- 활성 메뉴: `bg-brand-primary/10 text-brand-primary border-l-2 border-brand-primary` (single accent 영역)
- 비활성 메뉴: `text-ink-subtle hover:bg-surface-card hover:text-ink-strong`
- 아이콘: Lucide·일관 stroke 1.5px (Common Rules §Icons)
- 모바일: `lg:hidden` 햄버거 토글 + drawer overlay

### 7-3. (panel) Dashboard

- 페이지 헤더: Display 위계 + Caption 부제
- KPI 4 카드: 2x2 grid (mobile) → 4-col (lg+). 4 색 분산 (§2-4)
- 최근 발행 리스트: Card surface + Body 위계
- 액션 (새 글 작성): Primary CTA `bg-brand-primary` 우상단 1개

### 7-4. NewsTable

- 상태 탭 (전체/draft/published/archived): underline 패턴 + 활성 `text-brand-primary border-b-2 border-brand-primary`
- 테이블: `bg-background border border-border rounded-lg overflow-hidden`
- 행 hover: `hover:bg-surface-card`
- 상태 배지: §2-3 의미 컬러
- 빈 상태: `bg-surface-soft` 컨테이너 + 안내 + "새 글 작성" CTA
- 페이지네이션: 사용자 페이지의 Pagination 컴포넌트 재사용

### 7-5. NewsEditor + TiptapEditor

- 외곽: `bg-surface-card rounded-xl border border-border p-6 sm:p-8`
- 섹션 분리: Title 위계 + `border-b border-border` divider
- Tiptap 툴바: `bg-surface-cool rounded-lg border border-border p-1` (sticky top)
- 에디터 영역: `prose prose-sm sm:prose-base max-w-none min-h-[400px]`
- 커버 업로더: §7-7 참조
- 태그 입력: §7-7 참조
- 액션: 우하단 sticky `<div class="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border py-4">` → 임시저장(`secondary`) + 발행(`bg-brand-primary`)

### 7-6. CategoryManager

- 좌 (추가 폼) + 우 (테이블) 2 column. 모바일은 세로 stack
- 활성 toggle Switch: kpi-lime (활성) / surface-soft (비활성)
- 정렬: 드래그 핸들 + `text-ink-date` 메타
- empty state: §7-4 와 동일 패턴

### 7-7. CoverImageUploader + TagsInput

- CoverImageUploader: dropzone `border-2 border-dashed border-border hover:border-brand-primary rounded-lg bg-surface-soft`. 업로드 후 *이미지 미리보기 + remove* 버튼
- TagsInput: chip 패턴 `bg-tag-bg text-brand-deep rounded-full px-3 py-1 text-sm`. autocomplete dropdown `shadow-md border border-border bg-surface-card`

---

## 8. Anti-patterns (절대 금지)

| 패턴 | 위반 영역 | 대체 |
|---|---|---|
| 보라가 화면의 50% 이상 차지 | §2-2 single accent | mono + 의미별 단일 accent |
| `text-2xl` `text-lg` 같은 4 단 외 사이즈 | §3 typo | Display/Title/Body/Caption 4 단 |
| `rounded-2xl` `rounded-3xl` 과한 곡률 | §4-2 radius | rounded-md/lg/xl 3 단 |
| `shadow-lg` 이상 그림자 | §4-3 shadow | shadow-sm/md 2 단 |
| 이모지 (🎯 ✨ 🚀 등) icon 대체 | Common Rules §Icons | Lucide SVG 1.5px stroke |
| 호버에 `scale-105` + `shadow-lg` + `-translate-y-2` 3 효과 동시 | §5-1 hover | scale 0.98 + bg 변경만 |
| `transition-all` | §5 인터랙션 | `transition-colors` `transition-transform` 등 명시 |
| `outline-none` 만 (focus ring 없이) | §5-2 focus | focus-visible:ring-* 동시 적용 (WCAG) |
| `placeholder` 만 label | Quick Reference §8 `input-labels` | visible label + helper text |

---

## 9. 검증 체크리스트 (Phase 2 매 컴포넌트 끝마다)

- [ ] 보라(`brand-primary` 직접 hex 포함) 사용 영역 ≤ 3 곳 / 화면
- [ ] 타이포 4 단 만 사용 (text-{xs|3xl 외} 0 건)
- [ ] Radius rounded-{md|lg|xl|full} 만 사용
- [ ] Shadow shadow-{sm|md} 만 사용
- [ ] 이모지 0 건
- [ ] 4 BP 가로 스크롤 0 건 (375/768/1024/1440)
- [ ] focus-visible ring 모든 인터랙티브 요소
- [ ] disabled 상태 일관 (`opacity-50 cursor-not-allowed pointer-events-none`)
- [ ] visible label 모든 입력 (placeholder 만 금지)
- [ ] 색상 contrast ≥ 4.5:1 (text 측정 결과 기록)

---

## 10. Phase 1 design-shotgun 입력 (다음 단계)

다음 Phase 1 의 design-shotgun 호출 시 *프롬프트 제약*으로 본 시스템 명시:

```
스타일: Swiss Modernism 2.0 — 12 컬럼 grid, mathematical 8px spacing, rational, single accent (보라 brand-primary).
타이포: SUIT 4 단 (Display 3xl ExtraBold / Title xl Bold / Body base Medium / Caption sm Medium ink-subtle).
색상: 보라 ≤ 3 영역 / 화면 (active/CTA/focus). 의미는 단일 accent (오렌지 warm, kpi-yellow/lime/purple) 분산.
Radius: rounded-md/lg/xl 만. Shadow: shadow-sm/md 만.
인터랙션: 150-200ms transition, focus-visible ring, scale 0.98 active.
금지: 이모지·gradient 3색·transition-all·hover 3효과·placeholder-only label.
```

---

## 출처

- **ui-ux-pro-max v2.5.0** — Swiss Modernism 2.0 (priority 4 Style Selection)
- **Quick Reference §1·§2** (Accessibility·Touch — CRITICAL priority)
- **.ai/project/domain.md §7** — 톤앤매너 5 키워드 (진정성·따뜻함·투명성·공공성·지속성)
- **src/app/globals.css** — 기존 토큰 인벤토리 (변경 없음, 매핑만 신규)
- **PR #5 어드민 D-2** — 기존 컴포넌트 7 종 (LoginForm/NewsEditor/TiptapEditor/NewsTable/CategoryManager/TagsInput/CoverImageUploader)

## 변경 이력

- 2026-06-01 — Phase 0 신규 작성 (Workflow plan §Phase 0 산출물)
