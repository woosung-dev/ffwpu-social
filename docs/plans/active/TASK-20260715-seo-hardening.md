---
status: active
opened: 2026-07-15
branch: feat/seo-hardening
slice_id: TASK-20260715-seo-hardening
spec_status: confirmed
brainstorming_done: 2026-07-15
related_adr: ADR-044
---

# SEO 하드닝 — 측정·JSON-LD·sitemap notices·소유확인 체계

> 사용자 요청 3건(SEO 점수 측정 / 세팅 심층 분석 / 노출 가속)에서 도출된 코드 하드닝.
> 플랜 원문: `~/.claude/plans/google-seo-zazzy-babbage.md` (승인 2026-07-15).

## 실측 결과 (2026-07-15, 코드 변경 전 기준)

| 지표 | 값 | 비고 |
|---|---|---|
| PSI 모바일 | 성능 70 · 접근성 96 · 권장사항 96 · **SEO 100** | pagespeed.web.dev 공식 |
| PSI 데스크톱 | 성능 88 · 접근성 96 · 권장사항 96 · **SEO 100** | |
| CrUX 필드 데이터 | 없음 | 트래픽 부족(정상) |
| 구글 색인 | **17 URL** (sitemap 22 중) | `site:sowgood.kr` 실측, 최근 글 3~5일 내 색인 |
| 브랜드 검색 | "사회공헌단 sow good" **1~3위** | |
| Search Console | **미등록** → 속성 생성(인증 대기) | GA 인증 실패(gtag가 initial head에 없음) → HTML 파일 인증 |

## 체크리스트

- [x] `listPublishedNoticesForSitemap()` — notices db/service/배럴 (news 컨벤션 동일)
- [x] `sitemap.ts` — /notices+공지 상세 편입, 목록 lastmod = 최신 콘텐츠 updatedAt
- [x] `JsonLd` 공용 컴포넌트 (`src/client/components/seo/json-ld.tsx`, XSS `<` 이스케이프)
- [x] 랜딩 Organization+WebSite `@graph` JSON-LD
- [x] 소식 상세 NewsArticle JSON-LD (기조회 데이터 재사용, 추가 쿼리 0)
- [x] 공지 상세 Article JSON-LD + twitter 카드 패리티
- [x] `/news` sr-only h1 (시각 변화 0)
- [x] proxy admin 호스트 `X-Robots-Tag: noindex, nofollow`
- [x] `metadata.verification` env 연동 (GOOGLE/NAVER_SITE_VERIFICATION) + `.env.example`
- [x] GSC HTML 파일 인증 `public/google7f8c005c70787329.html`
- [x] RSS 2.0 `/feed.xml` (최신 20건, 순수 빌더 + 단위테스트 5)

## 검증 (2026-07-15)

- tsc 0 · lint 0 · **test 108**(기존 103+신규 5) · build ✓ (/feed.xml·/sitemap.xml 라우트 등록)
- 로컬 프로덕션 서버(3200) 런타임 8종: sitemap notices 7건 ✓ · RSS 유효 ✓ · 랜딩 @graph ✓ · sr-only h1 ✓ · admin 호스트 X-Robots-Tag ✓(사용자 도메인 미적용 ✓) · NewsArticle JSON-LD ✓ · 인증 파일 200 ✓ · verification 메타 env 미설정 시 미출력 ✓

## 배포 후 운영 절차 (코드 밖 — 순서대로)

1. Vercel 자동 배포 확인 → `https://sowgood.kr/google7f8c005c70787329.html` 200 확인
2. Search Console 소유권 확인 다이얼로그에서 **HTML 파일 → 확인** 클릭 (속성 https://sowgood.kr/ 생성돼 있음, 계정: Browser 1 로그인 구글 계정)
3. Sitemaps 메뉴에 `https://sowgood.kr/sitemap.xml` 제출
4. URL 검사로 홈·/news·/notices·주요 소식 3~5건 색인 요청 (일 ~10건 쿼터)
5. GA4 ↔ Search Console 연결 (GA 관리 → Search Console 링크)
6. (권장) 네이버 서치어드바이저 등록 — NAVER_SITE_VERIFICATION env 또는 HTML 파일 + sitemap·`/feed.xml` RSS 제출 + 웹페이지 수집 요청
7. (선택) Bing 웹마스터 — GSC 가져오기 1클릭

## 배포 시 주의

- 스키마 변경 0 · 마이그레이션 0 · env 필수 추가 0 (GOOGLE/NAVER_SITE_VERIFICATION 은 선택 — HTML 파일 인증이 primary)
- `public/google7f8c005c70787329.html` 삭제 금지 — 삭제 시 GSC 소유확인 해제

## TL;DR

- **문제**: 구글 노출 가속 요청 — 측정·세팅 점검 결과 온페이지 메타는 완비, 색인 파이프라인(GSC·notices sitemap·JSON-LD)이 공백.
- **채택안**: JSON-LD 3종 + sitemap notices 편입 + lastmod 정확화 + admin X-Robots-Tag + 소유확인 2경로(HTML 파일 primary/env 예비) + sr-only h1 + RSS.
- **파일**: sitemap.ts · features/news,notices(db/service/배럴) · client/components/seo(신규) · (public) 4페이지 · proxy.ts · layout.tsx · .env.example · public 인증파일 · feed.xml(신규).
- **검증**: tsc0·lint0·test108·build✓ + 로컬 prod 런타임 8종 전부 통과.
- **폴백**: GSC 인증은 배포 후 파일 방식 클릭 1회. env 방식은 예비.
