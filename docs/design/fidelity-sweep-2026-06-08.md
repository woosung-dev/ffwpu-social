<!-- Figma 정합 스윕 측정 기록 — 3개 캔버스 섹션별 Figma값/라이브값/Δ/조치 (Playwright getBoundingClientRect 스크롤바 숨김 4앵커 ±2px) -->

# Figma 정합 스윕 측정 기록 (2026-06-08~09)

> 측정: Playwright `getBoundingClientRect`(스크롤바 숨김) 4앵커 375/768/1024/1440. 허용 ±2px.
> Figma fileKey `lmjjU4UxUpK2pDi67BGRiW`. 코드 BP→Figma 밴드: base→375 / md→768 / lg→1025 / wide→1440.
> 브랜치 `feat/figma-fidelity-sweep`.

## 선행 — Gmarket Sans
- SIL OFL 확인(corp.gmarket.com) → Medium woff2 셀프호스팅(`next/font/local`), Hero 헤드라인 적용.
- Hero 헤드라인 1440 박스 553×150 = Figma 554×150 ±2 (SUIT 폴백 글자폭 차이 해소).

## A. 헤더 (Figma 컴포넌트 97:9431) — 전 BP PASS
| BP | height | 콘텐츠 grid | 로고 | 검색아이콘 | 결과 |
|---|---|---|---|---|---|
| 375 | 54 | px16 | 63×42 | pill+🔍 gap16 | ✓ |
| 768 | 70 | 60/648 | 63×42 | 4nav gap4+🔍 | ✓ |
| 1024 | 88 | 60/905 | 80×53 | 4nav gap24+🔍 | ✓ |
| 1440 | 88 | 120/1200 | 80×53 | 4nav gap24+🔍 | ✓ |
- 수정: height 64/64/80/80→54/70/88/88 · `container px-20`→SectionContainer grid · 로고 40/48→42/53 · nav gap/padding/폰트 · **검색 아이콘 전 BP 복원**(Figma 노출·domain "헤더 아이콘만", ADR-037로 제거됐던 것 — 비인터랙티브 장식). search-icon.svg 재사용.

## B. 랜딩 (96:5908) — 섹션 높이 측정 (Figma / 라이브 / Δ)
| 섹션 | 375 | 768 | 1024(=1025밴드) | 1440 | 조치 |
|---|---|---|---|---|---|
| Hero(콘텐츠) | 187/187 | 340/340 | 405/405 | 612/612 | criteria PASS 유지(헤더 별도) |
| KPI | 544/543 | 840/839 | 1058/1057 | 952/952 | py 64/64/96/96→**44/58/90/96** |
| Story | 673/689(+16) | 682/683 | 479/479 | 573/571 | py→**79/79/73/73**·이미지↔텍스트 갭 40→50·내부 tag→title 14/18·title→desc 4/12. 375 +16=텍스트 line-height 잔차 |
| ArticleGrid | content-driven(실사진 마조네리) | — | — | 982/~ | wide 좌우갭 32→16(카드폭 277.67 정합). 높이는 실이미지 비율 가변 |
| Partners | 698/698 | 547/546 | 510/510 | 457/456 | py 64/64/96/96→**75/44/76/49**(비단조) |
| Footer | 70/70 | 99/99 | 99/99 | 99/99 | 데스크탑 사이즈 lg→**md** 전환(768 70→99) |
- 콘텐츠폭(마진): 전 섹션 343/648/905/1200, left 16/60/60/120 ✓.

### 잔차/메모
- Story 375 +16px: 텍스트 블록 line-height·줄바꿈 차이(폰트 렌더). 패딩·주요 갭은 정합. 허용 범위로 판단.
- KPI/Hero 내부(카드·타원·꽃)는 `kpi-hero-fidelity-criteria.md`(2026-06-08 PASS) governed — 섹션 패딩만 본 스윕에서 보정.
- ArticleGrid 총 높이는 실업로드 이미지 비율 기반(content-driven) — 구조(좌319·우865·갭16·컬럼16)만 정합.

## C. 소식 목록/상세 (95:9359) — 진행 예정

## D. 컴포넌트 카드/하트 (97:10250) — 진행 예정
