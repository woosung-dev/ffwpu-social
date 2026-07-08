---
status: active
opened: 2026-07-08
branch: feat/notices
slice_id: TASK-20260708-notices
spec_status: confirmed
brainstorming_done: 2026-07-08
related_adr: ADR-041, ADR-042
---

# 공지사항(notices) — 어드민 CRUD + 공개 목록/상세

> 승인된 plan 원본: `~/.claude/plans/polymorphic-mixing-feather.md` (머신 로컬).
> 공개 측 SSoT = Figma 4노드: 목록 페이지 `1103-7882` · 상세 페이지 `1104-10813` · 목록 행 컴포넌트 `1104-10001` · download section `1104-11167`.

## 확정 결정

| 결정 | 채택안 |
|---|---|
| 데이터 모델 | 별도 `notices` + `notice_attachments` 테이블, `src/features/notices/` 신규 도메인 (ADR-042 예정) |
| 첨부 방식 | 첨부 테이블 + 다중 첨부(최대 5개) + presigned PUT 재사용 + 삭제 시 cleanup |
| 허용 형식/용량 | PDF·docx·xlsx·pptx·hwp/hwpx·zip + jpg/png/webp, 개당 20MB — ADR-017을 공지 첨부에 한해 supersede (ADR-041 예정) |
| 공개 진입 경로 | Figma 목록 페이지 헤더 확인 후 확정 (S0) |
| 다운로드 | presigned GET 302 Route Handler (`/api/notices/attachments/[attachmentId]`) — 한글 원본 파일명 RFC 5987 |
| 읽음 표시 | localStorage `sg_visited_notices` (상한 200) — 상세 mount 시 마킹, 목록 행 하이라이트(호버와 동일 토큰) |
| 공개 목록 | 순수 Server Component + `?page=` (RQ 미사용 — 검색·정렬·탭 없음). No. = total − (page−1)·limit − index |

## 체크리스트

- [ ] S0 Figma 4노드 추출(4-BP) + 미결 확정 — 🔴 **사용자 Figma OAuth 승인 대기** (인증 URL 발급됨). 폴백: 스크린샷 기반 구현 완료, 인증 후 픽셀 대조·헤더 분기만 잔여
- [x] S1 스키마 `notices` + `notice_attachments` + 마이그레이션 0013
- [x] S2 storage 첨부 확장 — `attachments.ts`(확장자+canonical MIME 정책, 20MB/5개) + `UploadScope {noticeId}` + 테스트
- [x] S3 `src/features/notices/` 3-layer + 다운로드 route + schemas 테스트
- [x] S4 어드민 — /admin/notices 3라우트 + NoticesTable + NoticeEditor + NoticeAttachmentUploader + 사이드바 신규 그룹 (E2E 검증 완료)
- [x] S5 공개 목록 — page + notice-list-rows(읽음 하이라이트, hydration-safe) + visited-notices.ts + Pagination 공용 승격
- [x] S6 공개 상세 — page(OG·404) + DownloadSection + visit-tracker
- [x] S7 seed 공지 8건(첨부 3, 고정 UUID) + ADR-041/042 + current.md §4-4 + 어드민 surface 7→8 — **헤더 진입만 Figma 대기**
- [ ] S8 tsc·lint·test·build + 4-BP Figma 대조 + anti-slop

## 컨텍스트 노트 (결정 로그)

- 2026-07-08: 사용자 4결정 확정(위 표). Plan 에이전트 설계 검증 — `NewsEditor`가 temp-id 폐기·클라 UUID 선생성 방식이라 notices에 temp 전환 로직 불필요. 다운로드 Route Handler 근거 = fullstack.md §6.
- 2026-07-08: 첨부 저장은 update 시 tx 내 delete-all + re-insert(≤5행). S3 객체는 기존−신규 key 차집합만 best-effort 삭제. 첨부 key는 service에서 `notices/{id}/attachments/` startsWith 검증(위조 차단).
- 2026-07-08: hwp/hwpx MIME 브라우저 편차 → 확장자 1차 + accepted 광범위, presign Content-Type은 canonical 고정.
- 미저장 이탈 orphan 객체는 news와 동일하게 v1.1 cleanup job 대상 (docs/TODO.md).
- 2026-07-08 (E2E 발견 버그): drizzle 은 **조인 없는 select** 의 sql`` 보간 컬럼을 비정규화("id")해 상관 서브쿼리가 내부 테이블로 오결합 → 카운트 항상 0. raw 정규화 이름(`notice_attachments.notice_id = notices.id`)으로 수정. news heartCount 는 categories 조인 덕에 정규화되어 무사했음 — **동일 패턴 신규 작성 시 주의**.
- 2026-07-08: 어드민 E2E 전 구간 PASS — 작성→pdf/hwp 첨부(hwp canonical MIME 저장)→exe 거부→발행→수정(제거분 MinIO diff 삭제)→본문 이미지(notices/{id}/ prefix)→다운로드 302(한글 파일명)·미발행 404. 공개 목록·상세·읽음 하이라이트(localStorage→bg #F9F4FF+제목 brand-primary) PASS.
- 잔여: ① Figma 4노드 픽셀 대조(+헤더 케이스 A/B 확정) ② prod 배포 시 `pnpm db:migrate`(0013) 필요.
