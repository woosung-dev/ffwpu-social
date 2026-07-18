---
status: active
opened: 2026-07-18
branch: feat/notice-share
slice_id: TASK-20260718-notice-share
spec_status: confirmed
brainstorming_done: 2026-07-18
related_adr:
---

# 공지 상세 공유 버튼

국장님 요청 — 소식 상세의 공유 버튼 2개(네이티브 공유 + 링크 복사)를 공지 상세에도 동일하게 배치.

## 범위 (파일 5)

- `src/client/components/ShareRow.tsx` — 기존 `news/[id]/share-row.tsx` 공용화 이동 (`newsId?: string` 옵셔널화만, 로직·스타일 무변경)
- `src/app/(public)/news/[id]/page.tsx` — import 경로 교체 (기존 share-row.tsx 삭제)
- `src/app/(public)/notices/[id]/page.tsx` — 공유 버튼 중앙 배치(`mt-[60px]`, 공지 리듬 60 정합) + 첨부 다운로드를 공유 **아래**로 이동(사용자 피드백 2026-07-18) + generateMetadata `twitter` 카드 보강(news 미러)
- `src/features/analytics/db.ts` — `getNewsAnalyticsSummary` totals 에 `isNotNull(newsId)` 필터 (공지 공유가 소식 분석 총계 오염 방지)

## 설계 결정

- **analytics 스키마 무변경**: `analytics_events.news_id` 가 nullable + `share_click` 타입·`path` 컬럼 기존재 → 공지 공유는 `news_id NULL + path=/notices/<id>` 로 기록. v1.1 공지 대시보드 확장 시 path 로 집계 가능.
- ShareRow 위치는 `src/client/components/` — 공개 전용 UI 를 news/notices 가 공유 (Pagination 선례). `features/share/` 신설은 파일 1개 도메인이라 기각(YAGNI).

## 검증 결과 (2026-07-18)

- `pnpm tsc --noEmit` / `pnpm lint` / `pnpm build` / `pnpm test`(115) 전부 PASS
- dev(3100) Playwright: 공지 상세 링크 복사 → "링크가 복사되었습니다" + DB `share_click / news_id NULL / path=/notices/<id>` 행 확인
- 소식 상세 회귀: 공유·복사·하트 정상, `news_id` 포함 기록 유지
- 공지 `<meta name="twitter:card" content="summary_large_image">` 렌더 확인
