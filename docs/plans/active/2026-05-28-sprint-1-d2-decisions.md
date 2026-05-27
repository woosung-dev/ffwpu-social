# D-2 자동 진행 결정 로그 (2026-05-28)

> 본 세션은 사용자 사전 승인 (`멈추지 말고 PR 까지 + 추천 자동 선택 + 결정 로그`) 으로 진행. 각 분기점 [질문 / 옵션 / 선택 / 이유 / 영향] 기록.
> 전체 plan: `~/.claude/plans/ffwpu-social-fuzzy-axolotl.md` + 이전 세션 `~/.claude/plans/ffwpu-social-sprint-1-d-2-ticklish-fox.md`.
> 이전 세션에서 확정된 결정 #1~#18 은 본 파일 외부 (plan v2) — 본 파일은 *연속 진행 모드에서 새로 생긴 미시 분기* 만 누적.

---

## [T6] db.ts 신규 admin read 함수 정렬키

- **질문**: `listForAdmin`(어드민 글 목록) 의 기본 정렬키는?
- **옵션**:
  - (A) `createdAt DESC` — draft 도 상단 노출, 어드민이 최근 작성한 글을 바로 본다
  - (B) `publishedAt DESC NULLS LAST` — published 가 위, draft 가 아래
  - (C) `updatedAt DESC` — 마지막 수정 우선
- **선택**: (A) `createdAt DESC`
- **이유**: 어드민은 "방금 쓴 글 → 발행" 흐름이 일반. (B) 는 draft 가 묻혀 발행 누락 위험. (C) 는 정렬이 자주 흔들려 UX 혼란.
- **영향**: db.ts `listForAdmin` orderBy = `desc(news.createdAt)`. UI 에서 status 필터 (all/draft/published) 와 함께 사용.

---

## [T6] searchTags 정렬·DISTINCT 방식

- **질문**: TagsInput autocomplete (`searchTags(prefix, limit=10)`) 가 반환하는 태그의 정렬 + 중복 처리?
- **옵션**:
  - (A) `SELECT DISTINCT tag FROM news_tags WHERE tag LIKE prefix || '%' ORDER BY tag` (알파벳)
  - (B) `SELECT tag, count(*) FROM news_tags ... GROUP BY tag ORDER BY count DESC, tag` (빈도)
  - (C) PostgreSQL 전문검색 (`tsvector`) — 한국어 자모 분리 등
- **선택**: (B) 빈도순
- **이유**: 자주 쓰이는 태그가 위에 와야 운영 효율. (A) 는 알파벳 순서가 사용자 직관과 무관. (C) 는 v1 마감 5/31 안에 과함.
- **영향**: db.ts `searchTags` 가 `tag` + `count` 둘 다 returning. UI 는 tag 만 사용.

---

## [T6] `db.transaction` 콜백 타입 alias

- **질문**: mutation 함수 시그니처의 `tx` 타입을 어떻게 노출?
- **옵션**:
  - (A) `Parameters<Parameters<typeof db.transaction>[0]>[0]` inline 추론
  - (B) `import type { PgTransaction } from "drizzle-orm/pg-core"` 명시
  - (C) db.ts 안에 `export type TransactionLike = ...` alias
- **선택**: (C) `TransactionLike` alias (db.ts 내부 + service.ts 가 재import)
- **이유**: service.ts 가 tx 를 받지 않고 db.transaction 자체를 호출하므로 외부 노출 필요 X. db.ts 내부 가독성 위해 단일 alias. (B) 의 PgTransaction 은 generic 인자 4개라 명시하기 복잡.
- **영향**: db.ts 상단에 `type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]` 1줄 추가, mutation 시그니처 `(tx: Tx, ...)`.

---

## [T7] Tags normalize 정책 위치 (db vs service)

- **질문**: 태그 정규화 (`#` 제거 + trim + lowercase + dedupe) 는 어느 레이어?
- **옵션**:
  - (A) service.ts — 비즈니스 정책 (한 곳에서 결정)
  - (B) db.ts `replaceNewsTags` — 모든 호출자가 자동 정규화 수혜
  - (C) actions.ts Zod transform — 입력 boundary 에서
- **선택**: (A) service.ts
- **이유**: plan v2 결정. db.ts 는 그대로 받아 insert (얇은 DAL). Zod transform 은 클라 입력만 정규화 → 다른 진입점 (seed, migration) 에서 우회 가능. service 가 single source.
- **영향**: T7 `service.ts::normalizeTags(tags: string[]) → string[]` private 함수.

---

## [T7] publishNewsAction 분리 vs updateNewsAction 통합

- **질문**: 발행/발행 해제는 별도 액션? 아니면 updateNewsAction 의 publishedAt 필드만 변경?
- **옵션**:
  - (A) `publishNewsAction(id, publish: boolean)` 전용 — UI 의 [발행]/[해제] 버튼 직결
  - (B) `updateNewsAction(formData)` 안에서 publishedAt 만 set
  - (C) 둘 다 — UI 가 publish 의도만 있는 경우 (A), 폼 저장 시 (B)
- **선택**: (C) 둘 다 — `publishNewsAction(id, publish: boolean)` 신규 + `updateNewsAction` 도 publishedAt 변경 허용
- **이유**: 목록 페이지 row 의 [발행]/[해제] 토글 버튼은 폼 전체 직렬화 없이 가벼운 액션이 좋음. 편집 페이지 저장 시엔 (B) 로 한 번에. 두 액션 모두 같은 service 함수 `setPublishedAt(id, date | null)` 호출 → 중복 0.
- **영향**: actions.ts publishNewsAction 신규 (id + publish boolean) + updateNewsAction 의 publishedAt nullable 검증.

---

## [T8] Tiptap 본문 이미지 업로드 진행 표시

- **질문**: 드래그앤드롭/paste 시 업로드 진행 어떻게 표시?
- **옵션**:
  - (A) 토스트 (shadcn sonner) — "이미지 업로드 중..." → 성공/실패
  - (B) Tiptap inline placeholder — `data:image/svg` blur 이미지 → 업로드 완료 후 swap
  - (C) 모달 progress bar
- **선택**: (A) 토스트
- **이유**: (B) 가 UX 최고지만 구현 복잡 (placeholder 노드 추가 + replace 로직). 5/31 마감 우선. (C) 는 흐름 차단. sonner 토스트는 이미 shadcn 셋업.
- **영향**: T8 TiptapEditor 가 toast 직접 호출 (또는 useToast). 업로드 실패 시 에러 토스트.

---

## [T8] CoverImageUploader 업로드 실패 처리

- **질문**: 이미지 업로드 실패 시 동작?
- **옵션**:
  - (A) 에러 메시지 표시, 기존 coverImageUrl 유지 (변경 안 함)
  - (B) coverImageUrl 을 null 로 비움 (구 이미지도 사라짐)
- **선택**: (A) 기존 유지
- **이유**: 새 이미지가 실패했다고 기존 이미지를 지우는 건 비직관. 사용자가 명시적으로 [제거] 버튼을 눌러야 비움.
- **영향**: T8 CoverImageUploader 에 [제거] 버튼 별도 (기존 url null set).

---

## [T8] TagsInput Enter 키 vs comma 구분자

- **질문**: 태그 추가는 어떤 키?
- **옵션**:
  - (A) Enter — 한 줄에 하나씩
  - (B) Comma (`,`) — 인라인 다중 입력
  - (C) Enter + Comma 둘 다
- **선택**: (C) 둘 다
- **이유**: Enter 가 폼 submit 과 겹칠 위험 → preventDefault. Comma 는 사용자가 다중 태그를 한 번에 붙여넣을 때 편함. 둘 다 지원해도 구현 비용 작음.
- **영향**: T8 TagsInput `onKeyDown` 가 `e.key === 'Enter' || e.key === ','` 둘 다 처리.

---

## [T10] /admin/news 페이지네이션 URL 형식

- **질문**: 페이지네이션 URL?
- **옵션**:
  - (A) `?page=2&status=draft` (queryString — 새로고침 시 유지)
  - (B) `/admin/news/page/2` (path segment)
  - (C) 무한 스크롤
- **선택**: (A) queryString
- **이유**: queryString 이 status / categorySlug 필터와 자연 결합. (B) 는 라우트 폭증. (C) 는 어드민 컨텍스트에 부적합 (특정 글 찾기 어려움).
- **영향**: T10 `/admin/news/page.tsx` 가 `searchParams` 로 `page`/`status`/`categorySlug` 수신.

---

## [T11] 대시보드 카테고리 카운트 — 활성 카테고리만 vs 전부

- **질문**: 대시보드 "카테고리별 글 수" 가 비활성 카테고리도 표시?
- **옵션**:
  - (A) 활성 카테고리만 (`isActive=true`)
  - (B) 모든 카테고리 (비활성 포함, 카운트 0 도 표시)
- **선택**: (A) 활성만
- **이유**: 운영 자율성에서 비활성은 "사용자 안 보이게" 목적. 어드민 대시보드도 동일 원칙 — 비활성은 카테고리 관리 페이지에서만 확인.
- **영향**: T11 db.ts `countNewsByCategory()` 가 `WHERE categories.is_active = true` 필터.

---

## [T11] 로그아웃 버튼 위치

- **질문**: 로그아웃 버튼은 어디?
- **옵션**:
  - (A) AdminSidebar 하단
  - (B) 헤더 우측 (드롭다운)
  - (C) /admin 페이지 본문 우측 상단
- **선택**: (A) AdminSidebar 하단
- **이유**: 사이드바가 모든 어드민 페이지에서 노출 → 어디서든 1클릭. (B) 는 헤더 컴포넌트 미존재. (C) 는 다른 페이지에서 접근 불가.
- **영향**: AdminSidebar.tsx 하단에 LogoutButton 추가 (signOut server action).

---

## [T12] NewsBodyRenderer 단위 테스트 5건 — 어떤 케이스?

- **질문**: 차단/허용 테스트 5건 선정?
- **옵션 (각각 5건 중 일부)**:
  - (1) javascript:link 차단
  - (2) data:image src 차단
  - (3) 외부 도메인 이미지 차단 (NEXT_PUBLIC_S3_PUBLIC_URL prefix 매칭 안 됨)
  - (4) 정상 paragraph + bold + italic 렌더
  - (5) 정상 image + link 렌더 (allowed)
  - (6) 알 수 없는 노드 (`type: "evil"`) skip
  - (7) protocol-relative `//evil.com` 차단
- **선택**: (1) + (2) + (3) + (4) + (5)
- **이유**: 가장 흔한 XSS 벡터 3개 (javascript / data / 외부 이미지) + 정상 케이스 2개 (회귀 방지). (6) (7) 은 (1)~(3) 의 generalization 으로 walker 가 모르는 노드/protocol 은 모두 skip → 추가 보장 없음.
- **영향**: T12 `news-body-renderer.test.tsx` 5 case.

---

## [T13] Playwright smoke 5 시나리오 실행 여부

- **질문**: 사용자 사이트(`/news`) 가 D-3 미진행이라 placeholder 상태. Playwright smoke 어떻게?
- **옵션**:
  - (A) 어드민 단독 시나리오 (로그인 + 뉴스 생성 + 수정 + 삭제 + 카테고리) — 사용자 사이트 검증 skip
  - (B) 사용자 사이트도 placeholder 그대로 검증 (목록만)
  - (C) Playwright 전체 skip — D-3 끝나면 합쳐서
- **선택**: (C) Playwright 전체 skip
- **이유**: 본 PR 은 어드민 백엔드·UI 만. 사용자 사이트 통합은 D-3 plan. 어드민 단독 smoke 도 사용자 사이트가 새 query 함수 (`listPublicNews`) 를 호출하는 검증이 빠지면 의미 반감. D-3 (D-3 머지 시) 또는 별도 `/qa` 세션에서 통합 실행.
- **영향**: T13 verify = tsc + lint + build 3개. evidence 는 build 통과 + DB 상태 (option) + PR 본문 task 별 evidence 줄.

---

## [T7] Server Action 시그니처 — FormData vs values object

- **질문**: createNewsAction 등 어드민 CRUD action 시그니처를 어떻게?
- **옵션**:
  - (A) `useActionState` 패턴 — `(prevState, formData: FormData) => ActionResult` — React 19 표준
  - (B) values object 직접 — `(input: NewsInput) => ActionResult` — RHF handleSubmit values 직결
- **선택**: (B) values object 직접
- **이유**: 본문(body) 이 Tiptap JSON (jsonb) 인데 FormData 에 JSON 을 string 으로 직렬화·역직렬화하는 단계가 추가됨. tags 배열도 FormData 다중키 방식이 RHF useFieldArray 와 불일치. RHF handleSubmit(values => createNewsAction(values)) 가 가장 자연. useActionState 의 pending/optimistic 효용은 `useTransition` 으로 대체 가능.
- **영향**: 기존 placeholder `createNewsAction(_prevState, formData)` 시그니처 변경. index.ts barrel 도 같이 갱신. T9 NewsEditor 는 useTransition + try/catch 패턴 사용.

## [T7] News 삭제 시 S3 cleanup 위치

- **질문**: 글 삭제 시 S3 객체 청소를 어디서?
- **옵션**:
  - (A) `service.deleteNews` 안에서 best-effort fire-and-forget (`deleteByPrefix(...).catch(...)`)
  - (B) actions.deleteNewsAction 에서 await 동기 호출 (실패 시 트랜잭션 롤백 X — 이미 db.delete 완료)
  - (C) v1.1 cleanup job 전적 위임 (T7 에선 청소 안 함)
- **선택**: (A) service fire-and-forget
- **이유**: best-effort 의도. DB 삭제는 즉시 성공해야 사용자 응답 빠름. S3 실패는 v1.1 cleanup job 백업이 있으므로 OK. (B) 는 S3 지연이 UX 지연으로 직결. (C) 는 plan v2 "best-effort prefix 청소" 명시와 어긋남.
- **영향**: `features/storage/cleanup.ts::deleteByPrefix` 신규 (ListObjectsV2 + DeleteObjects, 페이지네이션 자동). service.deleteNews 가 fire-and-forget catch.

## [T7] 어드민 글 작성 시 temp- prefix 처리

- **질문**: 새 글 작성 중 이미지 업로드는 newsId 가 없어 `news/temp-{tempId}/` prefix 로 업로드됨. 저장 성공 후 S3 객체를 `news/{newsId}/` 로 옮길지?
- **옵션**:
  - (A) Copy + Delete (S3 rename) — 일관성 100%
  - (B) 그대로 두기 — DB 의 coverImageUrl/본문 src 는 `news/temp-{tempId}/...` 그대로. v1.1 cleanup job 이 처리
- **선택**: (B) 그대로 두기 — plan v2 명시
- **이유**: S3 객체 옮김은 비동기 작업, 실패 시 일관성 깨짐. URL 만 보면 prefix 가 일관성 갖지 않지만 동작상 문제 없음. v1.1 cleanup job 패턴.
- **영향**: 글 삭제 시 `news/{newsId}/` prefix 삭제는 *수정 페이지에서 새로 올린 이미지* 만 청소함. temp- 업로드는 orphan 으로 남고 v1.1 에서 정리.

## [T8] Toast vs ErrorBanner

- **질문**: 업로드 실패·진행 알림을 어떻게?
- **옵션**: (A) shadcn sonner toast / (B) ErrorBanner inline (CategoryManager 패턴)
- **선택**: (B) ErrorBanner inline + Loader2 스피너 inline
- **이유**: sonner 미설치. CategoryManager 가 이미 inline 패턴이므로 일관성. NewsEditor 가 부모로서 ErrorBanner 노출, 자식 컴포넌트는 onError callback 으로 메시지 전달.
- **영향**: TiptapEditor/CoverImageUploader/TagsInput 의 props 에 `onError?: (msg: string) => void` + isUploading inline 스피너.

## [T8] searchTagsAction 인증

- **질문**: 태그 autocomplete Action 인증?
- **옵션**: (A) public / (B) require super admin
- **선택**: (B) super admin 강제
- **이유**: 어드민 전용 기능 (사용자 사이트엔 TagsInput 없음). public 으로 두면 metadata 추가 노출 위험. requireSuperAdmin 일관 패턴.
- **영향**: actions.ts `searchTagsAction(prefix)` + service.ts `searchTags(prefix)` 신규.

## [T8] Client Component function props serialization 경고

- **질문**: Next.js 16 cacheComponents [71007] 경고 — `"use client"` 진입 파일의 onChange/onError 등 function props 가 직렬화 불가 (Server Action 명명 권장).
- **옵션**: (A) 무시 (warning, error 아님) / (B) `onChangeAction` 으로 rename / (C) 단일 파일 inline
- **선택**: (A) 무시
- **이유**: 호출자(NewsEditor) 도 Client Component → 실제 RSC boundary 안 넘음. Next.js 가 보수적으로 경고하는 false positive. (B) 는 React 컨벤션과 충돌. (C) 는 600줄 거대 파일. tsc 0 error · lint 0 error · 빌드 통과 검증 예정 (T10/T13).
- **영향**: TiptapEditor·CoverImageUploader·TagsInput 의 5개 onChange/onError props 가 warning. 기능 영향 0.

## [T10] drizzle-zod 제거 → 순수 Zod

- **질문**: schemas.ts 가 drizzle-zod `createInsertSchema(news)` 를 사용해 Client Component (NewsEditor) 가 import 시 build 실패.
  - 1차 원인: drizzle-zod@0.7.1 ↔ drizzle-orm@0.36.4 버전 불일치 — `isView` export 누락.
  - 2차 원인: drizzle-zod 가 server-only (drizzle-orm schema 의존) → Client bundle 끌어옴 = 안티패턴.
- **옵션**: (A) drizzle-orm 업그레이드 / (B) drizzle-zod 다운그레이드 / (C) drizzle-zod 제거 + 순수 Zod / (D) schemas.ts 를 server/client 분리
- **선택**: (C) drizzle-zod 제거
- **이유**: (A) 는 마이그레이션 SQL 호환성 변경 가능. (B) 는 deps lock 변경. (C) 가 가장 직접적 — 본문(body) 검증은 NewsBodyRenderer(T12) 가 별도로 책임지므로 schemas.ts 의 자유도 손실 없음. tags/title/categoryId 모두 plain Zod 로 표현 가능.
- **영향**: schemas.ts 가 drizzle-zod·newsInsertSchema 미사용. `body: z.unknown()` (renderer 검증).

## [T10] Cache Components — `await params/searchParams` Suspense 자식으로

- **질문**: Page Component 가 `async` + 최상단 `await props.params` → "Uncached data was accessed outside of <Suspense>" 빌드 에러.
- **옵션**: (A) Page sync + promise 를 Suspense 자식으로 전달 / (B) `export const dynamic = "force-dynamic"` (cacheComponents 와 비호환)
- **선택**: (A) Promise 전달
- **이유**: Next.js 16 Cache Components 가 권장하는 패턴. (B) 는 결정 #17 (force-dynamic 미사용) 위반.
- **영향**: `news/page.tsx` + `news/[id]/edit/page.tsx` 가 Page 는 sync, Suspense 자식 (`NewsListData`/`EditNewsData`) 가 promise 를 await.

## [T10] Layout AdminSidebar Suspense 격리

- **질문**: AdminSidebar (`usePathname()`) 이 layout 에서 직접 렌더 → dynamic route (news/[id]/edit) prerender 시 "Uncached data..." 에러.
- **옵션**: (A) usePathname 제거 / (B) AdminSidebar Suspense 래핑 / (C) layout 자체 dynamic 강제 (cacheComponents 비호환)
- **선택**: (B) Suspense 래핑
- **이유**: usePathname 은 active 메뉴 표시 필수. (C) 는 cacheComponents 비호환. (B) 가 가장 작은 변경 — prerender 시 sidebar skeleton, 런타임에 hydration.
- **영향**: `(panel)/layout.tsx` 가 `<Suspense fallback={<SidebarSkeleton/>}><AdminSidebar/></Suspense>`. 모든 어드민 페이지 ◐ Partial Prerender.

## [T12] 단위 테스트 프레임워크 — vitest 단독 (testing-library 미설치)

- **질문**: NewsBodyRenderer 안전 검증 테스트 5건을 어떻게 구성?
- **옵션**: (A) vitest + jsdom + @testing-library/react — JSX 렌더 검증 / (B) vitest 단독 + pure sanitize() 함수 분리 (sanitize.ts ↔ news-body-renderer.tsx 분리) / (C) Playwright e2e 만
- **선택**: (B) vitest 단독 + pure 함수 분리
- **이유**: (A) 는 jsdom 셋업 + testing-library 의존성 추가 + Image 컴포넌트 mock 필요 (next/image 가 DOM 의존). (C) 는 단위 보장 안 됨 (구조적 차단 vs 시각 차단). (B) 는 sanitize.ts 가 React/next 의존 0 → 순수 단위 테스트 + node 환경에서 즉시 실행. 빠르고 가볍다.
- **영향**: `src/features/news/render/sanitize.ts` (pure 함수) + `news-body-renderer.tsx` (React) + `sanitize.test.ts` (5 시나리오). vitest@4 + `vitest.config.ts` (path alias @ → src). `test` npm script 추가.

## 추가 분기점 (T13 진행 중 발생 시 본 파일에 누적)
