---
status: active
opened: 2026-06-05
branch: fix/figma-pixel-fidelity
slice_id: TASK-20260605-figma-fidelity-audit
spec_status: confirmed
brainstorming_done: 2026-06-05
---

# 공개 사이트 Figma 픽셀 정합 재감사 + 수정

## 문제

docs/plans·design.md 가 "Figma 정합 완료"라 기록했으나 **실제 렌더가 디자인과 달라** 사용자가 반복 재요청. 원칙: docs "verified" 불신, **live 렌더 vs Figma 원본 + familyfed-web 레퍼런스**로 전수 재검증.

## 결과 요약 (상세·근거: `docs/design/audit-2026-06-05.md`)

- **최대 원인 = stale dev 서버** (코드 아님): `_next/image`(MinIO) 400 차단 → 카드 이미지 미표시. `pnpm dev` 재시작으로 해소. next.config 는 이미 올바름.
- **코드 수정 5건** (전부 Figma/familyfed 근거):
  1. Hero dead 폰트 `'Gmarket Sans Medium'` 제거 → SUIT (`font-medium`)
  2. 소식 목록 그리드 `sm:2 md:3` → `min-[448px]:2 lg:3` (768=2열, 1024=3열 = Figma)
  3. 소식 목록 스켈레톤 BP 일치
  4. 상세 관련글 `sm:3` → `min-[448px]:2 md:3` (familyfed)
  5. 랜딩 ArticleGrid 마조네리 `md:columns-3` → `md:columns-2 lg:columns-3` + aspect 재배치
- **root cause**: 카드/마조네리 열 전환을 `sm:640`·`md:768` 에 걸어 Figma 아트보드(375/767/768/1025/1440)와 1단계 어긋남. 전역 BP 재정의는 회귀 위험이라 미채택 — 표면별 surgical 교정.

## 체크리스트

- [x] dev 서버 재시작·이미지 렌더 확인 (stale 서버 root cause 규명)
- [x] Hero 폰트 SUIT 통일 (Gmarket 참조 제거)
- [x] 소식 목록 그리드 열 정합 (768=2·1024=3) + 스켈레톤 일치
- [x] 소식 상세 관련글 그리드 정합 (familyfed)
- [x] 랜딩 ArticleGrid 마조네리 열 정합 (768=2·1024=3)
- [x] 게이트: tsc 0 · lint clean · test 31/31 · build ✓
- [x] 가로 스크롤 0: 320/375/768/1024/1440/1920 × 랜딩·목록·상세
- [x] 문서: audit-2026-06-05.md · design.md "정합 완료" 표기 정정
- [ ] PR 생성 + 사용자 리뷰

## 미수정 (근거 있음)

- KPI·Story 사이드컬럼 `wide:1440` (문서화된 의도, 정합 OK)
- 소식 Featured Hero `lg:grid-cols-2` (하위 BP Figma 모호 + familyfed 레퍼런스 부재)
- Partners `md:grid-cols-3 lg:flex` (정합 OK)

## 후속 (선택)

- 소식 Featured Hero 하위 BP 레이아웃 — Figma 추가 확인 시 재정합
- 픽셀 단위(spacing/font-size) get_design_context 정밀 대조 — 현재 시각·측정 정합까지 완료, gross diff 없음
