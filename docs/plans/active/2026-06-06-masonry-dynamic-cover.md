---
status: active
opened: 2026-06-06
branch: feat/masonry-dynamic-cover
slice_id: TASK-20260606-masonry-dynamic-cover
spec_status: confirmed
brainstorming_done: 2026-06-06
related_adr:
---

# 콘텐츠 주도 마조네리 — 랜딩 ArticleGrid 업로드 이미지 비율로 카드 높이

> Pinterest 벤치마킹. 운영자가 올린 커버 이미지의 **실제 종횡비**로 카드 높이가 정해지는 마조네리.
> **적용 범위: 랜딩 `ArticleGridSection` 단독.** `/news` 목록은 범위 밖 — 균일 3×3 그리드 유지.

## 0. 범위 정정 이력 (중요)

- 2026-06-06 최초: "랜딩 + /news 둘 다" 로 결정 → **정정**: `/news` 는 **균일 카드** 유지가 맞음.
- 확인 결과 `/news` 렌더링(ArticleCard·NewsListClient·`/news` 페이지)은 **변경 0건** — 애초에 손대지 않아 이미 균일 상태.
- 따라서 코드 리셋 불필요. 이 계획서의 범위만 **랜딩 전용**으로 축소 (사용자 확정).

## 1. 문제 (현재 상태)

- **랜딩 ArticleGrid** (`src/client/sections/ArticleGridSection.tsx`): 높이를 슬롯 index별 `CARD_ASPECTS` 로 **하드코딩**(Figma 시안값)했었음. 이미지가 아니라 "몇 번째 슬롯"이 높이를 정함 → `object-cover` 크롭. "가짜 마조네리". 세로 사진을 올리면 위아래가 잘려 톤앤매너(`domain.md §7` "실제 현장 사진, 정제 안 돼도 OK")와 충돌. **→ 이 한 영역만 콘텐츠 주도로 전환.**
- **/news 목록**: `ArticleCard` 균일 3×3 그리드. **의도된 균일 — 유지(범위 밖).** 소식 피드는 카테고리·익명 하트·날짜가 카드 하단에 정렬돼야 해 균일 카드가 적합.

## 2. 핵심 결정 (확정)

| 항목 | 결정 | 이유 |
|---|---|---|
| **치수 추출** | 클라이언트 `naturalWidth/Height` (CoverImageUploader) | 업로드가 presigned POST 로 **브라우저→S3 직접 전송** — 서버가 바이트를 못 봄. sharp/image-size 서버 추출 구조상 불가. 단일 운영자라 클라 보고값 신뢰 OK. **의존성 0.** |
| **레이아웃 기법** | 서버 분배 N-컬럼 round-robin | CSS `columns` 는 컬럼 우선이라 순서 깨짐. round-robin(`item i → col i%N`)은 **읽기 순서(행 우선) 보존 + CLS 0 + SSR 친화 + 클라 JS 0.** 네이티브 `masonry` 는 2026 미지원. |
| **카드 박스** | `style={{ aspectRatio: w/h }}` + `<Image fill object-cover>` | 박스 비율 = 이미지 비율 → **크롭 0**. |
| **플레이스홀더** | `bg-brand-darkest`(다크 카드) | 로드 중 어두운 카드 → 이미지. 라이트 플래시 회피. 블러는 후속. |
| **치수 NULL 폴백** | 4/5 (portrait) | 백필 전 레거시 글도 안 깨짐 — 균일 4/5 로 graceful. |

## 3. 스키마 변경

`src/db/schema/news.ts` — **additive · nullable → 데이터 손실 0, 안전.**

```ts
coverImageWidth: integer("cover_image_width"),
coverImageHeight: integer("cover_image_height"),
```

- 마이그레이션 `0006` 생성·적용 완료. 배포 시 `migrate` 필요.
- 블러용 `coverImageBlur: text(...)` 는 후속(선택).
- 치수는 어드민 글 작성·수정 시 모든 커버에 저장됨(공용 에디터) — 랜딩이 이를 소비, /news 는 사용 안 함(무해).

## 4. 미결 마이크로 결정

1. **블러 플레이스홀더** — 후속(선택). canvas 다운스케일 base64, 복잡도↑.
2. **랜딩 폴백 비율** — 치수 NULL 글은 `4/5`. (확정)

> 구 미결정 항목 중 `/news` 페이지네이션·컬럼수·레거시 폴백은 **범위 제외로 삭제.**

## 5. 단계 (Phases) · 체크리스트

### Phase 1 — 기반 (스키마 + 치수 캡처 + 백필) ✅ 완료 (커밋 dcef816)
- [x] `news` 스키마에 `coverImageWidth`/`coverImageHeight` 추가 + 마이그레이션 `0006` (적용 완료)
- [x] `newsInputSchema` (schemas.ts) 에 `coverImageWidth`/`coverImageHeight` (int positive nullable) 추가
- [x] `CoverImageUploader` — `createImageBitmap(file)` 로 w/h 추출, `onChange(url, dims)` 로 전달
- [x] `NewsEditor` — RHF `setValue` 로 w/h 보관 + payload 전달 / edit 페이지 prefill (getAdminNewsById)
- [x] `createNews`/`updateNews` (service) — w/h 영속화
- [x] 시드 백필 (`seed.ts`) — PNG/JPEG 헤더 파서로 로컬 파일 dims 읽어 채움 (커버 11종)
- [x] 검증: `pnpm tsc --noEmit` ✅ + `pnpm lint` ✅ + 마이그레이션 diff ✅

### Phase 2 — 랜딩 ArticleGrid 마조네리 ✅ 완료 (커밋 2b981b4)
- [x] `MasonryGrid` (`src/client/components/media/`) — round-robin 분배 Server Component, BP tier 토글
- [x] `MediaCard` — 고정 `aspect-[278/425]` 제거, 이미지 w/h 로 `aspectRatio` (크롭 0), NULL 폴백 4/5
- [x] `ArticleGridSection` — `CARD_ASPECTS`/`FALLBACK_IMAGES` 제거, `MasonryGrid` 사용 (모바일 1 / md+ 3열)
- [x] `listFeaturedGrid` SELECT 에 w/h 추가
- [x] 검증: `tsc` ✅ + `lint` ✅ + `build` ✅
- [x] 🔴 균일하게 보이던 근본원인 = DB 치수 NULL. **비파괴 백필**(`db:backfill-cover-dims`, 재시드 아님 — 큐레이션 보존)로 커버 9장 치수 채움 → 가변 높이 실제 확인
- [x] 시각 검증: dev(:3000) 1440(3열 가변)·375(1열 가변) 스크린샷 OK, CLS 0(aspectRatio 선점)

### Phase 2.5 — Pinterest 마감 (백필 + shortest-column) ✅ 완료
- [x] `readImageSize` → `features/storage/image-size.ts` 공유 유틸 추출 (seed + 백필 공용) — 커밋 998814a
- [x] 비파괴 백필 스크립트 `db/backfill-cover-dims.ts` (S3 GetObject→파싱→UPDATE, idempotent) — 커밋 3eccf23
- [x] `MasonryGrid` round-robin → **shortest-column bin-packing**(`getWeight` prop, Pinterest 컬럼 균형) — 커밋 d4fd6e5

### ~~Phase 3 — /news 마조네리~~ ❌ 범위 제외 (2026-06-06 확정)
- `/news` 목록은 **균일 3×3 그리드 유지.** 코드 변경 없음. 향후에도 별도 요청 없으면 미적용.

### Phase 4 — 마무리
- [ ] 시각 검증(위 Phase 2 🔴) 후 스크린샷
- [ ] anti-slop 체크리스트 (§3 디자인) 통과
- [ ] ADR 기록 (랜딩 마조네리 레이아웃 + 클라 치수 캡처 결정)
- [ ] docs/design.md 갱신 + 본 plan merge 시 삭제

## 6. 리스크

- **클라 치수 누락** (구형 브라우저·createImageBitmap 실패) → `readImageDimensions` try/catch 폴백, 업로드는 진행.
- **백필 누락 글** → NULL 폴백 비율(4/5)로 graceful.
- **마이그레이션** → additive nullable 이라 무손실. 배포 시 `migrate` 필요.
- **숨김 tier 중복 렌더** → 랜딩은 6 항목·2 tier 라 미미. `display:none` 이라 lazy 이미지 미로드.
