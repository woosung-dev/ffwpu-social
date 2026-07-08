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

- [x] S0 Figma 4노드 추출 + 픽셀 정합 반영 (2026-07-08 OAuth 완료) — ground truth `docs/design/figma-export/notices/` 4장. 확정: **헤더 케이스 A**(공지사항 5번째 메뉴+경로 매칭 active) · 상세 PrevNext 있음/공유·하트 없음 · SubBanner 재사용 · limit 10 유지 · 목록 테이블 900px 중앙 · 지브라(#f9f9fc)/읽음(#fcfaff·#f9f4ff+핀 #E1C8F9) · 다운로드 섹션 본문 위(#f9f9f9 h41) · 타이틀 중앙(News eyebrow #b35feb 18 + 32 SemiBold) · 하단 그라데이션+ScrollTop. Figma 1440 단일 프레임 — 하위 BP 는 비례 [추론]
- [x] S1 스키마 `notices` + `notice_attachments` + 마이그레이션 0013
- [x] S2 storage 첨부 확장 — `attachments.ts`(확장자+canonical MIME 정책, 20MB/5개) + `UploadScope {noticeId}` + 테스트
- [x] S3 `src/features/notices/` 3-layer + 다운로드 route + schemas 테스트
- [x] S4 어드민 — /admin/notices 3라우트 + NoticesTable + NoticeEditor + NoticeAttachmentUploader + 사이드바 신규 그룹 (E2E 검증 완료)
- [x] S5 공개 목록 — page + notice-list-rows(읽음 하이라이트, hydration-safe) + visited-notices.ts + Pagination 공용 승격
- [x] S6 공개 상세 — page(OG·404) + DownloadSection + visit-tracker
- [x] S7 seed 공지 8건(첨부 3, 고정 UUID) + ADR-041/042 + current.md §4-4 + 어드민 surface 7→8 + **헤더 케이스 A 반영**(PublicHeader 5메뉴·경로 매칭, /news·랜딩 회귀 확인, 768 5핀 수용·375 드롭다운 정상)
- [x] S8 tsc0·lint0·test98·build✓ + **4-BP Figma 대조 완료**(디자이너 구간별 프레임 10 실측, Playwright ±2px) + anti-slop — 상세 `docs/design/notices-fidelity-2026-07-08.md`

## 컨텍스트 노트 (결정 로그)

- 2026-07-08: 사용자 4결정 확정(위 표). Plan 에이전트 설계 검증 — `NewsEditor`가 temp-id 폐기·클라 UUID 선생성 방식이라 notices에 temp 전환 로직 불필요. 다운로드 Route Handler 근거 = fullstack.md §6.
- 2026-07-08: 첨부 저장은 update 시 tx 내 delete-all + re-insert(≤5행). S3 객체는 기존−신규 key 차집합만 best-effort 삭제. 첨부 key는 service에서 `notices/{id}/attachments/` startsWith 검증(위조 차단).
- 2026-07-08: hwp/hwpx MIME 브라우저 편차 → 확장자 1차 + accepted 광범위, presign Content-Type은 canonical 고정.
- 미저장 이탈 orphan 객체는 news와 동일하게 v1.1 cleanup job 대상 (docs/TODO.md).
- 2026-07-08 (E2E 발견 버그): drizzle 은 **조인 없는 select** 의 sql`` 보간 컬럼을 비정규화("id")해 상관 서브쿼리가 내부 테이블로 오결합 → 카운트 항상 0. raw 정규화 이름(`notice_attachments.notice_id = notices.id`)으로 수정. news heartCount 는 categories 조인 덕에 정규화되어 무사했음 — **동일 패턴 신규 작성 시 주의**.
- 2026-07-08: 어드민 E2E 전 구간 PASS — 작성→pdf/hwp 첨부(hwp canonical MIME 저장)→exe 거부→발행→수정(제거분 MinIO diff 삭제)→본문 이미지(notices/{id}/ prefix)→다운로드 302(한글 파일명)·미발행 404. 공개 목록·상세·읽음 하이라이트(localStorage→bg #F9F4FF+제목 brand-primary) PASS.
- 2026-07-08 (S8 발견): dev 에서 상세 미방문 공지가 읽음 처리되는 팬텀 기록 관측(라우터 프리페치/세그먼트 프리렌더 계열 추정 — 격리 재현은 안 됨). NoticeVisitTracker 에 `location.pathname === /notices/{id}` 가드 추가 — 실제 상세 URL 에 있을 때만 마킹. 가드 후 방치 8초·hover 프리페치에도 재발 0, 실방문 1건만 기록 확인.
- 2026-07-08 (S0 완료): Figma 대조로 v1 구조 구현에서 갱신된 것 — 타이틀 좌→중앙(News eyebrow), 다운로드 섹션 본문 아래→위(rows 스타일), 목록에 지브라·핀 마커·정확 색상(#242424/#959ba9/#2d2d2d/#a34df3/#c8a3e6/#d6d0d8), 테이블 900px 중앙, 그라데이션+ScrollTop 추가, 헤더 공지사항 메뉴. eyebrow "News" 카피·Figma 헤더 라벨 불일치·hover 핀 정책은 TODO escalation 3건.
- 2026-07-08 (후속·리뷰 피드백): 디자이너가 **구간별 반응형 프레임 10 추가**(목록 `1103-7882`/`1149-7972`/`1149-8742`/`1149-9786`/`1149-9301` · 상세 `1104-10813`/`1149-11851`/`1149-11987`/`1149-12667`/`1149-12395`). S0 의 "1440 단일 + 하위 BP 비례 [추론]" 을 실측으로 교체(S8 종료). 핵심: **모바일(375) 목록 No·Date 열 제거(Title 단일)** · 누락 `lg:`(1024) 스텝 보강(헤더 53/행 62·70/텍스트 18) · md 정정(44/56·62/16) · 타이포 고정(목록 eyebrow18·h1 32 전 BP) · 상세 h1 28→32(md) · 다운로드 행 16/15. 헤더·푸터·배너는 사용자 지시로 미참고.
- 2026-07-08 (후속·리뷰 피드백): **상세 다운로드 섹션 본문 위 → 아래로 이동**(사용자 피드백). 새 상세 프레임(1104-10813 등)도 `타이틀→본문→다운로드→구분선→이전/다음` 으로 확정돼 일치. 본문→다운로드 gap 60, 다운로드→구분선 70.
- 잔여: prod 배포 시 `pnpm db:migrate`(0013) 필요.
