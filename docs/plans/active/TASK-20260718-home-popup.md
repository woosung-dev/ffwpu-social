---
status: active
opened: 2026-07-18
branch: feat/home-popup
slice_id: TASK-20260718-home-popup
spec_status: confirmed
brainstorming_done: 2026-07-18
related_adr: ADR-047
---

# 홈 팝업 v1 — 이미지 업로드형 + 어드민 관리

국장님 요청 — POOQ/멜론 스타일 홈 공지 팝업. 어드민이 제작한 이미지 1장을 업로드하고, 클릭 시 지정 페이지 이동, 닫기 + "일주일간 보지 않기".

## 사용자 확정 결정

- 노출 범위 **랜딩(/)만** · 동시 노출 **1개**(활성 중 시작일 최근) · 보지 않기 **7일**(localStorage)
- 디자인 위임 기본값: "그냥 닫기"=세션 억제(sessionStorage) · 최대 폭 480px · 하단 바 좌 "일주일간 보지 않기"/우 "닫기"
- **링크 열기 방식 어드민 선택** (추가 요청 2026-07-18): `link_target` = 현재 탭 이동 / 새 탭 / **작은 새 창(기본, 480×≤800)**. iframe 모달은 X-Frame-Options 리스크로 v1 제외.

## 범위

- **스키마** `src/db/schema/popups.ts` + 마이그레이션 **0015** (CREATE TABLE 단독) — title·imageUrl·imageWidth/Height(nullable)·linkUrl(nullable)·startsAt·endsAt(nullable=무기한)·isActive·감사 컬럼 + `popups_window_idx`
- **도메인** `src/features/popups/{schemas,db,service,actions,index}.ts` — notices 미러 3-layer. presign scope `{popupId}`(storage UploadScope 확장), 삭제 시 `popups/{id}/` prefix 정리, imageUrl 화이트리스트 검증, `revalidatePath("/", "layout")`
- **어드민** `/admin/popups`(목록·new·edit) + `PopupTable`(뱃지 4종·활성 Switch·삭제 confirm) + `PopupEditor`(RHF title/linkUrl + useState 이미지·기간·활성, CoverImageUploader scope 분기) + 사이드바 "팝업" 그룹
- **공개** `src/client/lib/popup-dismiss.ts`(`sg_popup_dismissed` 7일 + `sg_popup_closed` 세션) + `features/popups/components/{popup-gate,popup-dialog}.tsx`(shadcn Dialog) + 랜딩 `<Suspense><PopupGate /></Suspense>`

## 구현 중 잡은 결함 (evaluator)

1. **Zod v4 omit-after-refine 런타임 throw** — `popupInputSchema.omit()` 이 모듈 로드 시 크래시(tsc 미검출). refine 전 base 분리 → `popupFormSchema = base.pick(...)` + 회귀 테스트. LESSON-021.
2. **Cache Components 프리렌더 실패** — 어드민 라우트 3개가 page 레벨 await → build 실패. notices 패턴(페이지 동기 + Suspense 자식 격리)으로 수정. LESSON-022.

## 검증 (2026-07-18)

- `pnpm tsc --noEmit`·`pnpm lint`·`pnpm build`·`pnpm vitest run src/features/popups`(6) PASS. 0015 로컬 migrate 적용.
- 런타임 시나리오(§B4)는 dev(3100) Playwright 로 수행 — 어드민 CRUD·랜딩 노출/세션닫기/7일/기간·4-BP.

## 후속 (v1.1 후보)

- 다중 팝업 캐러셀(도트) · 공지 연동 팝업 자동 생성 · CoverImageUploader 액션 주입 리팩터
