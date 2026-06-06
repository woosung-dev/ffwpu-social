---
status: active
opened: 2026-06-06
branch: feat/masonry-dynamic-cover
slice_id: TASK-20260606-masonry-dynamic-cover
spec_status: confirmed
brainstorming_done: 2026-06-06
related_adr:
---

# 콘텐츠 주도 마조네리 — 업로드 이미지 비율로 카드 높이 결정

> Pinterest 벤치마킹. 운영자가 올린 커버 이미지의 **실제 종횡비**로 카드 높이가 정해지는 마조네리.
> 적용 범위: 랜딩 `ArticleGridSection` + `/news` 목록 (사용자 "둘 다" 결정).

## 1. 문제 (현재 상태)

- **랜딩 ArticleGrid** (`src/client/sections/ArticleGridSection.tsx`): 높이를 `CARD_ASPECTS[idx]` 로 **슬롯 index별 하드코딩** (Figma 시안값). 이미지가 아니라 "몇 번째 슬롯"이 높이를 정함 → `object-cover` 크롭. "가짜 마조네리".
- **/news 목록** (`ArticleCard` `SIZE_CONFIG`): 고정 가로형 aspect(`313/170` 등) **균일 3×3 그리드**. 마조네리 아님.
- 두 경우 모두 세로 단체사진을 올리면 위아래가 잘림 → 톤앤매너(`domain.md §7` "실제 현장 사진, 정제 안 돼도 OK")와 충돌.

## 2. 핵심 결정 (확정)

| 항목 | 결정 | 이유 |
|---|---|---|
| **치수 추출** | 클라이언트 `naturalWidth/Height` (CoverImageUploader) | 업로드가 presigned POST 로 **브라우저→S3 직접 전송** — 서버가 바이트를 못 봄. sharp/image-size 서버 추출 구조상 불가. 단일 운영자라 클라 보고값 신뢰 OK. **의존성 0.** |
| **레이아웃 기법** | 서버 분배 N-컬럼 round-robin | CSS `columns` 는 컬럼 우선이라 최신순 깨짐. round-robin(`item i → col i%N`)은 **읽기 순서(행 우선) 보존 + CLS 0 + SSR 친화 + 클라 JS 0.** 네이티브 `masonry` 는 2026 미지원. |
| **카드 박스** | `style={{ aspectRatio: w/h }}` + `<Image fill object-cover>` | 박스 비율 = 이미지 비율 → **크롭 0**. |
| **플레이스홀더** | phase 1 = `bg-surface-tint-soft` 단색 | Pinterest 지배색 트릭의 경량판. 블러는 후속. |
| **치수 NULL 폴백** | 레거시 글은 기존 비율 유지 | 점진 도입 — 백필 전 글도 안 깨짐. |

## 3. 스키마 변경

`src/db/schema/news.ts` — **additive · nullable → 데이터 손실 0, 안전.**

```ts
coverImageWidth: integer("cover_image_width"),
coverImageHeight: integer("cover_image_height"),
```

- 마이그레이션: `pnpm drizzle-kit generate` → 사람 검토 → 커밋. 배포 시 `migrate`.
- 블러용 `coverImageBlur: text(...)` 는 후속(Phase 5, 선택).

## 4. 미결 마이크로 결정 (구현 전 확인)

1. **블러 플레이스홀더** — phase 1 포함? → **권장: 후속.** (canvas 다운스케일 base64, 복잡도↑)
2. **/news 페이지네이션** — 마조네리 + 기존 9개 페이지네이션 유지(마지막 행 ragged 허용)? → **권장: 유지.**
3. **컬럼 수 (4-BP)** — 랜딩 right 영역 1/md:3 유지. /news 375→1·768→2·1024→3·1440→3 → **권장 그대로(기존 3×3 연속성).**
4. **레거시 폴백 비율** — /news 는 기존 가로형(`313/170`) 유지가 덜 튐 / 랜딩은 `4/5` portrait. → **확인 필요.**

## 5. 단계 (Phases) · 체크리스트

### Phase 1 — 기반 (스키마 + 치수 캡처 + 백필) ⟵ 첫 슬라이스
- [ ] `news` 스키마에 `coverImageWidth`/`coverImageHeight` 추가 + 마이그레이션 생성
- [ ] `newsInputSchema` (schemas.ts) 에 `coverImageWidth`/`coverImageHeight` (int positive nullable) 추가
- [ ] `CoverImageUploader` — 업로드 직전 `createImageBitmap(file)` 로 w/h 추출, `onChange(url, { width, height })` 로 전달
- [ ] `NewsEditor` — w/h 상태 보관 + 저장 시 action 에 전달
- [ ] `createNews`/`updateNews` (service/db) — w/h 영속화
- [ ] 시드 11장 백필 (`seed.ts` 또는 1회성 스크립트) — 로컬 파일 dims 읽어 채움
- [ ] 검증: `pnpm tsc --noEmit` + `pnpm lint` + `drizzle-kit generate` diff 검토

### Phase 2 — 공유 마조네리 컴포넌트 + 랜딩
- [ ] `src/client/components/media/MasonryGrid.tsx` — items + 컬럼수(BP) → round-robin 분배 렌더 (Server Component)
- [ ] `MediaCard` — 고정 `aspect-[278/425]` 제거, `aspectRatio` prop(이미지 w/h) 주입
- [ ] `ArticleGridSection` — `CARD_ASPECTS` 제거, `MasonryGrid` 사용. listFeaturedGrid 가 w/h 내려주도록 SELECT 확장
- [ ] 검증: 4-BP 시각(375/768/1024/1440) + CLS 0 확인

### Phase 3 — /news 마조네리
- [ ] `listNews` (db.ts) SELECT 에 w/h 추가, `api.ts` 응답 타입 확장
- [ ] `NewsListClient` — 3×3 그리드 → `MasonryGrid` 교체 (RQ useSuspenseQuery 데이터에 w/h 포함)
- [ ] `ArticleCard` — masonry variant (세로형, `aspectRatio` 주입) 또는 신규 카드
- [ ] React Hooks 안전 점검 (LESSON-004) — RQ data 를 effect dep 로 쓰지 말 것
- [ ] 검증: 탭 전환·페이지네이션·CLS

### Phase 4 — 마무리
- [ ] `pnpm build` 통과
- [ ] anti-slop 체크리스트 (§3 디자인) 통과
- [ ] 관련 ADR 기록 (마조네리 레이아웃 결정 + 클라 치수 캡처)
- [ ] docs/design.md · 본 plan 갱신

## 6. 리스크

- **클라 치수 누락** (구형 브라우저·createImageBitmap 실패) → try/catch 폴백 비율, 업로드는 진행.
- **RQ 응답 형태 변경** (/news) → 캐시 키 동일 유지, 필드만 추가 (하위호환).
- **백필 누락 글** → NULL 폴백 비율로 graceful.
- **마이그레이션** → additive nullable 이라 무손실. 배포 시 `migrate` 필요(현재 active 브랜치들의 "스키마 변경 0" 기조와 별개 브랜치).
