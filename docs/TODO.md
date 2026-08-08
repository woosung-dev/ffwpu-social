<!-- 현재 세션 미해결 항목 — global.md §2 형식 (Completed / Blocked / Questions / Next Actions) -->

# docs/TODO.md

> **목적:** AI ↔ 사용자 매개. 차단 상태가 아닌 질문·확인 항목은 여기에 누적 후 자연스러운 타이밍에 일괄 전달.

## 진행 중 (2026-06-03)

- **랜딩 실데이터화 + 반응형 4-BP 정합** — `docs/plans/active/2026-06-03-landing-data-responsive.md` (branch `feat/client-foundation`). WS1 시드 실데이터화(사진 11장→MinIO) + WS2 슬롯 썸네일 + WS3 ArticleGrid 호이스트 + WS4 RQ /news 목록 캐시(useSuspenseQuery 안정 패턴) + WS5 7면 4-BP 정합. **스키마 변경 없음.**
  - 🔴 **사진 11장 수령 대기** — `src/db/seed-assets/`에 넣으면 시드가 자동 업로드 (아래 2026-05-30 조달 항목과 동일 건). KPI 보라 카드 1장만 `public/images/` 덮어쓰기.
  - Gmarket Sans Medium: **라이선스 확인 필요** (사용자 결정 2026-06-03) — 확보 시 next/font/local 로드, 그 전까지 SUIT 폴백 + clamp 재튜닝.

- **어드민 v1.0 ship-전 하드닝** — `docs/plans/active/2026-06-01-admin-ship-hardening.md` (branch `feat/admin-ship-hardening`). HIGH 6 + 접근성 + 모바일 카드뷰 + 아키텍처 옵션1. 다단 검토 GO-WITH-FIXES + codex v2 교정. **스키마 변경 없음.**
  - **상태: 코드 완료** — A1~A8·B1~B4·C1·D1·D2 구현. 자동 게이트 통과(src tsc 0·Next compile 성공·lint·단위테스트 31). ADR-030/031/032 기록. 커밋·수동 검증 대기.
  - 잔여 수동 검증(`pnpm dev`, docker 가동 중): A1 5케이스(draft/타카테고리/발행해제/카테고리변경/null해제)·A2 동시저장·A3 계정삭제 후 세션 무효화·C1 375px 카드뷰.
  - 아래 §"Sprint 2 후속"의 *에러박스 대비 AA*는 본 작업 A4(색대비 토큰 ink-date #959ba9→#6f7682)에서 함께 점검, *NewsTable 윈도잉*은 v1.1 유지(rank22 — flex-wrap 경미 완화만 적용).
  - **[해결] R7** — story 슬롯(어드민이 고르는 글 2개)이 공개 StorySection에 미연결이던 버그 수정. 사용자 확인 "변경하면 반영돼야 함" → StorySection이 지정 글 대표 이미지 노출(클릭 시 소식 이동), 미지정 시 기본 사진 폴백. `StorySectionWithData`가 `listStorySlots` 연결. 4-2 이제 완전 FULLY.

## 배포 전 필수 (🔴 차단성)

- [x] **DB 마이그레이션 0007 적용 (완료)** — `analytics_events` 테이블. PR #45 머지 시 GHA `Migrate (production)` 가 적용. 이후 모든 main push 의 migrate 실행이 success (drizzle migrate 는 대기분을 전부 적용) — 2026-07-16 확인.
- [x] **DB 마이그레이션 0013·0014 적용 (완료)** — 공지사항 `notices` + `notice_attachments` + `pinned_rank`. PR #82 머지(2026-07-08T13:19:49Z) 시 GHA `Migrate (production)` **success** — 2026-07-16 확인.
- [x] **`next build` 타입체크 블로커 해소 (2026-06-01)** — pre-existing `templates/` 스캐폴드(PR #9)가 tsconfig `**/*.ts` 에 포함돼 빌드 실패하던 것 → tsconfig `exclude` 에 `templates` 추가. `pnpm tsc`·`pnpm build` 모두 그린(exit 0). **후속(v1.1): templates monorepo 구조 재정비(PR #9) — 사용자 메모 "추후 구조 다시 잡아야".**
- [x] **모노레포/폴더 구조 결정 (2026-06-02, ADR-033)** — velog 4부작(Nx·Turbo·pnpm) 교차검증 + 5옵션 점수화(AI-DevX 우선). 결론: 현행 **F3 단일앱 유지**가 v1.0/근미래 최적(OPT-2 8.34 > OPT-1 8.13, OPT-3/5 fails·OPT-4 weakened). velog와 **갈리지 않음**(직교+철학 수렴), template과도 거의 일치. **마이그레이션 부채(v1.1+, 보류)** — 복합 트리거(팀≥3 OR CI 빌드병목 실측 OR web/admin 독립배포 케이던스) 발화 시에만 F2(pnpm→측정후 Turbo, **Nx 금지**)로. 도메인수 7개 단독으로는 발화 금지. 상세 `docs/decisions.md` ADR-033.
- [ ] **A7 — 로그인 rate limit** — Vercel Firewall rate-limit 룰을 `/api/auth/*` 에 적용(코드 0). 단일 super 브루트포스·credential stuffing 방어. 배포 대시보드 설정. (Vercel 배포 확정 — 2026-06-01)
- [ ] **AUTH_SECRET 강도** — 32바이트+ 시크릿 강제·회전(rank20). 임시 어드민 비번 변경(`admin@ffwpu-social.local`).

## 운영 절차 — 이미지 긴급 내리기 (ADR-051 로 단순화됨)

> **2026-08-08 갱신 (ADR-051).** `images.unoptimized: true` 로 전환해 이미지가 Vercel 옵티마이저를 거치지 않는다 → **Vercel purge 단계가 사라졌다.** ADR-049 시절의 "최대 7일 계속 서빙" 문제도 함께 해소됐다. ADR-004 개인정보 보호 절대 제약과 직결되므로 아래를 지킨다.

1. 어드민에서 해당 글 **비발행** (목록·상세에서 사라짐)
2. Cloudflare R2 콘솔에서 **해당 객체 삭제** — 표시본과 **`original/` 보관본을 둘 다** 지운다 (ADR-051 백필이 원본을 보존하므로 표시본만 지우면 원본이 남는다)
3. Cloudflare 캐시 purge (해당 URL)

> `[확인 필요]` 커버 객체에 `Cache-Control` 헤더가 없어 `pub-*.r2.dev` 엣지 캐시가 Cloudflare 기본 TTL 을 따른다. 2단계만으로 즉시 반영되는지 미검증이라 3단계를 병행한다. Vercel 시절의 7일보다는 훨씬 짧다.

⚠️ 브라우저가 이미 받아간 사용자는 purge 로도 회수되지 않는다. 위 절차는 "그 이후 새로 접근하는 사람"을 막는 조치다.

## Completed (최근 4개)

- [x] **어드민 이미지 업로드 UX (2026-07-16, PR #89 머지·배포)** — 에디터 이미지 업로드가 콘솔에만 에러 찍고 침묵하던 문제. ① `onError` → 한국어 토스트 ② 업로드 전 자동 리사이즈(드롭존·2장나란히·커버 3경로). 저장 상한 5MB 유지 · 원본 상한 30MB 신설 · **원본 형식 보존**(커버가 OG 썸네일로 나가 webp 통일 시 크기에 따라 OG 형식이 조용히 갈림). ADR-046. 스키마 0. 실측 JPG 8.55→0.83MB · PNG 17.52→4.04MB · WEBP 5.37→0.56MB. tsc0·lint0·test115.
- [x] **어드민 분석·예약 발행·Tiptap 숫자 크기 (2026-06-10)** — 익명 세션 기반 `analytics_events` 추가(조회·공감·공유), 어드민 대시보드 최근 30일 분석 카드, `publishedAt <= now()` 공개 조건 기반 예약 발행, 어드민 예약 상태 표시, Tiptap `12px~40px` 숫자 입력 + sanitize 정합. `pnpm tsc --noEmit`·`pnpm lint`·`pnpm test`(52)·`pnpm build` 통과. **스키마 변경 1건.**
- [x] **소식 검색 + 768 그리드 정정 (2026-06-07)** — `/news` "더 많은 소식" 탭+검색 인라인 툴바(제목+태그 ILIKE, q×category AND). 768 카드 3열→2열 수정(skeleton·Figma 정합). branch `feat/news-search`, ADR-036. Generator-Evaluator(2-pass 적대 + codex C1 반복q 500 수락). tsc0·lint0·test47. **스키마 0.** 검증: `docs/design/review-news-search-2026-06-07.md`.
  - **v1.1 후속(Next Actions):** 본문(jsonb) 검색 · 검색어 하이라이트 · 자동완성/추천검색어 · 헤더 검색 모달(familyfed SearchPanel 패턴) · 사회공헌국 검색 디자인 최종 승인.
- [x] **Figma SSOT 재동기화 (2026-05-30)** — 사용자 3 노드 ID 재공유 기반. 홈 1920/1024 자식 frame ID 갱신 (`331:7984`·`332:9254`) + 1439 폐기 + 소식 Banner 정식 등장 카피 갱신. `docs/design.md` / `docs/design/README.md` / `docs/current.md` / `docs/TODO.md` 4파일 일관화. 사용자 조달 대기 항목 ↓ "Next Actions" 등록.
- [x] Sprint 1 D-4 — F3 폴더 + 디자인 토큰 + SUIT 폰트 + 공통 컴포넌트 11종 + Route Group (2026-05-27, 9 commits)
- [x] D-4 Multi-Agent 검증 + ITERATE verdict → P0 7건 처리 완료

## Blocked

- 없음

## Questions / 사회공헌국 escalation

### 홈 팝업 소재 수령 (2026-07-18, feat/home-popup 머지 후 국장님 전달)

- **팝업 이미지 제작 가이드 전달 필요** — 세로형 4:5 내외 권장, 가로 720px 이상, 5MB 초과 시 자동 축소(형식 유지). 텍스트·버튼은 이미지 안에 직접 디자인 (코드는 이미지를 그대로 노출).
- **첫 팝업 소재 + 클릭 이동 대상 수령 대기** — 이미지 파일 1장 + 링크(내부 경로 `/notices/...` 또는 https URL, 없어도 무방).
- 운영 안내: 어드민 → 팝업 관리에서 등록·기간 설정. 여러 팝업 활성 시 시작일 최근 1개만 노출, "일주일간 보지 않기"는 방문자 브라우저별 7일.

### H-2 — 푸터 종교 법인명 위치 ([확인 필요])

> 출처: D-4 multi-agent 검증 human 페르소나 narrative (CONFUSED 모드, 신뢰 4/10).

- 현재: `src/client/layouts/PublicFooter.tsx` 푸터 최하단 작은 글씨에 "세계평화통일가정연합 신한국협회 사회공헌국" 단 1회 표시.
- **갈등:** ADR-004 (포교 금지 절대 제약) vs 법적 의무 (법인명 표시 투명성).
- **옵션:**
  - A) 푸터 최하단 작은 글씨 유지 — 법적 표시 충족, 사용자 첫인상 영향 미미.
  - B) 푸터 별도 섹션 또는 About 페이지 이동 — 포교 금지 강하게 준수, 단 법적 의무 위치 검토 필요.
- **결정 주체:** 사회공헌국 단독 (ADR-004 절대 제약).

### ~~H-3 — Banner "참여하기" 카피 의미 합의~~ ✅ 자동 종결 (2026-05-30)

> **종결 사유:** 신 Figma 동기화 (95-9359 Banner `125:8915` 외 4 BP 인스턴스) 결과 Banner 에 *CTA 자체가 제거*되고 안내 카피만 남음 — "참여하기" 링크의 의미 충돌이 *디자인에서 사라짐*.
> 신 카피 — `Sow Good 가족이 아니어도, 같은 동네가 아니어도, 밥상을 함께하는 사람이 있다면 우리는 이미 식구입니다.`
> 코드 정합 작업은 아래 §"Next Actions" `Banner 컴포넌트 재작성` 으로 이관.

### 추가 escalation 후보 (D-3 진입 전 확정 권장)

- [ ] **Pagination active 색** — H-1 결정 완료 (Figma 명세 `text-brand-primary` 무배경, 2026-05-27 사용자 확정). [확정됨]
- [ ] **홈 페이지 placeholder 카피** — D-4 의 "준비 중" 임시 카피는 D-3 디자인 시안 적용 시 본격 구현으로 교체 예정. 시안 미수령 시 사회공헌국 카피 확정 필요.
- [ ] **favicon 자산** — Sow Good BI 기반 favicon 사회공헌국 제공 또는 사내 제작.
- [ ] **헤더 배경 디자인** — 코드 현재 `bg-white/90` vs Figma 명세 `#B769FF` (brand-bright 보라). D-3 시안 적용 시 Figma 정합 권고.

### 공지사항 Figma 정합 2026-07-08 escalation (디자이너/사회공헌국)

- [ ] **공지 타이틀 eyebrow "News" 카피** — Figma(1103:7882·1104:10813)가 공지사항 목록·상세 타이틀 위 eyebrow 를 "News" 로 표기. 공지 게시판인데 소식(News) 라벨이 맞는지 확인 필요. 코드에는 Figma 그대로 "News" 적용(문자열 2곳 — 목록·상세 page.tsx).
- [ ] **공지 Figma 프레임 헤더 메뉴 라벨 불일치** — 해당 프레임 헤더가 "임팩트 데이터/활동 스토리/메인 스토리/공지사항" 4메뉴로 그려짐(pre-ADR-038 더미로 판단). 코드는 ADR-038 확정 4메뉴 + 공지사항 5번째 추가로 구현. 디자이너 의도(메뉴 교체 vs 추가) 확인 권장.
- [ ] **읽은 행 hover 시 핀 아이콘·행 높이** — Figma 는 읽은 행(h70·핀)과 일반 행(h62)이 다른 레이아웃. hover 는 색만 전환(레이아웃 시프트 방지 [정책]) — 디자이너 확인 권장.

### Figma 정합 감사 2026-06-10 escalation (디자이너/사회공헌국 — 상세: `docs/design/audit-2026-06-10/report.md` §4)

- [ ] **하트 pill 클릭(채움) 상태 색** — Figma 에 pill Click 변형 미노출, 구형 컴포넌트 #B35FEB 채움 [추론] 적용. 디자이너 확정 필요.
- [ ] **Featured 미니 로고 vs 카테고리 칩** — Figma SSoT 원칙대로 꽃 로고 복원·칩 제거. 칩(실데이터 카테고리)이 제품 의도였다면 한 줄로 번복 가능.
- [ ] **공유 버튼 데스크탑 동작 중복** — navigator.share 미지원 데스크탑에서 공유·링크복사가 같은 동작. v1.1 카카오/페북 SDK 전까지 첫 버튼 숨김 검토.
- [ ] **본문 14px 4곳 (Featured 본문 375/768·Story 설명)** — 접근성 제약(본문 16px)으로 16px 유지. 디자이너와 최종 합의 권장.
- [ ] **Partners 768 5로고 2행 배치** — Figma 미정의(더미 중복) → 중앙 정렬 채택. 시각 확인 요청.
- [ ] **DateTimePicker hydration mismatch (선재 이슈, 2026-07-18 발견)** — 어드민 날짜 버튼 라벨이 서버 "PM 7:24" vs 클라 "오후 7:24" (Node ICU ↔ 브라우저 로케일 차). notices/popups 편집 화면 공통, 콘솔 에러만 있고 기능 정상(클라 재생성). 수정안: date-fns format + ko locale 고정 또는 suppressHydrationWarning. 팝업 PR 범위 외 — 별도 fix.

## Next Actions

### 이미지 정규화 후속 (2026-08-08, ADR-051)

- [x] **본문 인라인 이미지 정규화** (2026-08-08, ADR-052) — 151개 / 110.8 MB → 15.7 MB (-86%). 업로드 파이프라인(`prepareImageForUpload` 1810px JPEG + 투명도 스킵)과 백필 모두 적용.
- [ ] **응답·디코드 실패 본문 이미지 11개** — ADR-052 백필 중 발견. `body` 가 가리키는 R2 객체가 없거나 이미지로 디코드되지 않는다. 백필 이전부터 있던 문제로 스킵 처리했다. 해당 글에서 실제로 깨져 보이는지 확인하고 재업로드 또는 노드 제거 필요.
- [ ] **`backup/` 정리** — ADR-052 백필의 body 원본 백업(`backup/body-backup-*.json`). 본문 렌더 검증이 끝나면 삭제. 되돌리려면 `pnpm db:backfill-body-images --env .env.prod --rollback <file>`.
- [ ] **`og:image` 치수 선언 교정** — `news/[id]/page.tsx:52` 가 `width: 1200, height: 630` 을 고정 선언하는데 실제 커버는 4:3·1:1 등 제각각이다. 스크래퍼가 선언값을 믿으면 잘못 렌더할 수 있다. `coverImageWidth/Height` 를 넣거나 선언을 제거한다.
- [ ] **모바일 전송량 회수 검토 (선택)** — 정규화로 옵티마이저의 66 KB 대신 137 KB 를 보낸다. 업로드 시 2벌(800/1440)을 만들어 수동 `srcset` 을 붙이면 되찾을 수 있으나, `MediaCard`·`ArticleCard`·`FeaturedStoryCard` 3개가 `fill` 을 써 4-BP 재검증이 필요하다. Fast Data 가 10/100 GB 라 급하지 않다.
- [ ] **v1.1 orphan cleanup 에서 `original/` 제외 규칙 추가** — ADR-051 백필이 원본을 `<dir>/original/` 에 보존한다. 참조 없는 객체를 지우는 정리 작업이 이걸 삭제하면 원본이 영구 소실된다.
- [x] **`.env.prod.local` 삭제** (2026-08-08) — 프로덕션 스크립트용 자격증명은 로컬 `.env.prod` 를 쓴다 (gitignore `.env*` 로 보호, 미추적 확인). 백필 등 prod 대상 스크립트는 `--env .env.prod`.
- [ ] **백필용 R2 API 토큰 회수 검토** — 2026-08-08 백필을 위해 발급했다면 Cloudflare 에서 정리. `.env.prod` 가 상시 보관본이면 유지해도 되나, Object Read & Write 권한이라 노출 시 영향이 크다.
- [ ] **신규 업로드도 원본을 보관할지 결정 (사회공헌국)** — 백필은 기존 원본을 보존했지만, Phase 3 업로드 경로는 정규화본 1벌만 올린다. 업계 관행은 보관이나 브라우저가 2벌을 올려야 해 업로드 +2~3초·presign 2회·부분 실패 처리가 붙는다. 촬영 원본을 자체 보관 중이면 불필요.

### 이미지 최적화 후속 (2026-08-06, ADR-049·050) — ⚠️ ADR-051 로 대부분 무의미해짐

> `unoptimized` 전환으로 Vercel 옵티마이저를 거치지 않는다 → 아래 3건 모두 **검증 대상이 사라졌다.** 기록만 남기고 실행하지 않는다. (`unoptimized` 를 되돌릴 경우에만 다시 유효)

- [ ] **배포 후 24~48시간 뒤 Vercel Observability → Image Optimization 확인** — 일일 변환이 100~400 → 한 자릿수로 떨어지는지. 배포 당일 1회 burst(기존 4h 캐시의 마지막 STALE 재변환 ≈150~250건)는 예상된 동작.
- [ ] **`src/db/seed.ts:79` 커버 키에 파일 내용 해시 부여** (`news/seed/<hash8>-<파일명>`) — 현재는 실사진을 같은 파일명으로 재시드하면 URL 이 그대로라 최대 7일간 옛 이미지가 노출된다. 해결 시 `minimumCacheTTL` 을 31일(2678400)로 상향 가능.
- [ ] **ADR-050 배포 후 curl 검증 2종**
      ① 제3자 호스트 차단: `pub-<임의>.r2.dev` · `no-such-bucket.s3.amazonaws.com` → **둘 다 400** (배포 전에는 502/404 로 통과했음)
      ② 커버 정상 렌더 육안 확인 (랜딩 · `/news` 목록 · `/news/[id]` · `/notices`) — 화이트리스트에서 우리 호스트가 빠지면 전부 400 이 된다

### 즉시 (이 세션)

- [x] D-4 Atomic Update — checklist / design.md 토큰 / context-notes / AGENTS.md 동기화
- [x] **Figma SSoT 정합 작업 (2026-05-27 사용자 지적)** — Banner 삭제 + 홈 placeholder 빈화 + Footer Figma news-detail 정합 + `docs/design/README.md` 신규
- [ ] D-4 git push 사용자 승인 (현재 11 commits, `feat/sprint-1-d4-components` 브랜치)
- [ ] PR 생성 (사용자 승인 시)

### 다음 세션 (D-3 진입)

- [ ] ADR 후보 2건 작성 — ADR-025 (client/server barrel 분리) + ADR-026 (토큰 명명 namespace `--color-brand-*` `--color-ink-*` `--color-surface-*`) 또는 ADR-024 보강.
- [ ] `docs/tech.md` F3 다이어그램 마커 🆕 D-4 → ✅ D-4 전환 + `app/(public)/dev/components/` 추가.
- [ ] `src/client/sections/` 6 섹션 신규 생성 (HeroBanner + KpiSection + StorySection + FeaturedSection + ArticleGrid + Pre-Footer).
- [ ] `src/app/(public)/page.tsx` 빈 div → 디자인 시안 구현 (Figma 1920 landing 정합).
- [ ] **PublicHeader 2단 구조 도입** — Figma news-detail (93:8810) 명세: 상단 작은 회색 NAV (캠페인 CTA "함께 동행하기" 등) + 아래 흰 영역 큰 로고/4메뉴/검색.
- [ ] PublicHeader 배경 시안 정합 (현재 단순화 → Figma 실제 톤) + 비선택 메뉴 alpha 정합.
- [ ] 1920 landing 푸터 직전 보라/SNS 영역을 별도 섹션으로 분리 도입 (현재 PublicFooter 는 news-detail 단순 카피라이트만).
- [ ] Gmarket Sans Medium woff2 도입 (HeroBanner 슬로건 60px 전용).
- [ ] favicon 적용 (사회공헌국 BI 자산).

### 다음 세션 (D-3 + 소식 페이지)

- [ ] **Banner 컴포넌트 재작성** — Figma `125:8915` 명세 정합 (1440×132 가로 띠, 카피 **"Sow Good 가족이 아니어도, 같은 동네가 아니어도, 밥상을 함께하는 사람이 있다면 우리는 이미 식구입니다."** — 2026-05-30 갱신, 옛 카피 "따뜻한 진심을 담아" 폐기). CTA 버튼 **없음** (디자인 변경). 소식 페이지 (목록·상세) 전용으로 layout 분리. 4 BP 인스턴스 = `106:9112` / `125:8915` / `125:10430` / `125:13075` / `135:11713` / `135:12492`.

### 2026-05-30 신 Figma 동기화 후속 — 사용자 조달 대기 (🔴 차단성)

> 사용자 결정 2026-05-30 — "사회공헌국 원본 + 파트너 BI 모두 사용자가 전달". 도메인 절대 제약 §7 "스톡이미지 가득한 기업 홍보 톤 금지" 정합.
>
> **현재 상태 (2026-05-30 23:06):** Figma 디자이너 더미 16장이 *이전 D-3·D-4 작업으로 이미 `public/images/` 에 배치돼 있었음*을 발견. 사용자 결정 (회색 placeholder 즉시 교체) 에 따라 **16 파일 모두 1×1 #E5E7EB 회색 PNG (69B) 로 교체 완료**. 원본 디자이너 더미는 `docs/design/figma-dummy-backup/` 에 영구 보존 (gitignore 등록 — repo 미반영, 7일 URL 만료 대비 로컬 캐시 차원). 시각 사이트는 D-3 시안 진행 시 빈 회색 자리로 표시되어 *교체 잊지 않게 강제*. 사용자 사진 수령 시 동일 파일명으로 덮어쓰면 production 반영.

- [ ] **사회공헌국 봉사 현장 원본 사진 11장** 사용자 조달 (Dropbox/Drive/zip 일괄 권장)
  - KPI 보라 카드 사진 1장 (`96:9925` 슬롯, 1920×2571 retina 권장)
  - Story 카드 사진 2장 (`97:7549` 916×786 + `97:7548` 572×768)
  - ArticleGrid 카드 사진 6장 (`96:7888`·`96:7889`·`96:7891`·`96:7892`·`96:7894`·`96:7895`, 556×436 ~ 556×830 다양)
  - Featured 카드 본문 이미지 1장 (`125:9054` image 50, 916×786 retina)
  - (별도) 소식 상세 본문 이미지는 어드민 Tiptap 업로드로 조달 — 슬롯 #18, 사용자 조달 대상 아님
- [ ] **파트너 BI 5장** 사용자 조달 (`image 37~42`, 86~218×31~53 PNG/SVG)
  - 노드 `96:7958` (218×31) / `96:7960` (183×53) / `96:7962` (164×38) / `96:7964` (86×33) / `96:7966` (173×52)
- [x] **1920 BP 자식 섹션 ID 재추출** (2026-05-31 완료) — `331:7985`/`8061`/`8123`/`8155`/`8174`/`8245` 로 `docs/design.md` 표 1920 컬럼 채움.
- [x] **1024 BP 자식 섹션 ID 재추출** (2026-05-31 완료) — `332:9255`/`9331`/`9393`/`9425`/`9444`/`9517`. *주의:* 1024 PartnersSection 은 6 슬롯 2×3 그리드로 표시되지만 `image 38` 이 슬롯 #3·#5 중복 — 디자이너 placeholder 채우기로 운영은 5장 유지.
- [x] **screenshots/ 갱신** (2026-05-31 완료) — `landing-331-7984-1920px.png` + `landing-332-9254-1024px.png` 신규 캡처. 옛 3장 (`landing-126-11815-1920px.png` / `landing-126-10980-1024px.png` / `landing-126-11398-1439px.png`) 은 `docs/design/screenshots/legacy/` 이동.

### D-4 후속 디자인 P1 (D-3 진입과 병행 가능)

- [ ] `ArticleCard.tsx:132-133` shadow rgba(80,31,126,0.25) hex literal → `--shadow-card-hover` 토큰 추출.
- [ ] `FeaturedStoryCard.tsx:112` inactive 인디케이터 그레이 톤 `rgba(75,85,99,0.15)` 복원 + `--color-carousel-inactive` 토큰화.
- [ ] `FeaturedStoryCard.tsx:111` `transition-all` → `transition-[width,background-color]` 명시화.
- [ ] `StoryCard.tsx:22-25` Wrapper conditional href prop 누설 — `{...(href ? { href } : {})}` 패턴.
- [ ] `ArticleCard.tsx:102,112` "보도자료" hardcode → 중립 표현 (ADR-007 더미 라벨).
- [ ] `AdminSidebar.tsx:67-68` active matching `startsWith` → exact match (codex P3).

### Sprint 2 (어드민 마무리) 후속 — 전역/저우선

- [ ] 에러 박스 대비 검증 — `text-destructive` on `bg-destructive/5` 가 WCAG AA(4.5:1) 경계선. NewsTable·KpiEditor·AccountManager·StoryStatsEditor·HeroOrderManager 공통 패턴 (신규 파일 고유 아님). 전역 1회 검증 후 필요 시 `font-medium` 또는 토큰 1단계 상향. (designer Slice4 Should-fix #2)
- [ ] `NewsTable.tsx` 페이지네이션 윈도잉 — 현재 `Array.from({length: totalPages})` 전체 렌더. 글이 30+ 페이지가 되면 모바일 가로 오버플로. 현재 9건(1페이지)이라 미발현. first/prev/…/next/last 윈도잉으로 교체. (latent, 데이터 증가 시)
- [ ] 랜딩 반응형 2차 후속 정리 — `public/icons/hero-banner-background.svg` 미참조 에셋 제거(Hero 곡선 제거로 고아). `globals.css` `--color-surface-tint-soft` 주석 "Hero·Partners" → "Partners" 로 정정(Hero 미사용). 저우선.

### Figma 정합 스윕 후속 (2026-06-10 하드코딩 정리에서 파생)

- [ ] Partners 섹션 py wide(48) < lg(76) 역전 — Figma 1440 프레임 재확인 [확인 필요]. 높이 역산값이라 콘텐츠 내부 오프셋이 패딩에 흡수됐을 가능성 — KPI 처럼 오토레이아웃 패딩 직접 측정으로 검증.
- [ ] `GmarketSans-Medium.woff2` 서브셋 — 현재 512KB 풀 글리프(한글 11,172자 전체). SUIT 동일 정책(KS 급 ~2,900자) 서브셋 시 ~261KB(−49%). 헤드라인 글리프 한정이면 ~5KB — 단 카피 변경 시 재생성 필요(트레이드오프 결정 필요).
- [ ] `FeaturedStoryCard` min-h(423/556) 콘텐츠 폭주 가드 — 제목·설명이 운영자 자유 입력이라 길어지면 airy 간격(`mt-auto`) 붕괴. 제목 `line-clamp-2`·설명 `line-clamp-3` 검토 (운영 자율성 제약: 어떤 길이를 넣어도 디자인 유지).

### 이미지 업로드 후속 (2026-07-16 ADR-046 에서 파생)

- [ ] **어드민 날짜 표시 하이드레이션 미스매치** — `/admin/news/new` 발행 일시 피커가 서버 `2026년 7월 16일 목 오전 9:40` vs 클라 `... AM 9:40` 로 갈려 콘솔 에러. **ADR-045 후속 ⓑ(`KpiEditor.tsx:49` `toLocaleString` 시간대)와 동일 계열** — 두 건을 함께 `timeZone: "Asia/Seoul"` + `hour12` 명시로 일괄 해소 권장. (ADR-046 실측 중 발견, 별건이라 미수정)
- [ ] **HEIC 미지원** — `accept="image/*"` 라 아이폰 HEIC 선택은 되지만 허용 MIME 이 아니라 서버가 거부. ADR-046 으로 **한국어 토스트는 보이게 됨**(과거엔 침묵)이라 차단성은 해소. 자동 변환은 브라우저별 decode 편차(Chrome 불가·Safari 가능)로 별도 판단 필요 — 운영자가 아이폰에서 직접 올리는 빈도 확인 후 결정.
- [ ] **`ImageRowButton` 의 `window.alert` → toast 통일** — "2장 나란히" 실패만 blocking alert 를 쓴다(동작은 함). ADR-046 에서 나머지 경로가 sonner 로 통일돼 UX 만 불일치. (§3 Surgical 로 이번 범위 제외)
- [ ] **`tiptap-utils.ts:289` `handleImageUpload` dead code** — 어디서도 import 안 되는 tiptap 데모 잔재인데 `:301` 에서 `File size exceeds maximum allowed` 를 **동일 문구로** 던져 향후 디버깅 혼선 요인. 같은 파일 `MAX_FILE_SIZE`(5MB)도 이 잔재 전용. 벤더 원본이라 이번엔 미수정 — 재벤더링 정책과 함께 판단.

### v1.1+ 백로그

- [ ] **랜딩 스크롤 fade-in 인터랙션** — Figma 리뷰어 코멘트 요청 (KPI 영역 "지구랩 인터랙션 참고 https://earthrap.imweb.me/", Story 영역 "스크롤 위치에 따라 하단→위로 페이드인 되며 올라오는 인터렉션이 전체적으로 적용되면 좋을 것 같습니다 https://www.netive.co.kr/"). 정적 시안과 별개의 인터랙션 요청이며 현재 애니메이션 라이브러리·코드 전무. 구현 시 IntersectionObserver(기존 `src/client/hooks/useScrollSpy.ts` 패턴 재사용) 또는 CSS `animation-timeline: view()` 로 `translateY(16px)→0` + `opacity 0→1`, `prefers-reduced-motion` 가드 필수·진입 blocking 금지 (anti-slop 모션). 🔴 **사회공헌국 우선순위 확정 필요** — 2026-06-07 KPI·Story Figma 정합 검증에서 제외 결정(정적 정합 우선).
- [ ] **스토리지 orphan cleanup job** — 업로드 후 미저장 이탈 객체 정리 (news `news/temp-*`·본문 이미지 + notices 첨부·본문 이미지 공통, ADR-041 잔존 리스크). DB key 목록과 S3 목록 diff 배치.
- [ ] PublicFooter © 연도 자동 갱신 — BUILD_TIME 환경변수 또는 빌드 스크립트.
- [ ] HeroBanner 60px 슬로건에 Gmarket Sans Medium 본격 도입.
- [ ] PublicHeader 검색 기능 본격 구현 (ADR-011 1차 범위 외).
