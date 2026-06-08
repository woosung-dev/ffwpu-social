# StorySection Figma 4-BP 정합 기준 (SSoT)

> 랜딩 "밥이 사랑입니다" StorySection(`src/client/sections/StorySection.tsx`)의 Figma 픽셀 정합 기준.
> Figma 파일 `lmjjU4UxUpK2pDi67BGRiW` node 96-5908(랜딩 전체)의 BP별 시안 프레임에서 직접 역측정(2026-06-08).
> 측정 하네스: [[figma_fidelity_measurement_harness]] — Playwright `getBoundingClientRect` + `data-fid` + Generator↔Evaluator 루프.

## 근본 원인 (이번 수정 트리거)

데코 스티커(SOW/heart/sparkles/Go/od)가 **image1/image2 폭의 단일 % 비율**(SOW=`w-[44%]`)로 사이징됨.
image1은 `flex-1`이라 폭이 비단조(非單調) — md(768~1023)에서 행이 `w-full`(648)인데 image2만 186px 고정이라 **image1이 450px로 부풀어 SOW=198px(전 구간 최대)**, 정작 데스크탑 lg에서는 행이 545px로 묶여 image1=347·SOW=153으로 더 작음.
→ 작은 뷰포트(md)가 큰 뷰포트(lg)보다 SOW가 큰 역전. **Figma는 데코를 BP별 고정 px로 배치**(375·767 SOW 둘 다 90.6px). 정답 = % 폐기 후 **discrete 고정 px**.

## 레이아웃 전환점

| 코드 BP | 범위 | Figma 프레임 | 레이아웃 | content | 비고 |
|---|---|---|---|---|---|
| base | 0~767 | 375 / 767 | stacked | vw−32 | image2 **165px 고정**, image1 유동 |
| `md:` | 768~1023 | 768 / 1024 | stacked | 648 | image1=450 고정 |
| `lg:` | 1024~1439 | 1025 / 1439 | side-by-side | 905 | row 545(img) + text 360 |
| `wide:` | 1440~ | 1440 | side-by-side | 1200 | img group 817 + text 383, gap 0 |

> ⚠️ Figma는 1024=stacked / 1025=side-by-side. 코드 `lg:`는 1024부터 side-by-side(1px 경계차, 무시). **측정 시 md/stacked는 viewport 1023, lg/side-by-side는 viewport 1280으로 비교**(1024는 경계 모호).

## 이미지 구성 (px, Figma)

| BP | content | img group | image1 (w×h) | image2 (w×h) | gap | text |
|---|---|---|---|---|---|---|
| 375 | 343 | 343(full) | 172×221 | **165**×221 | 6 | full 아래 |
| 767 | 729 | 729(full) | 558×221 | **165**×221 | 6 | full 아래 |
| 768 | 648 | 648(full) | 450×294 | 186×294 | 12 | full 아래 |
| 1024(stacked) | 648 | 648 | 450×294 | 186×294 | 12 | full 아래 |
| 1025(lg) | 905 | 545 | 347×333 | 186×333 | 12 | 360 우측 |
| 1440(wide) | 1200 | 817 | 527×425 | 278×425 | 12 | 383 우측 |

**핵심**: 모바일(375~767) image2=**165px 고정**(유동 % 아님), 높이=**221 고정**, gap=6.

## 데코 스티커 (w×h px + anchor 이미지 박스 기준 offset left,top)

SVG 비율 보존(`h-auto`). SOW·heart는 **image1 박스**, sparkles·Go·od는 **image2 박스** 기준(`relative` 부모).

### SOW (image1) — rotate −5°
| BP | w | left | top |
|---|---|---|---|
| base | 91 | −16 | −30 |
| md | 110 | −18 | −30 |
| lg | 127 | −33 | −31 |
| wide | 167 | −25 | −31 |

### heart (image1) — 모바일은 image1 안쪽 상단, md+는 좌측 오버행 중단
| BP | w | left | top |
|---|---|---|---|
| base | 39 | 78 | −41 |
| md | 45 | −23 | 48 |
| lg | 52 | −33 | 79 |
| wide | 69 | −45 | 90 |

### sparkles (image2) — 우상단
| BP | w | left | top |
|---|---|---|---|
| base | 40 | 132 | −30 |
| md | 49 | 159 | −28 |
| lg | 56 | 154 | −29 |
| wide | 82 | 221 | −41 |

### Go (image2) — 좌하단 오버행, rotate −3°
| BP | w | left | top |
|---|---|---|---|
| base | 72 | −29 | 183 |
| md | 88 | −56 | 242 |
| lg | 101 | −67 | 276 |
| wide | 119 | −82 | 354 |

### od (image2) — 우하단, rotate +5°
| BP | w | left | top |
|---|---|---|---|
| base | 68 | 119 | 192 |
| md | 84 | 151 | 245 |
| lg | 97 | 154 | 287 |
| wide | 115 | 237 | 357 |

## 합격 기준

- 길이(폭·높이) 우선 ±2px, 위치(offset) ±4px. 데코는 ±6px 허용(SVG 시각 무게 중심 오차).
- 리사이즈 시 구간 내 연속 스케일 0 (각 BP 내 고정 px). [[figma_fidelity_measurement_harness]] discrete 원칙.
- `data-fid`: `story-img1` `story-img2` `story-sow` `story-heart` `story-sparkles` `story-go` `story-od` (회귀용 잔존).

## ⚠️ 회전 데코 측정 주의 (필독 — 회귀 검증 시)

SOW(−5°)·Go(−3°)·od(+5°)는 Tailwind v4가 **`rotate:` CSS 속성**으로 회전한다. `getBoundingClientRect().width`는 **회전된 축정렬 bounding box**를 돌려줘 실제 폭보다 크다(예: SOW 110px → bbox 115px = 110·cos5°+63·sin5°). offset-top도 위로 확장돼 −31 → −38로 측정된다.
→ **회전 데코는 반드시 `element.offsetWidth`/`offsetHeight`(레이아웃 폭, transform 무시)로 측정**할 것. heart·sparkles(회전 없음)는 bbox=offset 으로 무관.
2026-06-08 1차 Evaluator가 이 함정으로 SOW/Go/od 12건을 오탐(FAIL)했으나 offsetWidth 재측정 결과 전 BP 목표값 정확 일치(PASS) 확정.

## 수용된 차이 (버그 아님)

- **img1 @ 767**: 코드 564 vs Figma 558(+6). Figma 767 프레임이 padding 19px(375는 16px)인데 SectionContainer는 mobile 전 구간 `px-4`(16px) 고정 → content 735 vs Figma 729. 모바일 유동 패딩 표준값(16) 유지가 타당, 6px 수용. px-4 변경은 전 섹션 영향이라 금지.
