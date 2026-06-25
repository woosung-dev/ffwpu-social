# 어드민 활동 스토리 관리 — 제목·태그 분리 검색 설계

> 작성일 2026-06-25 · 상태 confirmed · 브랜치 `feat/admin-news-search`

## 1. 배경·목표

어드민 "활동 스토리 관리"(`/admin/news` 스토리 관리 탭) 글 목록에는 현재 상태탭·카테고리·정렬·페이지당개수 필터만 있고 **검색이 없다.** 운영자가 특정 글을 빠르게 찾으려면 페이지를 넘겨가며 눈으로 훑어야 한다.

목표는 **제목·태그를 분리한 실시간 디바운스 검색**을 추가하되, 좁은 모바일(375px)에서도 레이아웃이 깨지지 않게 하는 것이다.

### 결정 사항 (사용자 확정)

- 검색 동작: **실시간 디바운스** (입력 즉시 자동 검색, 엔터 불필요)
- 검색 폼: **제목·태그 입력 분리** (검색창 2개)
- 검색 범위: 제목(텍스트) · 태그(텍스트), 둘 다 입력 시 AND 결합

### 비범위 (YAGNI)

- 본문 전문 검색 (1차 범위 초과)
- 클릭형 태그 칩 필터 (v1.1 후보)
- 검색어 자동완성 드롭다운 (어드민 14건 규모에 불필요)
- 스키마 변경 / 마이그레이션 (없음)

## 2. 현황 (재사용 자산)

| 자산 | 경로 | 용도 |
|---|---|---|
| `likePattern` | `src/features/news/search-query.ts` | LIKE 메타문자(`% _ \`) 이스케이프 + 부분일치 패턴 |
| `searchWhere` (공개) | `src/features/news/db.ts` | 제목 OR 태그 ILIKE (공개 /news 전용, **수정 안 함**) |
| `SearchInput` | `src/features/news/components/SearchInput.tsx` | 한글 IME 조합 감지 입력. 단 제출형이라 디바운스용으로 직접 재사용 대신 IME 패턴만 참고 |
| 어드민 목록 | `src/features/news/service.ts` `listNewsForAdmin` | page/limit/status/categorySlug/sort |
| 어드민 DB | `src/features/news/db.ts` `listForAdmin`/`countForAdmin` | status·category 필터 |
| 정규화 SSoT | `src/features/news/admin-sort.ts` | `normalizeNewsSort`/`normalizeNewsPageSize` |
| 어드민 테이블 | `src/admin/components/NewsTable.tsx` | URL 기반 툴바 + 데스크탑 테이블 / 모바일 카드 |
| 페이지 | `src/app/admin/(panel)/news/page.tsx` | searchParams 파싱 → service 호출 |

## 3. 레이아웃

검색 영역을 필터 툴바와 **물리적으로 분리된 전용 블록**으로 둔다. 검색창 2개가 늘어나도 기존 상태탭/정렬/새글 줄바꿈에 간섭하지 않는다.

```
PC (≥768)
┌──────────────────────────────────────────────────────────┐
│ [ 🔍 제목 검색…        ✕ ]   [ 🏷 태그 검색…        ✕ ]    │  ← 전용 검색 블록 (md:flex-row)
├──────────────────────────────────────────────────────────┤
│ [전체][임시][예약][발행] ⓘ        [정렬▾][10개씩▾][+새글]   │  ← 기존 툴바 그대로
└──────────────────────────────────────────────────────────┘

Mobile (375)
┌─────────────────────────┐
│ [ 🔍 제목 검색…      ✕ ] │  ← 풀폭 세로 스택 (flex-col)
│ [ 🏷 태그 검색…      ✕ ] │
├─────────────────────────┤
│ [전체][임시][예약][발행] │  ← 기존대로 wrap
│ [정렬▾]      [10개씩▾]   │
│ [+ 새 글]               │
└─────────────────────────┘
```

- 검색 블록: `flex flex-col gap-2 md:flex-row` — 모바일 세로 → PC 가로
- 각 입력: `h-11`(44px 터치 타깃) · `min-w-0` · `w-full md:flex-1` — 가로 오버플로 차단
- 아이콘: 제목 = 돋보기(lucide `Search`), 태그 = `Tag`. 이모지 금지(SVG)
- 입력 우측 ✕ 클리어 버튼: 값이 있을 때만 노출, `aria-label="검색어 지우기"`
- 라벨: 시각적 아이콘 + `aria-label`("제목 검색", "태그 검색")로 스크린리더 대응

## 4. 동작

- 두 입력 각각 **300ms 디바운스** 후 URL 동기화 — 제목 `?q=`, 태그 `?tag=`
- 빈 값이면 해당 파라미터 제거. 검색·필터 변경 시 `page` 1로 리셋
- 둘 다 입력 시 **AND 결합** (제목 조건 AND 태그 조건)
- 디바운스 중·전환 중 기존 `isPending`(useTransition) 흐림 재사용
- 결과 건수 "총 N건" 표시 (기존 totalPages 흐름에 total 노출)
- 결과 0건: 빈 화면 대신 안내 — "조건에 맞는 글이 없어요" + "검색 조건 지우기" 버튼(q·tag 제거)
- 한글 IME: `onCompositionStart/End` + `isComposing` 가드로 조합 중 디바운스 확정 호출 방지 (조합 종료 시 1회 반영)
- 입력 maxLength 100, trim 후 비교

## 5. 데이터 레이어 변경

기존 공개 `searchWhere`(제목 OR 태그)는 건드리지 않는다. 어드민은 AND 분리이므로 별도 헬퍼를 둔다.

```
// src/features/news/db.ts (신규 헬퍼)
titleWhere(q?)  → ilike(news.title, likePattern(q))            // q 없으면 undefined
tagWhere(tag?)  → EXISTS(newsTags WHERE newsId=news.id AND tag ILIKE likePattern(tag))
```

- `listForAdmin` / `countForAdmin`: `q`·`tag` 옵션 추가 → `and(adminStatusWhere, categoryWhere, titleWhere(q), tagWhere(tag))` (undefined는 drizzle `and`가 무시)
- `service.ts listNewsForAdmin`: `q?: string`·`tag?: string` 인자 추가 → db로 전달, count에도 동일 전달
- `admin-sort.ts`: `normalizeNewsQuery(raw)`·`normalizeNewsTag(raw)` 추가 — 배열 처리 + trim + slice(0,100), 빈 문자열은 undefined
- `page.tsx ManageTab`: `searchParams.q`·`searchParams.tag` 정규화 → service 호출, `NewsTable`에 `q`·`tag`·`total` props 전달

## 6. 클라이언트 변경 (`NewsTable.tsx`)

- props 추가: `q: string`, `tag: string`, `total: number`
- 로컬 state: `qInput`/`tagInput` (입력 즉시 반영) + 디바운스 effect로 URL push
- 디바운스: `setTimeout(300ms)` 패턴 (프로젝트 기존 `TagsInput` 방식 따름, cleanup으로 clearTimeout)
- `setQ`/`setTag`: URLSearchParams 갱신, 기본(빈값) 시 delete, `page` delete, `router.push` + `startTransition`
- 검색 블록은 테이블/카드 위, 기존 툴바 위에 렌더
- 빈 상태: `rows.length === 0 && (q || tag || status!=='all')` → 안내 + 조건 초기화 버튼

## 7. 검증

- **단위 테스트** (`src/features/news/__tests__`): titleWhere/tagWhere 조합 — 제목만·태그만·둘 다·이스케이프(`%`,`_`,`\`)·대소문자 무관
- **Playwright**: 375 / 768 / 1024 3폭 — 가로 스크롤 0(`scrollWidth<=clientWidth`), 제목 검색·태그 검색·AND·빈 상태·✕ 클리어 동작
- `pnpm tsc --noEmit` · `pnpm lint` · `pnpm test` 통과

## 8. 영향 파일 요약

| 파일 | 변경 |
|---|---|
| `src/features/news/db.ts` | `titleWhere`/`tagWhere` 추가, `listForAdmin`/`countForAdmin`에 q·tag |
| `src/features/news/service.ts` | `listNewsForAdmin`에 q·tag 인자 |
| `src/features/news/admin-sort.ts` | `normalizeNewsQuery`/`normalizeNewsTag` |
| `src/app/admin/(panel)/news/page.tsx` | searchParams q·tag 파싱, props 전달 |
| `src/admin/components/NewsTable.tsx` | 검색 블록 UI + 디바운스 push + 빈 상태 |
| `src/features/news/__tests__/*` | titleWhere/tagWhere 단위 테스트 |

## TL;DR

- **문제**: 어드민 스토리 목록에 검색이 없어 글 찾기가 불편
- **원인**: `listNewsForAdmin`이 status·category·sort만 지원
- **채택안**: 제목(`?q=`)·태그(`?tag=`) 분리 실시간 디바운스 검색, AND 결합, 전용 검색 블록(모바일 세로·PC 가로)으로 툴바 간섭 차단
- **파일**: db.ts · service.ts · admin-sort.ts · page.tsx · NewsTable.tsx · 테스트
- **검증**: 단위(필터 조합·이스케이프) + Playwright 3폭(가로 스크롤 0·동작·빈 상태) + tsc/lint/test
- **폴백**: 검색은 추가 필터일 뿐, 미입력 시 기존 동작 100% 보존. 스키마 변경 0
