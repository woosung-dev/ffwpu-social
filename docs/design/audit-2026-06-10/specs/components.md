<!-- Figma 스펙 추출 — 컴포넌트 시트 + 디자인 토큰 (audit 2026-06-10) -->

> 출처: Figma fileKey `lmjjU4UxUpK2pDi67BGRiW`, 섹션 「컴포넌트」 `97:10250` (3418×2464).
> 값은 Figma 원본 수치 그대로 (소수점 둘째 자리 반올림). 스크린샷: `../figma-shots/`.

## 프레임 개요

| 프레임 | nodeId | 크기 | 스크린샷 |
|---|---|---|---|
| Card 마스터 (12변형) | 114:8164 | 1344×1416 | card-114-8164-all.png |
| Heart (2변형) | 114:8303 | 186×72 | heart-114-8303-all.png |
| Menu/Tap (4변형) | 9:3300 | 331×140 | menu-9-3300-all.png |
| Header (4 BP 변형) | 97:9431 | 1480×645 | header-97-9431-all.png |
| Pagination (마스터 없음 — 인스턴스) | 125:9154 | 120×32 | (소식_전체 1440 내) |
| (구) Card 단독 심볼 | 44:1840 | 277.67×425 | — 미사용 추정, 추출 제외 |

---

## 요소 스펙

### 1. Card 마스터 (114:8164) — Size 1~4 × Default/None/Hover

#### 공통 구조 (전 변형)

- 루트: flex-col, overflow-clip. Size=1 루트에 반응형 클램프: max-w 400.00 / min-w 200 / max-h 362.60 / min-h 181.30.
- ImageContainer: **aspect 313/170 (≈1.84:1), radius 14px, w-full**, 내용 center, overflow-clip.
- 카테고리 색 **#B35FEB** (토큰 미등록 raw hex), 제목 색 #1F2937 (GraySacle/Black), 날짜 색 #959BA9 (GraySacle/SubText3).
- 제목: SUIT Bold, ellipsis, outer max-h 44 / inner max-h 52 (≈2줄 클램프).

#### Size별 수치

| 항목 | Size=1 (384×348) | Size=2 (313×310) | Size=3 (288×296) | Size=4 (200×237) |
|---|---|---|---|---|
| nodeId (Default/None/Hover) | 114:8192 / 8201 / 8210 | 114:8165 / 8174 / 8183 | 114:8219 / 8228 / 8237 | 114:8246 / 8255 / 8264 |
| 이미지 영역 높이 (w×170/313) | 208.56 | 170 | 156.42 | 108.63 |
| 텍스트랩 padding | pt 12 / px 2 / **pb 0** (None만 pb 14) | pt 12 / px 2 / pb 14 | pt 12 / px 2 / pb 14 | pt 10 / **px 0** / pb 12 |
| 텍스트블록↔날짜 gap | 20 | 20 | 20 | 16 |
| 카테고리↔제목 gap | 4 | 4 | 4 | 2 |
| 카테고리 font | SUIT Bold 14 / lh 1.6 | 동일 | 동일 | SUIT Bold **13** / lh 1.6 |
| 제목 font | SUIT Bold 18 / lh 1.4 | 동일 | 동일 | SUIT Bold **17** / lh **1.2**, max-h 44 |
| 날짜 font | SUIT Medium 16 / lh 1.5 | 동일 | 동일 | SUIT Medium **15** / lh 1.5 |
| Heart 표시 | ✅ (카테고리 행 우측, justify-between) | ❌ | ❌ | ❌ |
| Hover 이미지 크기 (컨테이너 대비) | 398×216 (스케일 ≈+4.2%) | 335×182 (≈+7.0%) | 306×168 (≈+6.3%) | 210×117 (≈+5.0%) |
| None "보도자료" font (이미지영역 중앙) | SUIT Bold **26** white lh 1.5 | SUIT Bold **22** white lh 1.5 | SUIT Bold **18** white lh 1.5 | SUIT Bold **16** white lh 1.5 |

#### 상태 정의

- **Default**: 이미지 fill(object-cover, 컨테이너 꽉 채움) + 텍스트.
- **Hover**: **이미지 줌만** — 이미지가 컨테이너보다 크게 렌더(위 표, 중앙 정렬·클립). 오버레이/그림자/텍스트 변화 **없음**. Heart는 Size=1에서 Default와 동일 유지. (시트상 Hover 프레임 382×346으로 -2px은 캔버스 배치 아티팩트.)
- **None** (이미지 없음): ImageContainer에 **그라디언트 #7B2AC7 → #AC69EA (top→bottom)** + 중앙 "보도자료" 흰 텍스트(위 표 크기). 카테고리 행에 Heart 없음.

### 2. Heart (114:8303)

| 항목 | Default (114:8302, 60×32) | Click (114:8301, 59×32) |
|---|---|---|
| 컨테이너 | border 없음·bg 없음. flex, gap 4, **pl 10 / pb 10** (히트영역 확장 패딩) | 동일 |
| IconSet 박스 | 20×20, p 1.67, radius 6.67 | 동일 |
| 하트 아이콘 | 15×13.33, **outline**: stroke #B35FEB, fill none | 15×13.33, **filled**: fill #B35FEB + stroke #B35FEB |
| 카운트 | SUIT Bold 14 / lh 1.6 / **#B35FEB** ("264") | 동일 스타일 ("265" — 폭 차이로 59px) |

### 3. Menu/Tap (9:3300)

| 변형 | nodeId | box | padding | font | 색 | border/bg |
|---|---|---|---|---|---|---|
| Size=L, On | 9:3299 | 128×40 | px 20 / py 10 | SUIT ExtraBold 16 (lh normal) | #501F7E | bg white, border #501F7E (마스터 추출 1px 표기·헤더 인스턴스 1.6px — §특이사항), radius 999 |
| Size=L, Off | 9:3301 | 128×40 | px 20 / py 10 | SUIT Bold 16 | rgba(36,36,36,0.6) | 없음 |
| Size=M, On | 97:10386 | 109×33 | px 16 / py 8 | SUIT ExtraBold 14 | #501F7E | bg white, border #501F7E, radius 999 |
| Size=M, Off | 97:10388 | 109×33 | px 16 / py 8 | SUIT Bold 14 | rgba(36,36,36,0.6) | 없음 |

### 4. Header (97:9431) — 4 BP

공통: 컴포넌트 시트 bg **#B769FF는 표시용 배경** (실페이지 인스턴스 배경과 별개). 활성 메뉴 = Menu On pill(bg white·border 1.6px #501F7E·radius 999), 비활성 = **흰색 텍스트** (Menu 마스터 Off의 rgba(36,36,36,0.6)를 white로 override). 검색 Button: **폭 42 / h-full(헤더 높이)**, radius 95, 내부 IconSet 28×28(p 2.33), 아이콘 18.67×18.67.

| 항목 | 1440 (97:9432, 1440×88) | 1025 (97:9588, 1025×88) | 768 (97:9640, 768×70) | 375 (97:9691, 375×54) |
|---|---|---|---|---|
| 좌우 패딩 | 120 (inner Wrap 1200) | 60 (inner 905) | 60 (inner 648, 그룹 gap 20) | 16 |
| 로고 | 80×53.33 | 80×53.33 | 63×42 | 63×42 |
| nav 메뉴 | 4개, Size=L (px20 py10, font 16), gap **24** | 동일 (gap 24) | 4개, Size=M (px16 py8, font 14), gap **4** | **풀 내비 없음** — 활성 pill 1개(M On) + 검색만. pill↔검색 gap 16 (pill 그룹 내 gap 10) |
| 검색 아이콘 stroke | white, 2px | white, 2px | white, 1.5px | **#242424, 1.5px** (§특이사항) |

### 5. Pagination (마스터 미존재 — 인스턴스 125:9154, 소식_전체 1440)

- 전체 120×32 = 셀 4개(◀ disable · 1 active · 2 default · ▶ default) **연접 (gap 0)**.
- 셀: **30×32, p 10, radius 8**, flex 중앙정렬.
- 페이지 숫자: **Pretendard 14** (SUIT 아님 — §특이사항).
  - active(click): Pretendard **Medium**, **#501F7E** (인스턴스 override — 마스터 기본은 keycolor2 #00AB89로 외부 라이브러리 잔재, 사용 금지).
  - default: Pretendard **Regular**, **#6B7280** (graysacle/subtext2).
- 화살표: IconSet 12×12 (p 1, radius 4), 셰브론 vector **5×9** (viewBox 5.88×9.88), stroke-width 0.875, linecap/linejoin round. 좌측 = 우측 셰브론 rotate 180.
  - enabled: stroke **#6B7280** / disabled: stroke **#BAC2D0**.

---

## 디자인 토큰 (get_variable_defs @97:10250)

| 토큰 이름 (Figma 원문) | 값 | 비고 |
|---|---|---|
| KeyColor | #501F7E | 메뉴 active·pagination active |
| KeyColor2 | #F4B600 | — |
| GraySacle/Black | #1F2937 | 카드 제목 ("GraySacle" 오탈자 원문 그대로) |
| GraySacle/SubText3 | #959BA9 | 카드 날짜 |
| GraySacle/Background | #FFFFFF | 카드 None "보도자료" 텍스트 |

### 토큰 미등록이지만 컴포넌트에서 반복 사용되는 raw 값

| 용도 | 값 |
|---|---|
| 카테고리 라벨·하트 아이콘·하트 카운트 | #B35FEB |
| 카드 None 그라디언트 | #7B2AC7 → #AC69EA (to bottom) |
| 헤더 시트 배경(표시용) | #B769FF |
| Menu Off 텍스트 (마스터) | rgba(36,36,36,0.6) |
| pagination default 숫자·enabled 화살표 (graysacle/subtext2, 외부 토큰) | #6B7280 |
| pagination disabled 화살표 | #BAC2D0 |
| 375 검색 아이콘 stroke | #242424 |

### 타이포 사용 정리 (컴포넌트 시트 범위)

| 사용처 | 폰트 |
|---|---|
| 카드 카테고리/제목/하트 카운트/None 라벨 | SUIT Bold 13~26 |
| 카드 날짜 | SUIT Medium 15~16 |
| 메뉴 On | SUIT ExtraBold 14/16 |
| 메뉴 Off | SUIT Bold 14/16 |
| 페이지네이션 숫자 | Pretendard Regular/Medium 14 |

---

## 간격 체인 (카드 수직 리듬)

Size 1~3: `이미지(313:170) → 12px → 카테고리(14/1.6≈22.4h) → 4px → 제목(18/1.4, ≤2줄) → 20px → 날짜(16/1.5) → pb(0|14)`
Size 4: `이미지 → 10px → 카테고리(13/1.6≈20.8h) → 2px → 제목(17/1.2) → 16px → 날짜(15/1.5) → 12px`

텍스트랩 전체 높이: Size1 139.44 / Size2 140 / Size3 139.58 / Size4 128.37 (전체높이 − 이미지영역).

헤더: 로고·메뉴·검색 모두 수직 center. 셀 간 수평 gap = 24(1440/1025) / 4+그룹20(768) / 16(375).

---

## 측정 포인트 (라이브 Playwright 검증 목록)

| # | 측정 항목 | 기대값 | selector |
|---|---|---|---|
| 1 | 카드 이미지 컨테이너 border-radius | 14px | |
| 2 | 카드 이미지 aspect-ratio (w/h) | 313/170 ≈ 1.841 | |
| 3 | 카드 이미지→카테고리 간격(pt) | 12px (200px급 카드 10px) | |
| 4 | 카테고리↔제목 gap | 4px (200px급 2px) | |
| 5 | 제목블록↔날짜 gap | 20px (200px급 16px) | |
| 6 | 카드 제목 font-size/line-height | 18px/1.4 (200px급 17px/1.2), 2줄 클램프 | |
| 7 | 카테고리 색/크기 | #B35FEB, 14px (200px급 13px) | |
| 8 | 날짜 색/크기 | #959BA9, 16px (200px급 15px) | |
| 9 | 카드 hover 효과 | 이미지 scale ≈1.04~1.07만, 오버레이·그림자 없음 | |
| 10 | 커버 없는 카드 fallback | 그라디언트 #7B2AC7→#AC69EA + 중앙 흰 텍스트 | |
| 11 | 하트: 아이콘 크기/카운트 | 아이콘 15×13.33 (박스 20), 카운트 SUIT Bold 14 #B35FEB | |
| 12 | 하트 토글 상태 | 미클릭 outline / 클릭 filled, 둘 다 #B35FEB | |
| 13 | 헤더 높이 | 88px(≥1025) / 70px(768) / 54px(375) | header |
| 14 | 헤더 좌우 패딩 | 120(1440) / 60(1025·768) / 16(375) | |
| 15 | 헤더 로고 크기 | 80×53.33(≥1025) / 63×42(≤1024) | |
| 16 | nav 활성 pill | bg white, border 1.6px #501F7E, radius 999, px20/py10(≥1025)·px16/py8(≤1024) | |
| 17 | nav 폰트 | 16px(≥1025) / 14px(≤1024); active ExtraBold·inactive Bold white | |
| 18 | nav 항목 gap | 24px(≥1025) / 4px(768) | |
| 19 | 375 헤더 구성 | 로고 + 활성 pill 1개 + 검색 (풀 내비 없음) | |
| 20 | 검색 버튼/아이콘 | 버튼 42w, 아이콘 박스 28, 아이콘 18.67 | |
| 21 | 페이지네이션 셀 | 30×32, radius 8, gap 0 | |
| 22 | 페이지네이션 숫자 | 14px; active #501F7E Medium / default #6B7280 Regular | |
| 23 | 페이지네이션 화살표 | 5×9 셰브론, enabled #6B7280 / disabled #BAC2D0 | |

---

## 특이사항 (모호·해석 필요)

1. **Pagination 마스터 컴포넌트가 이 파일에 없음** — 인스턴스(`Pagenation_interaction`)만 10곳. 마스터의 active 기본색은 keycolor2=#00AB89(외부 라이브러리 토큰, 이 파일 KeyColor2=#F4B600와 불일치). **인스턴스 override #501F7E가 정답.**
2. **375 검색 아이콘 stroke #242424** — 다른 3개 BP는 white. 디자이너 의도(모바일 흰 배경 가정) vs Figma 누락 모호. [확인 필요]
3. **Menu border 두께** — Menu 마스터 단독 추출 시 `border`(1px)로, Header 내 인스턴스는 `border-[1.6px]`로 렌더됨. 1.6px 채택 권장. [확인 필요]
4. **Size=1 텍스트랩 pb 불일치** — Default/Hover는 pb 0, None만 pb 14 (Size 2·3은 전 상태 pb 14). 디자인 실수로 추정, 코드는 pb 14 통일이 합리적. [가정]
5. **Hover 줌 비율이 사이즈마다 다름** (+4.2/+7.0/+6.3/+5.0%) — 정확 비율 의도라기보다 수동 배치로 추정. 코드 구현은 scale 1.05 내외 단일값이 현실적. [가정]
6. **Heart의 pl10/pb10 비대칭 패딩** — 카드 우상단 배치 시 히트영역 확장 목적으로 해석. 60×32 박스 자체가 보더/배경을 갖지 않음.
7. **페이지네이션 숫자만 Pretendard** (나머지 전부 SUIT) — 의도 여부 [확인 필요].
8. 토큰 이름 오탈자 "GraySacle" (Grayscale) — Figma 원문 그대로 기록.
9. 헤더 컴포넌트의 bg #B769FF는 컴포넌트 시트 표시용. 실페이지 헤더 배경은 페이지 프레임 기준으로 별도 확인 필요.
10. 구 Card 심볼(44:1840, 277.67×425)이 시트에 잔존 — 12변형 마스터(114:8164)와 별개. 미사용 추정으로 추출 제외.
