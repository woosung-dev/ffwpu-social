<!-- KPI·Hero 섹션 Figma 정합 검증 기준 — Generator↔Evaluator 공용 SSoT (길이 중심 4앵커 ±2px) -->

# KPI · Hero 섹션 Figma 정합 검증 기준 (Criteria SSoT)

> 작성 2026-06-08. Figma `사회공헌국` node 96:5908. KpiSection.tsx / HeroBanner.tsx 정합 루프의 채점 기준.
> Generator(시니어 FE)·Evaluator(디자인+QA)가 이 문서를 진실 공급원으로 사용한다.
> 출처: Figma `get_metadata`(좌표) + `get_design_context`(폰트·색·radius·padding). 코드 토큰 대조 완료.

## 0. 측정·허용오차

- **측정 기준점**: 각 섹션 `SectionContainer`(Contents) 박스 좌상단 기준 상대좌표. Contents 폭은 `md:648 / lg:905 / wide:1200`, 모바일 `100%−32`.
- **앵커 4BP**: 375 / 768 / 1024 / 1440 (viewport width). 1024 는 Figma **1025 밴드** 수치로 대조(코드 `lg:`=1024 = Figma 데스크탑 905 벤토; `SectionContainer lg:max-w-905` 가 매핑 확정).
- **허용오차**: width/height/gap/padding **±2px** · 카드 비율 **±1.5%** · 폰트 computed size **±1px** · 가로 오버플로 **0(불가)**.
- **앵커 사이 폭**(예 900·1200): 구조 검증만(순서·오버플로0·비율 단조). 정확 px 강제 안 함 → clamp/flex 유동 유지.
- **radius**: 전 카드 20px, CTA·메뉴 pill 999px(full). 곡선은 시각+computed 검증.

---

## 1. KPI 섹션

### 1.1 공통 구조 (전 BP)
- 6카드 벤토 **전 BP 유지**(375 포함, 2열). 거터 균일: **1440·1025=16 / 768·1024≈10 / 375≈6**.
- 헤딩↔대시보드: **1440(wide)만 side-by-side**(헤딩 251 + gap70 + 대시보드). **1025·1024·768·375 stacked**(풀폭 헤딩 위, gap = 1025/768=40·375=30).
- 데스크탑 벤토(lg·wide): 대시보드 **h=760 고정**, Row1 **226** / row gap **16** / Row2 **518**. (lg·wide 동일 — 현재 `wide:h-[760px]` 만 → **lg 에도 적용 필요**.)
- radius 20px. label 색 #343434(gray)·#3b4700(lime)·#fff(purple). 값 `tabular-nums`.

### 1.2 폰트 (Figma 1440, SUIT) — 전 데스크탑 공통, 모바일 비례 축소
| 텍스트 | size | weight | line-height |
|---|---|---|---|
| 헤딩 "한 해동안 만들어낸 변화" | 36px | Bold | 1.3 |
| 본문 copy | 16px | Medium | 1.5 |
| 카드 label(4종) | 20px | SemiBold | normal |
| 값 누적봉사자 | 52px | Bold | normal |
| 값 봉사활동 횟수 | 52px | Bold | normal |
| 값 누적봉사기간 | 45px | Bold | normal |
| 값 도움가정수 | 42px | Bold | normal |
> 현 코드 폰트 ✅ 일치(헤딩 36/본문 16/label 20/값 52·45·52·42). 모바일은 clamp 축소 — 375/768 앵커에서 box 높이로 ±1px 검증.

### 1.3 카드 내부 패딩 (Figma 1440)
| 카드 | padding | 비고 |
|---|---|---|
| 스마일(보라) | px-84 py-70 | 아이콘 중앙(121×86) |
| 누적봉사자(gray) | **px-24 py-20** | label·값 gap-4 |
| 누적봉사기간(gray) | **px-30 py-20** | ⚠️ 코드 px-6(24) → **px-[30px] 재정렬** |
| Sow Good(yellow) | px-45 py-88 | 로고 204×49 중앙 |
| 봉사활동 횟수(lime) | px-24 py-20, gap-31 | ⚠️ 코드 gap-6(24) → label↔(일러스트+값) gap ~31 검토 |
| 도움가정수(보라) | 텍스트블록 px-24 py-20, 카드 gap-40 | gap wide=40 ✅ / lg gap 확인 |

### 1.4 앵커별 geometry (Contents 상대좌표, px)

#### 1440 (wide) — Contents 1200×760, 패딩 L/R120·T96·B96
- 헤딩 251×182 (side-by-side), 헤딩→대시보드 **gap 70**, 대시보드 879×760.
- Row1(h226): 스마일 293×226 · 누적봉사자 570×226(x309). 거터16.
- Row2(h518): 좌블록607 + gap16 + 우블록256. 좌블록 내부 — 상단 [누적봉사기간 295.5×225 + gap16 + SowGood 295.5×225], gap16, 하단 봉사활동횟수 607×277. 우블록 도움가정수 256×518.

#### 1024 (lg) — Contents 905×877, 패딩 L/R60·T/B90.5
- 헤딩 905×77 **stacked**, gap **40**, 대시보드 **905×760**.
- Row1(h226): 스마일 293×226 · 누적봉사자 **596**×226(x309). 거터16.
- Row2(h518): 좌블록607 + gap16 + 우블록 **282**. (1440 대비 폭만 ↑, 비율·높이 동일)

#### 768 (md) — Contents 648×723, 패딩 L/R60
- 헤딩 648×101 **stacked**, gap **40**, 대시보드 648×582.
- Row1(h180): 스마일 200×180 · 누적봉사자 438×180(x210). 거터**10**.
- Row2(h392): 좌 [누적봉사기간 200×180 + SowGood 200×180(x210)] / 봉사활동횟수 410×202, 우 도움가정 228×392(x420).

#### 375 (mobile) — Contents 343×456, 패딩 L/R16
- 헤딩 343×73 **stacked**, gap **30**, 대시보드 343×353.
- Row1(h115): 스마일 115×115 · 누적봉사자 222×115(x121). 거터**≈6**.
- Row2(h232): 좌 [누적봉사기간 199×106.5 / SowGood 199×119.5] / 봉사활동횟수, 우 도움가정 138×232(x205).
> 375 Sow Good 노출 여부: Figma 375 에 SowGood block 존재(99:7073) → 현 코드 `sm:flex`(640↑)로 375 숨김. **재검토**: Figma 375 는 SowGood 표시 → 노출로 정렬 검토(단 좁은폭 오버플로 0 우선).

---

## 2. Hero 섹션

### 2.1 공통
- 정적(DB무관). 좌측 Title(헤드라인+CTA) + 우측 flower. 하단 convex 곡선.
- 헤드라인 Gmarket Sans Medium(미로드 시 SUIT), **#3a0f62**. CTA bg **#3c1264**, radius full, 화살표.
- 곡선: Figma 거대 ellipse(BannerBackground). 코드 CSS `border-bottom-radius` 근사 — 시각+깊이 대조.

### 2.2 폰트·색 (Figma 1440)
| 요소 | size | weight | color |
|---|---|---|---|
| 헤드라인 | 60px | Medium(Gmarket) | #3a0f62 lh1.25 |
| CTA 텍스트 | 20px | Bold(SUIT) | **#e9d1ff** (⚠️ 코드 토큰 ink-on-purple=#f0e1ff. 미세차 — 디자인 평가자 판단; 공유토큰이라 분리신중) |
> 헤드라인 px·CTA px·radius·padding(px-26 py-12) ✅ 코드 일치.

### 2.3 앵커별 geometry (px)
| 앵커 | Banner h | Contents pad | 헤드라인 box | CTA w×h(pad) | flower w×h, x | 곡선 가시깊이 |
|---|---|---|---|---|---|---|
| **1440** | 740(헤더88) | L/R120, 헤더아래40 | y100 554×150(2줄) | 232×49 (l26 t12) | **560×511**, x640 | ~51px |
| **1024** | 533(헤더88) | L/R60, top128 | y40 388×106 | 232×49 (l26 t12) | **400×365**, x505 | ~46px |
| **768** | 450 | L/R60, top110 | y60 295×80 | 190×40 | **320×292**, x328 | (ellipse 2301×1154) |
| **375** | 241 | L/R16, top54 | y30 222×60 | 155×29 | **150×137**, x193 | (ellipse 777×389) |

⚠️ **재정렬 대상**:
- flower 폭: 앵커별 **375=150 / 768=320 / 1024=400 / 1440=560**. 현 코드 `lg:w-[clamp(330px,30vw,430px)]`(1440 max430·1024 ~330) → **상향**. 모바일 `clamp(150px,40vw,340px)`(375=150 ✓).
- 곡선 깊이: 1440 ≈51px(현 ~90px 과다). 앵커별 가시깊이로 보정(border-radius 유지하되 vertical radius↓).
- CTA 텍스트 색: §2.2 참조.

---

## 3. ui-ux-pro-max 횡단 기준 (전 BP)
- **접근성**: 본문 ≥16px. 대비 4.5:1(라임 #3b4700/#dcef7d ≈ 8.9:1 ✅, 보라카드 흰색/#b769ff ≈ 2.6:1 ⚠️ — 큰글씨(42px≥24px Bold)는 3:1 기준 통과). `aria-labelledby="kpi-heading"` 유지. 장식 `alt="" aria-hidden`.
- **반응형**: 모바일우선·가로스크롤0(앵커+중간폭)·페이지 고정폭 금지(카드 내부 px 허용).
- **타이포/색**: 폰트 size 종류 ≤5/뷰. 색은 토큰 경유(hex 직박기 금지). `tabular-nums`.
- **anti-slop**: shadow 남발 금지·4배수 간격·AI 팔레트 금지·hover 3중효과 금지.
- **성능**: img width/height 명시(CLS0)·곡선/flower transform.

## 4. PASS 조건
1. QA: 4앵커 모든 length 델타 `withinTol`(±2px) + 가로오버플로0 + 폰트 ±1px + 대비 통과.
2. Design: 4앵커 스크린샷 vs Figma — 곡선·색·배치·겹침·줄바꿈·anti-slop 무지적(또는 low 만 허용+사유).
3. tsc0 · lint0.

## 5. 검증 결과 (2026-06-08, Generator↔Evaluator 루프)

> 측정 = Playwright `getBoundingClientRect`(스크롤바 숨김, Contents 상대좌표), 4앵커 viewport 375/768/1024/1440. tsc0·lint0·build✓. KPI 3라운드·Hero 2라운드 수렴. QA(수치)·Design(시각) 양쪽 PASS.

### KPI — 전 앵커 ±2px, 가로오버플로 0 (320 포함)
| 앵커 | 대시보드 | Row1/Row2 | 핵심 카드 (측정) | 폰트 |
|---|---|---|---|---|
| 1440 | 879.4×760 (헤딩 251 + gap70) | 226/518 | 스마일293×226·봉사자570×226·기간295.5×225·SowGood295.5×225·횟수607×277·가정256×518 | 36/52/45/52/42 ✓ |
| 1024 | 905×760 (stacked, gap40) | 226/518 | 봉사자596×226·기간295.5×225·SowGood295.5×225·횟수607×277·가정282×518 | 45/52 ✓ |
| 768 | 648×582 (stacked, gap40) | 180/392 | 스마일200·봉사자438·기간200·SowGood200·횟수410×202·가정228×392 | 정합 |
| 375 | 343×353 (stacked, gap30) | 115/232 | 스마일115·봉사자222·기간199·횟수199×120·가정138×232 (SowGood 미표시=Figma 정합, +/별 deco 표시) | 정합 |

핵심 수정: 대시보드 `lg:h-[760px]`(이전 wide 한정)·`wide:flex-1`(lg flex-basis 붕괴 해소)·Row1/sub-row 고정높이·period↔SowGood `grid grid-cols-2`(flex 균등분할 불가 → 그리드 강제)·데스크탑 값폰트 고정(45/52)·스마일 고정폭·deco 375 노출·helped `whitespace-nowrap`.

### Hero — 전 앵커 ±2px, 가로오버플로 0 (320~1920)
| 앵커 | 섹션h | 헤드라인 | CTA | flower | 곡선깊이 |
|---|---|---|---|---|---|
| 1440 | 612 | y100 60px 2줄 | 231×48 (텍스트20) | 560×511 @x640 | 51.3 |
| 1024 | 405 | y40 43px | 231×48 | 400×365 @x505 | 46.3 |
| 768 | 340 | y60 32px | 189×38 | 320×292 @x328/y48 | — |
| 375 | 187 | y30 24px | 158×30 | 150×137 @x193/y49 | — |

핵심 수정: flower 앵커별 폭(150/320/400/560)·헤드라인 `clamp(1.5rem,4.2vw,3.75rem)`·곡선 `clamp(28px,calc(34px+1.2vw),57px)`(이전 90px 과대)·`items-start`+per-BP `pt`/`min-h`(top-align)·모바일 flower `right-8 md:right-0`+`translate-y-[calc(-50%+24px)]`.

### 잔여 (코드 외 차단)
- **헤드라인 폰트** Gmarket Sans Medium 미로드 → SUIT fallback. 폰트 크기·위치·2줄 줄바꿈은 정합, 글자 폭만 미세 차(라이선스 확인 대기 — `docs/TODO.md`). 레이아웃 버그 아님.

### 측정 훅
`data-fid` 속성(KPI 11종·Hero 4종)을 회귀 검증용으로 잔존. 시각 무영향.
