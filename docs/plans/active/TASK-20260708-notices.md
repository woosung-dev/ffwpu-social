---
status: active
opened: 2026-07-08
branch: feat/notices
slice_id: TASK-20260708-notices
spec_status: confirmed
brainstorming_done: 2026-07-08
related_adr:
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

- [ ] S0 Figma 4노드 추출(4-BP) + 미결 5건 확정(헤더 메뉴·PrevNext/공유줄·SubBanner·페이지 행수·하이라이트 토큰)
- [x] S1 스키마 `notices` + `notice_attachments` + 마이그레이션 0013
- [ ] S2 storage 첨부 확장 — `attachments.ts`(확장자+canonical MIME 정책, 20MB/5개) + `UploadScope {noticeId}` + 테스트
- [ ] S3 `src/features/notices/` 3-layer + 다운로드 route + schemas 테스트
- [ ] S4 어드민 — /admin/notices 3라우트 + NoticesTable + NoticeEditor + NoticeAttachmentUploader + 사이드바 신규 그룹
- [ ] S5 공개 목록 — page + notice-list-rows(읽음 하이라이트, hydration-safe) + visited-notices.ts + Pagination 공용 승격
- [ ] S6 공개 상세 — page(OG·404) + DownloadSection + visit-tracker
- [ ] S7 헤더(S0 분기) + seed 공지 8건 + ADR-041/042 + current.md(어드민 surface 7→8)
- [ ] S8 tsc·lint·test·build + 4-BP Figma 대조 + anti-slop

## 컨텍스트 노트 (결정 로그)

- 2026-07-08: 사용자 4결정 확정(위 표). Plan 에이전트 설계 검증 — `NewsEditor`가 temp-id 폐기·클라 UUID 선생성 방식이라 notices에 temp 전환 로직 불필요. 다운로드 Route Handler 근거 = fullstack.md §6.
- 2026-07-08: 첨부 저장은 update 시 tx 내 delete-all + re-insert(≤5행). S3 객체는 기존−신규 key 차집합만 best-effort 삭제. 첨부 key는 service에서 `notices/{id}/attachments/` startsWith 검증(위조 차단).
- 2026-07-08: hwp/hwpx MIME 브라우저 편차 → 확장자 1차 + accepted 광범위, presign Content-Type은 canonical 고정.
- 미저장 이탈 orphan 객체는 news와 동일하게 v1.1 cleanup job 대상 (docs/TODO.md).
