<!-- 랜딩 디자인 검수 리포트 — A(사용자 수동)+B(Figma 픽셀)+C(자동 스윕) 통합. branch review/landing-fidelity → PR into feat/client-foundation -->

# 랜딩 디자인 검수 리포트 (2026-06-03)

> 브랜치 `review/landing-fidelity` (분기점 `feat/client-foundation` `f1cbef7`). 수정은 이 브랜치에 atomic commit → base=`feat/client-foundation` PR.
> 출처 라벨: **[A]** 사용자 수동 · **[B]** Figma 픽셀 대조 · **[C]** 자동 스윕(나).

## 검수 대상
라이브 `localhost:3000`. 랜딩 7면(Header·Hero·KPI·Story·ArticleGrid·Partners·Footer) + `/news` + `/news/[id]`. BP 375/768/1024/1440 (+경계 320/767/773/1025/1280/1920).

---

## C. 자동 스윕 결과 (baseline)

### C-0 기본 건전성
- 콘솔 에러 **0** (browse `console --errors`, 1440/768/1024/375 전 폭).
- 가로스크롤 **0** — 320/375/767/768/773/1024/1025/1280/1440/1920 (이번 세션 검증, 동일 코드).
- 7면 전부 렌더·배치 정상(풀페이지 캡처 `/tmp/review/landing-{375,768,1024,1440}.png`). 팔레트(보라·라임·노랑)·라운딩 일관, 명백한 AI slop/깨짐 없음.

### C-1 디자인 시스템 추출 (라이브 1440)
- **폰트 2개**: SUIT(본문) + Gmarket Sans Medium(Hero h1). ≤3 ✅ 일반 폰트 아님. (Geist는 next dev 오버레이, 무관)
- **팔레트**: 보라 #b769ff + 라임 #dcef7d + 노랑 #ffcf41 + ink/gray 중립. 일관, AI-slop 보라 그라디언트 **아님** ✅
- **헤딩**: H1 60px/500(Gmarket) · H2 36/32/31px(KPI/Story/ArticleGrid) weight 700·700·800.
- **데스크탑 터치타깃 <44px: 0** ✅ · **콘솔 에러 0** ✅ · 본문 16px ✅

### C-2 자체 감사 발견 (Figma 무관 일반 품질·a11y)
| # | 섹션 | BP | 관찰 | 심각도 | 상태 |
|---|------|----|------|--------|------|
| C1 | 전 섹션 | 1440/768 | 구조·정렬·간격 일관, slop 없음, 명백한 결함 없음 | info | — |
| C2 | Hero CTA | 375 | "지난 활동 살펴보기" 높이 **40px** — 터치타깃 44px 미달(`py-2.5`) | medium | 후보 |
| C3 | Header 검색 | 375 | 검색 아이콘 버튼 20×20 — 44px 미달(단 disabled, 준비중) | low | 후보 |
| C4 | Footer | 375 | 카피라이트 텍스트 **10px** — 캡션 12px 미만(`text-[10px]`) | low | 확인 |
| C5 | 섹션 H2 | 전 | 36/32/31px·700/800 비균일 — Figma 섹션별 사이즈일 가능성, B에서 확인 | polish | B대기 |

> C2(Hero CTA 44px)는 접근성 절대제약(WCAG AA)이지만 4px 차이라 Figma 의도와 충돌 가능 → B(Figma) 확인 후 확정. 나머지는 통합 단계에서 우선순위화.
> gstack `/design-review` 본 실행(codex 소스 감사 병행) 결과는 아래 C-3에 누적.

### C-3 codex 소스 디자인 감사 (완료)
> 독립 시각(codex high-effort, read-only). **랜딩 관련만** 추림 — 다수 a11y 항목은 /news 페이지(sub-banner·pagination·share-row·FeaturedStoryCard)라 랜딩 스코프 밖.

| # | 섹션 | 발견 | file:line | 심각도 | 판정 |
|---|------|------|-----------|--------|------|
| X1 | Header | 흰 메뉴 텍스트 on `#b769ff` 보라 = **3.24:1** (16px → AA 4.5:1 미달) | `PublicHeader.tsx:68·71` | high(a11y) | **브랜드/Figma 결정 — 사용자 확인** |
| X2 | Partners | 로고 5개 `alt=""`+`aria-hidden` → AT에서 정보 소실(실제 협력사면) | `PartnersSection.tsx:45·48·51` | high(a11y) | 확인(장식 의도 vs 정보) |
| X3 | Header/ArticleGrid | `focus-visible` 명시 없음(hover만) — 키보드 포커스 안 보임 | `PublicHeader.tsx:63`, `StoryCard`/`ArticleCard` | medium(a11y) | **안전 수정 후보** |
| X4 | Hero | h1 `Gmarket Sans Medium` 지정하나 실제 SUIT만 로드 → 시안 폰트 미반영 | `HeroBanner.tsx:30-36` | medium(fidelity) | 라이선스 대기(TODO) |
| X5 | Partners | 주석 "모바일 2열"인데 실제 `grid-cols-1` (주석/시안 불일치) | `PartnersSection.tsx:41-42` | low | B에서 열수 확인 |
| X6 | KPI/Hero/Footer | 매직 px(`py-[100px]`·`w-[293px]`·`h-[423px]` 등) + `whitespace-nowrap` 운영자 긴값 리스크 | 다수 | low | ADR-035 수용/latent |

**codex 긍정**: @theme 색·폰트·radius 토큰 체계 있음 · `transition-all` 없음(transition-colors/opacity/transform) · 이모지 장식 없음 · AI slop 보라그라디언트는 placeholder 한정 · 카드 대부분 인터랙션/데이터(장식 아님) · Hero 좌정렬(AI 중앙 hero 회피) · SUIT 로컬(일반폰트 회피).

### 수정 triage
- ✅ **안전 a11y 수정 완료** (시안 무영향): X3 focus-visible 링(`cb9b68e`) · `/news` smooth-scroll reduced-motion 가드(`8b21a9e`) · X5 Partners 주석 정정(`933e70f`). lint·test 31·tsc 그린.
- 🟡 **B/사용자 판단 대기**(시안·브랜드 충돌): X1 헤더 대비(흰/보라=브랜드) · C2 Hero CTA 40→44px · X4 Gmarket(라이선스) · C5 H2 사이즈 · X2 Partners 로고 a11y.
- ⚪ **수용/latent**: X6 매직 px(ADR-035) · nowrap.

---

## B. Figma 픽셀 대조 (사용자 고해상 8프레임 수령 — 2026-06-03)

> 사용자 제공 Figma export 8장(`docs/design/figma-export/landing-{1920,1440,1439,1025,1024,768,767,375}.png`). 실제 픽셀폭 측정으로 BP 확정(유추 아님). 이게 B의 ground truth.

| # | 섹션 | BP | Figma 시안 vs 라이브 차이 | 심각도 | 상태 |
|---|------|----|--------------------------|--------|------|
| **B1** | **Hero** | 전 BP | Figma hero **하단이 convex 곡선(아치)** — 보라가 아래로 볼록, flower 줄기가 곡선 아래 흰영역까지 내려옴. 라이브는 평평(직선). **내 2차 수정 `8a23924`가 곡선 제거 = 회귀.** (상단은 양쪽 다 평평·헤더 seamless로 일치) | **high** | 🔴 복원 |
| **B2** | **KPI** | 375(<640) | Figma 375 = **2열 벤토**(좌: 스마일·38년·3614라임 / 우: 45217·80257사진 세로 span) + 데코(+/X) 노출. 라이브(내 작업)는 스택형(38년\|SowGood, 3614 full, 사진 full) + 데코 <640 숨김 → **배치 상이** | medium | 🟡 재정합 |
| B3 | KPI/Story/Article/Partners/Footer | 1440/768 | 구조·배열 대체로 일치(추가 미세 갭은 fix 단계에서 BP별 overlay 정밀 확인) | info | 진행 |

> ⚠️ **B1은 내가 만든 회귀** — 저해상 썸네일(768=426px)로는 곡선이 안 보여 "곡선 없음"으로 오판했음. 고해상 ground truth로 확정. 곡선 복원하되 **상단 평평(헤더 seamless) + 하단만 곡선** 으로 구현(이전 SVG는 상단 흰 노치 부작용이 있었음 — 그건 피함).

---

## A. 사용자 수동 검수 (입력 대기)

> 사용자가 라이브 기반으로 발견한 이슈를 섹션×BP로 기록.

| # | 섹션 | BP | 이슈 | 심각도 | 상태 |
|---|------|----|------|--------|------|
| _대기_ | | | | | |

---

## 통합 우선순위 (A+B+C 합산 후 확정)
_세 출처 수집 완료 후 심각도순 정렬 → 수정 루프 진입._
