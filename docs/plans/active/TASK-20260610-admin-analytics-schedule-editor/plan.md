---
status: active
opened: 2026-06-10
branch: feat/news-heart-bottom-fidelity
slice_id: TASK-20260610-admin-analytics-schedule-editor
spec_status: confirmed
brainstorming_done: 2026-06-10
---

# 관리자 분석·예약 발행·에디터 숫자 크기

## 계획

관리자 피드백 3건을 기존 구조 위에 최소 변경으로 구현한다.

- 방문자 분석은 로그인 사용자 식별이 아니라 익명 브라우저 세션(`sg_anon_sid`) 기준 이벤트로 남긴다.
- 예약 발행은 별도 cron 없이 `publishedAt <= now()` 공개 조건으로 플랫폼 독립성을 확보한다.
- Tiptap 글자 크기는 숫자 입력을 허용하되 `12px~40px` 범위와 sanitize 정합을 유지한다.

## 검증 기준

- 공개 소식 목록·상세·히어로·랜딩·관련 글·sitemap이 미래 `publishedAt` 글을 노출하지 않는다.
- 어드민 목록과 대시보드에서 예약 상태를 발행/임시와 구분한다.
- 상세 조회와 좋아요 이벤트가 분석 테이블에 기록되고, 원본 IP는 저장하지 않는다.
- Tiptap 글자 크기 직접 입력은 범위 밖 값과 비 px 값을 저장하지 않는다.
