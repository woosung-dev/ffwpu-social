<!-- Figma 스펙 추출 — 소식 상세 1440 (audit 2026-06-10) -->

# 소식 상세 1440 — Figma 스펙 (하트 위치 변경 SSoT)

> 메인 프레임: `749:7920` (변경 B 최종 시안). 교차확인 `749:8278` — **전 노드 지오메트리 동일** 확인 (Heart 인스턴스 x745 y2.5 155×35 포함). `749:7920` 내 "Rectangle 8265"(749:8275, x937 y1254 312×110)는 디자이너의 변경 영역 하이라이트 주석 — 스펙 아님, 제외.
> 좌표는 Figma 원본 수치. "abs y"는 페이지(1440×2459) 기준 절대 y.

## 프레임 개요

| 프레임 | nodeId | 크기 |
|---|---|---|
| 소식_상세 (변경 B 최종) | 749:7920 | 1440×2459 |
| 소식_상세 (기존 디자인 섹션, 교차확인용) | 749:8278 | 1440×2459 — 749:7920과 동일 |
| Header (인스턴스) | 749:7977 | 1440×88, y0 |
| Contents (외곽) | 749:7978 | 1440×1989.46, y88 |
| ├ Banner | 749:7980 | 1440×132, abs y88~220 |
| ├ Background 밴드 | 749:7979 | 1440×598, abs y1759.46~2357.46 |
| └ Contents (내부) | 749:8050 | 1440×1857.46, abs y220 |
| &nbsp;&nbsp;└ Wrap (본문 컬럼) | 749:8056 | 900×1727.46, x270 (좌우 270 여백), abs y300 |
| ScrollButton 래퍼 | 749:8117 | 116×116, x1264 y2244 (버튼 55×55 abs x1295 y2275) |
| Footer | 749:7921 | 1440×99, abs y2360~2459 |
| Heart 컴포넌트 세트 ('컴포넌트' 섹션) | 114:8303 | 186×72 (Default 60×32 / Click 59×32) |

## 요소 스펙 (1440 단일 BP)

### Banner (749:7980)

| 요소 | nodeId | box(x,y,w,h) | padding/gap | font | 아이콘/이미지 | 색 | 비고 |
|---|---|---|---|---|---|---|---|
| Banner 밴드 | 749:7980 | 0, 88(abs), 1440, 132 | 내부 그룹 top 34 | — | — | bg #F2EFF4 | |
| 내부 그룹 | 749:7981 | x305.75, y34, 828.5×63.8 | gap 40 (로고↔디바이더↔카피) | — | — | — | 가로 중앙 정렬 |
| Sow Good 로고 그룹 | 749:7982 | 159.5×63.8 | — | — | 워드마크 118.74×28.06 + 꽃 37.81×63.8 | 보라 | |
| 세로 디바이더 | 749:8048 | h37 | — | — | — | 라인 | |
| 카피 텍스트 | 749:8049 | 349×40 | — | SUIT Medium 16 / lh normal, 2줄 | — | 본문 #9B7DB6, "Sow Good"만 SUIT Heavy #501F7E | |

### Title 블록 (749:8059 — abs y300, 4px 좌측 들여쓰기 x274)

| 요소 | nodeId | box | padding/gap | font | 색 | 비고 |
|---|---|---|---|---|---|---|
| Title 전체 | 749:8059 | x4(Wrap 내), y0, 892×125 | flex-col gap 20 (제목블록↔날짜) | — | — | |
| 카테고리 텍스트 | 749:8062 | 52×29 | 제목과 gap 4 | SUIT Bold 18 / lh 1.6 | #B35FEB | "쌀 나눔" |
| 제목 | 749:8063 | 892×48 (1줄) | max-h 85 (2줄), ellipsis | SUIT SemiBold 32 / lh 1.5 | #1F2937 (graysacle/black) | |
| 날짜 줄 | 749:8064 | 892×24, y101 | gap 26 (단일 자식) | — | — | **하트 없음** — 자식은 hidden Button(749:8065, hidden=true 잔재)과 날짜 텍스트뿐 |
| 날짜 | 749:8068 | 79×24 | — | SUIT Medium 16 / lh 1.5 | #959BA9 (graysacle/subtext3) | "2026.03.11" |

### Tag 리스트 (749:8073 — abs y485, Wrap 내 y185)

| 요소 | nodeId | box | padding/gap | font | 색 | 비고 |
|---|---|---|---|---|---|---|
| List | 749:8073 | x4, y185, 892×35 | flex-wrap, gap 가로 8 / 세로 12 | — | — | 태그 인스턴스 94 / 109 / 204 ×35 |
| Tag (Default) | 106:6740 기반 | h35 | px 16, py 4 | SUIT Medium 18 / lh 1.5 | bg #F9FAFB (graysacle/box3), border 1.3px #AC86D0, 텍스트 #AC86D0 | radius 99 (full) |
| Tag (Hover) | 106:6738 | h35 | px 16, py 4 | SUIT Bold 18 / lh 1.5 | bg #F7EFFF, border 1.3px #9E6FCB, 텍스트 #9E6FCB | radius 99 |

### 본문 Text 블록 (749:8077 — abs y580, Wrap 내 y280, 892w)

| 요소 | nodeId | box | padding/gap | font | 색 | 비고 |
|---|---|---|---|---|---|---|
| Text 컨테이너 | 749:8077 | x4, y280, 892×878.54 | flex-col **gap 24** (단락 간격) | — | — | |
| 리드 단락 (강조) | 749:8078 | 892×30 | — | SUIT **Bold** 20 / lh 1.5 | #3E404E (text/text) | text-justify |
| 일반 단락 ×2 | 749:8079, 749:8080 | 892×60 / 892×90 | — | SUIT Regular 20 / lh 1.5 | #3E404E | text-justify |
| 본문 이미지 | 749:8081 | 892×482.54 | — | — | — | aspect 952/515, **radius 명시 없음(rounded-rectangle이나 코드상 radius 미노출)**, object-cover |
| 박스 단락 | 749:8082 | 892×120 | — | 1행 SUIT Bold 20 + 본문 Regular 20 / lh 1.5 | #3E404E | "ECOSOC 특별협의지위란?" |

### ★ Bottom 줄 (749:8083 — abs y1508.54, Wrap 내 y1208.54, 900×40) — 하트 위치 변경의 핵심

| 요소 | nodeId | box | padding/gap | font | 아이콘 | 색 | 비고 |
|---|---|---|---|---|---|---|---|
| Bottom 행 | 749:8083 | 0, 1208.54, 900×40 | justify-between (Share 좌 / Heart 우) | — | — | — | |
| Share 그룹 | 749:8256 | 136×40 | gap 8 | — | — | — | 원형 3개 |
| SNS 원형 (카카오/페북/링크) | 749:8257 / 8259 / 8261 | 각 40×40 | 아이콘 (8,8) 배치 | — | 24×24 | bg #F5F6F8, radius 999(원), 아이콘 fill **#4B5563** | 링크는 mingcute:link-fill |
| **Heart 인스턴스** | **749:8220** | **x745, y2.5, 155×35** | 마스터 749:7904 참조 | — | — | — | 우측 끝 정렬(745+155=900), 40h 행 내 수직 중앙 |

#### Heart 인스턴스 내부 (마스터 컴포넌트 749:7904 "Property 1=Default")

| 속성 | 값 |
|---|---|
| 컨테이너 | bg **white**, border **1.3px solid #959BA9** (graysacle/subtext3), radius **23** (pill), padding **좌10 / 우12 / 상하3**, flex gap **6**, items-center |
| 아이콘 박스 | 24×24 (IconSet, 내부 p2) — 하트 벡터 **18×16**, **stroke #959BA9 1.3px** (외곽선 ♡, fill 없음), linecap/linejoin round |
| 라벨 "공감해요" | SUIT **SemiBold 18** / lh 1.6, #959BA9 |
| 카운트 "264" | SUIT **Heavy 18** / lh 1.6, #959BA9 |
| 높이 검산 | 3 + 28.8(18×1.6≈29) + 3 = 35 ✓ |

### Heart 컴포넌트 세트 (114:8303, '컴포넌트' 섹션) — 상세 인스턴스와 **다른 마스터**

| 상태 | nodeId | box | 구조 | font | 색 |
|---|---|---|---|---|---|
| Property 1=Default | 114:8302 | 60×32 | 아이콘 20×20(내부 하트 15×13.33) + gap 4 + 카운트 "264". padding 좌10 하10. 배경/테두리 **없음** | SUIT Bold 14 / lh 1.6 | 하트 **stroke #B35FEB 1.5** (외곽선 ♡), 텍스트 #B35FEB |
| Property 1=Click | 114:8301 | 59×32 | 동일 구조, 카운트 "265" | SUIT Bold 14 / lh 1.6 | 하트 **fill #B35FEB + stroke #B35FEB 1.5** (채움 ♥), 텍스트 #B35FEB |

**크기 차이 원인 (155×35 vs 60×32):** override가 아니라 **마스터 컴포넌트가 다름**. 상세 페이지 인스턴스(749:8220)는 신형 pill 컴포넌트 **749:7904**("공감해요" 라벨 + 카운트 + 흰 배경 + 테두리, 그레이 톤)를 참조하고, 114:8303은 구형 콤팩트 세트(아이콘+카운트만, 보라 톤, 배경 없음). 두 컴포넌트는 라벨 유무·색·패딩·아이콘 크기까지 전부 별개.

[확인 필요] 749:7904 세트의 **Click(채움) 변형은 추출에서 노출되지 않음** (인스턴스가 Default만 사용). 클릭 상태 색을 114:8301의 보라 채움(#B35FEB)으로 가져갈지, pill 형태 그대로 채움+색 반전할지는 디자이너 확인 필요.

### PrevNextNav 영역 (749:8095 — abs y1618.54, Wrap 내 y1318.54)

| 요소 | nodeId | box | padding/gap | font | 아이콘 | 색 |
|---|---|---|---|---|---|---|
| 상단 디바이더 Line 84 | 749:8096 | 900w, y0 | — | — | — | 라인 |
| prev/next 행 | 749:8098 | 900×24, 디바이더에서 +16 | justify-between | — | — | — |
| 목록 보기 (좌) | 749:8099 | 92×24 | gap 8 | SUIT SemiBold 16 / lh 1.45 | menu 아이콘 **24×24** | #1F2937 |
| RightBlock (우) | 749:8103 | 164×23 | gap 16 (이전글↔디바이더↔다음글), 내부 gap 4 (화살표↔텍스트) | SUIT SemiBold 16 / lh 1.45 | ArrowIcon **20×20**, stroke #1F2937 | #1F2937, 세로 디바이더 h17 |

### 관련 글 "더 많은 소식 살펴보기" (749:8111 — abs y1682.54, prev/next 행에서 +40)

| 요소 | nodeId | box | padding/gap | font | 색 | 비고 |
|---|---|---|---|---|---|---|
| 섹션 제목 | 749:8112 | 900×29 | 카드와 gap 16 | SUIT Bold 20 / lh 1.45 | #1F2937 | |
| 카드 행 | 749:8113 | 900×283.92 | gap 20 | — | — | 카드 3개 각 **286.67w** |
| Card 이미지 | I…;464:3046 | aspect **313/170**, w full | — | — | — | radius **14**, object-cover |
| Card 텍스트 wrap | I…;464:3043 | w full | pt 12 / pb 14 / px 2, flex-col gap 20 (제목블록↔날짜) | — | — | |
| Card 카테고리 | I…;479:2222 | — | 제목과 gap 4 | SUIT Bold 14 / lh 1.6 | #B35FEB | |
| Card 제목 | I…;464:3041 | max-h 52 (2줄) | — | SUIT Bold 18 / lh 1.4 | #1F2937 | ellipsis |
| Card 날짜 | I…;479:2226 | — | — | SUIT Medium 16 / lh 1.5 | #959BA9 | |

### 기타

| 요소 | nodeId | box | 스펙 |
|---|---|---|---|
| Background 밴드 | 749:7979 | 1440×598, abs y1759.46 | 수직 그라데이션: **상단 white → 하단 rgba(249,244,255,0.8)**. 관련 글·하단 영역 뒤 배경 |
| ScrollButton | 749:8118 | 55×55, abs x1295 y2275 | 원 fill **#414448, opacity 0.78** + ArrowIcon 36×36 (중앙 +0.5px 오프셋), 화살표 **stroke white**. 우측 여백 1440−1295−55=**90px**, 하단 여백 2459−2275−55=129px (Footer 위 30px) |
| Footer | 749:7921 | 1440×99, abs y2360 | bg **#242424**, px 120 py 10, 내부 1200w 중앙: 로고 59×39 + gap 20 + 세로 디바이더 h17 + 카피 SUIT SemiBold 16 / lh 1.5 **#F0E1FF** |

### hidden 제외 요소 (디자이너 숨김 — 구현 금지)

- 749:8051 상단 "목록으로" Title 바 (hidden) 및 자식 749:8052/8053
- 749:8065 Date 줄 내 옛 Button (hidden) — **변경 B에서 날짜 줄 하트가 제거된 잔재**
- 749:8072, 749:8094 Line 83 (hidden)
- 749:7923 Footer "image 26" (hidden)
- 749:8275 Rectangle 8265 — hidden 아니지만 **변경 영역 하이라이트 주석**이므로 제외

## 간격 체인 (수직 리듬, 1440)

```
Header(88) 
→ Banner 132 (abs 88~220)
→ 80px → Title 블록 시작 (abs 300)
   카테고리(29) → 4px → 제목(48) → 20px → 날짜(24)   [Title 총 125]
→ 60px → Tag 리스트(35) (abs 485)
→ 60px → 본문 Text (abs 580, h878.54 — 단락 gap 24)
→ 50px → Bottom 줄(40) (abs 1508.54)  ← Share 좌 / Heart 우
→ 70px → 디바이더 Line 84 (abs 1618.54)
→ 16px → 목록보기·이전/다음 행(24)
→ 40px → "더 많은 소식 살펴보기" 제목(29)
→ 16px → 관련 카드 행(283.92) (끝 abs 2027.46)
→ (Background 밴드 abs 1759.46~2357.46이 뒤에 깔림)
→ Footer (abs 2360~2459, h99)
```

좌우: 본문 컬럼 Wrap = **x270, w900** (1440 기준 좌우 270 대칭). Title/Tag/Text는 Wrap 안에서 +4px 들여쓰기(892w), Bottom·PrevNext·관련글은 900w 풀폭.

## 측정 포인트 (Playwright 검증 목록)

| # | 측정 항목 | 기대값 | selector |
|---|---|---|---|
| 1 | 본문 컬럼 폭·중앙 정렬 (1440 뷰포트) | w 900px, 좌우 여백 각 270px | |
| 2 | Banner 높이·배경 | 132px, #F2EFF4 | |
| 3 | Banner 하단 → 카테고리 텍스트 상단 | 80px | |
| 4 | 카테고리→제목 / 제목→날짜 간격 | 4px / 20px | |
| 5 | **날짜 줄에 하트 버튼 부재** | 날짜 텍스트 단독 (하트 미렌더) | |
| 6 | Title 하단→태그, 태그→본문 | 각 60px | |
| 7 | 본문 단락 간격 / 폰트 | gap 24px, 20px lh 1.5 #3E404E, 첫 단락 Bold | |
| 8 | 본문 하단 → Bottom 줄 | 50px | |
| 9 | **Heart 버튼: Bottom 줄 우측 끝 정렬** | 우측 edge = 본문 컬럼 우측 edge, 행 내 수직 중앙 | |
| 10 | Heart 버튼 박스 | h 35px (w 라벨 가변, 시안 155), border 1.3px #959BA9, radius full, padding L10/R12/V3, gap 6 | |
| 11 | Heart 내부 | 하트 아이콘 박스 24(벡터 18×16, stroke #959BA9), 라벨 18px SemiBold, 카운트 18px Heavy, 모두 #959BA9 | |
| 12 | Share 원형 버튼 | 40×40 ×3, gap 8, bg #F5F6F8, 아이콘 24×24 #4B5563 | |
| 13 | Bottom 줄 → 디바이더 / 디바이더 → prev/next 행 | 70px / 16px | |
| 14 | prev/next 행: 텍스트 16px SemiBold #1F2937, 화살표 20px, 목록보기 아이콘 24px | 좌 "목록 보기" / 우 "이전글|다음글" justify-between | |
| 15 | prev/next 행 → 관련글 제목 / 제목 → 카드 | 40px / 16px | |
| 16 | 관련 카드: 3열 w≈286.67 gap 20, 이미지 radius 14 aspect 313/170, 제목 18px Bold lh1.4 2줄 ellipsis | | |
| 17 | Background 밴드 그라데이션 | white→rgba(249,244,255,0.8), h 598, 관련글 뒤 | |
| 18 | ScrollButton | 55×55 원 rgba(65,68,72,0.78), 화살표 36 white, 우측 여백 90px | |
| 19 | Footer | h 99, bg #242424, 카피 16px SemiBold #F0E1FF | |

## 스크린샷

- `docs/design/audit-2026-06-10/figma-shots/news-detail-749-7920-1440.png` — 전체 프레임 (879×1500 축소본)
- `docs/design/audit-2026-06-10/figma-shots/news-detail-bottom-749-8083-1440.png` — Bottom 줄 (900×40 원본 크기)
- `docs/design/audit-2026-06-10/figma-shots/heart-component-114-8303-1440.png` — Heart 컴포넌트 세트 (186×72)
