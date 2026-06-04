<!-- Figma 라이브 감사 리포트 (Phase 1) — 97:10250 컴포넌트 · 96:5908 랜딩 · 95:9359 소식. Figma 사실 ↔ 현재 코드 ↔ Gap triple 포맷 -->

# Figma-to-Code Audit Report (Phase 1)

> 작성 2026-06-04 · 그린필드 재구현(branch `feat/figma-greenfield-ui`) 선행 감사.
> 방법: Figma 라이브 MCP(`plugin:figma:figma`, fileKey `lmjjU4UxUpK2pDi67BGRiW`) `get_metadata`·`get_variable_defs` + 고해상 export(`figma-export/` 8 BP) + 현재 코드 대조.
> 포맷: 각 발견 = **Figma 사실** · **현재 코드** · **Gap**(MATCH / DRIFT / MISSING / EXTRA + 심각도).
> 범위: 3 캔버스 섹션 = `97:10250`(컴포넌트) · `96:5908`(랜딩, 8 BP) · `95:9359`(소식 목록 5 BP + 상세 1 BP).

## 0. 요약 (Executive)

- **구조 정합도 매우 높음.** 라이브 메타데이터가 `docs/design.md` 인덱스와 거의 일치. 컴포넌트 variant·랜딩 8 BP·소식 5 BP 모두 코드 구현과 1:1 대응.
- **토큰 실체 확인.** Figma Variables 는 **단 3개**(`KeyColor #501F7E`, `KeyColor2 #F4B600`, sidebar-fill `#fff`). 나머지 색은 전부 컴포넌트 인라인 hex → 코드는 이미 `@theme inline` 60+ 토큰으로 승격(코드가 Figma 보다 토큰 성숙도 높음).
- **drift 정정 2건**: ① **1439 프레임 존재**(`332:8837`) — design.md "삭제" 기술 오류. ② Story 데코 벡터는 **전 BP** 존재(코드는 `lg+`만 노출).
- **그린필드 핵심 과제**: 정합 자체보다 *아키텍처 정리*(중복 카드/CTA/태그 통합, KpiCard 추출) + 검증된 반응형 로직 보존.

---

## 1. Auto Layout 사용

**Figma 사실** — 모든 페이지/섹션이 Auto Layout(flex) 기반. 패턴: `Container`(풀폭 bg) → `Contents`(max 1200, 좌우 gutter) → 내부 flex. gutter: 1440=120 / 1025=60 / 768=60 / 375=16(좌우). 절대배치는 *장식 한정*(§9). 소식 상세 본문은 900px 중앙 컬럼(`125:6566` Wrap, x=270).

**현재 코드** — `SectionContainer`(`max-w-[1264px] px-4 lg:px-8` = 1200+gutter)로 동일 패턴. 섹션 내부 flex/grid + `clamp()` 유동. 절대배치는 Hero flower·Story 데코·KPI 벡터에 한정.

**Gap** — **MATCH**. Auto Layout → flex/grid 매핑 충실. (info) gutter 가 Figma 는 BP별 고정값(120/60/16)인데 코드는 `px-4 lg:px-8`(16/32) + max-w 로 근사 — 1440 에서 (1440-1200)/2=120 vs 코드 32+여백, 실효 정합(컨테이너 max-w 로 흡수). 유지.

---

## 2. Components (마스터 인벤토리)

**Figma 사실** (`97:10250` + 소식 내 인스턴스) —

| 컴포넌트 | 노드 | variant | 크기(주요) |
|---|---|---|---|
| Header | `97:9431` | 4 (1920~1440 / 1025~1439 / 768~1024 / 375~767) | h 88/88/70/54 |
| Menu | `9:3300` | 4 (Size L·M × On·Off) | L 128×40 / M 109×33 |
| Card(Story) | `44:1840` | 1 | 277.67×425 |
| Card(Article) | `114:8164` | 12 (Size 1·2·3·4 × Default·None·Hover) | 1:384×348 2:313×310 3:288×296 4:200×237 |
| Heart | `114:8303` | 2 (Default·Click) | 60×32 |
| Tag(해시태그) | `106:8461` 인스턴스 | Default·Hover | 알약 h35 |
| SNSIcon | `93:8839` 등 | kakaotalk·facebook(+link) | round 40, 아이콘 24 |
| Pagination | `125:9154` | number·control × dir·status | cell 30×32 |
| CategoryTab(Tap) | `125:9131` 내 | active·inactive | 160/140 |
| Searchbar | `125:9128` 등 | — | **전부 hidden** (준비중) |
| IconSet / ArrowIcon | 다수 | — | 16~20 |

**현재 코드** — `src/components/ui`(shadcn 12) + `src/features/news/components`(ArticleCard·StoryCard·FeaturedStoryCard·Heart·CategoryTabs·Pagination) + `src/client/sections|layouts`(Header·Footer·5섹션). 

**Gap** —
- **MATCH**: Header(4 BP 분기 `md`/`lg`/`wide`)·ArticleCard(`size` prop)·Heart·Pagination·CategoryTabs·StoryCard.
- **MISSING(컴포넌트화 안 됨, info)**: 상세 `Tag`(해시태그)·`ShareRow`(SNSIcon)·`DetailHeader`·`PrevNextNav`·`ScrollTopButton`·관련글 카드 — 현재 `[id]/page.tsx` 인라인. → Phase 2 에서 컴포넌트 추출(아키텍처 개선).
- **EXTRA(코드에만, 정상)**: `MediaCard`(StoryCard 일반화 예정)·`CtaButton`·`SectionHeading` — 코드 측 중복 제거 산물.
- **Searchbar 전 BP hidden** = 헤더 검색 아이콘만 노출(disabled). 코드 일치(준비중 버튼).

---

## 3. Variant 구조

**Figma 사실** — variant 축이 *디자인 표현*용. 핵심:
- **ArticleCard `Size × Property1`**: Size = 콘텐츠 폭(반응형 BP 대응), Property1 = `Default`(이미지+카테고리+제목+날짜) / `Hover`(size1 시 Heart 노출) / `None`(이미지 없음 → 보라 그라디언트 placeholder).
- **Header `Property1`** = BP 4종.
- **Menu `Size×Property1`** = L/M × 선택/비선택.
- **Heart `Property1`** = Default/Click(채움+카운트+1).

**현재 코드** — ArticleCard `size: 1|2|3|4` prop + `state: default|hover|none`. Hover = CSS·State, None = placeholder.

**Gap** — **MATCH(개념)** 이나 **개선 권고**: `state` prop 은 디자인 variant 의 코드 직역 — `Hover`=CSS `:hover`, `None`=`coverImageUrl==null` 내부 폴백으로 충분. 12 variant ≠ 12 컴포넌트 ≠ 3 state prop. → Phase 2: `state` 제거, props `{ size, article }` 로 축소(medium, 아키텍처).

---

## 4. Design Token 구조

**Figma 사실** — `get_variable_defs(96:5908)` = **3개만**:

| Figma Variable | 값 |
|---|---|
| `KeyColor` | `#501F7E` |
| `KeyColor2` | `#F4B600` |
| `Miscellaneous/Sidebar Fill - Selected` | `#ffffff` |

나머지 색·폰트·radius·spacing 은 컴포넌트 **인라인 값**(Variable 미승격). design.md 토큰표가 인라인 값의 전수 추출본.

**현재 코드** — `globals.css @theme inline` 에 60+ 토큰(`--color-brand-*` 9-tier · `--color-kpi-*` · `--color-ink-*` · `--color-surface-*` · `--color-tag-*` · gradient) + `--breakpoint-wide:1440px`.

**Gap** — **코드 > Figma (EXTRA, 긍정)**. 코드가 인라인 hex 를 의미 기반 토큰으로 승격해 Figma 보다 성숙. 
- DRIFT(의도적, 문서화됨): `#959ba9`(Figma 날짜) → `--color-ink-date #6f7682`(WCAG AA 4.58:1 위해 상향). 그린필드에서도 **유지**(접근성 절대제약, 시각 영향 미미).
- GAP(미토큰화, low): `#343434`(KpiCard 텍스트)·`#3b4700`(on-lime, → `--color-ink-on-lime` 이미 있음)·carousel-inactive `rgba(75,85,99,0.15)` — D-3 토큰화 후보.
- Pretendard 미재도입 확인(ADR-008, 페이지네이션도 SUIT) ✅.

---

## 5. Typography 체계

**Figma 사실** — 폰트 2종: **SUIT**(Heavy/ExtraBold/Bold/SemiBold/Medium/Regular 6 weight) + **Gmarket Sans Medium**(Hero 슬로건 60px 전용). 관찰 사이즈(px): 13/14/15/16/18/20/22/24/26/28/31/32/34/36/42/45/52/60. 역할: H1 60(Gmarket) · 섹션 H2 36/32/31(KPI/Story/ArticleGrid, weight 700/700/800) · 상세 제목 32 SemiBold · 본문 16~20 · 날짜 14~16 · 캡션 10~13.

**현재 코드** — SUIT 6 weight `next/font/local`(`--font-suit`). Gmarket Sans **파일 미보유** → Hero h1 이 `'Gmarket Sans Medium'` 지정하나 SUIT 폴백 렌더. 사이즈는 Tailwind 유틸 + `clamp()`.

**Gap** —
- **MATCH**: SUIT 6 weight, 사이즈 스케일, weight 역할.
- **MISSING(medium, 에셋 의존)**: Gmarket Sans 파일 — 라이선스/파일 확보 시 후속. 현재 SUIT 폴백(문서화된 수용 한계). 그린필드에서도 동일(에셋 차단).
- (info) 한 화면 폰트 사이즈 5종 내외 — anti-slop 통과. 섹션별 H2 비균일(36/32/31)은 Figma 의도(코드 `titleClassName` 로 보존).

---

## 6. Color 체계

**Figma 사실** — BI 기반: 보라(친근/신뢰) 9-tier(`#f1e3ff`→`#3c1264`) + 오렌지(따뜻함, KeyColor2) + KPI 4색(yellow `#ffcf41` / lime `#dcef7d` / purple `#b769ff` / gray `#f6f6f6`) + ink/surface 중립. 그라디언트는 **2색만**(ArticleCard placeholder `#7b2ac7→#ac69ea`, Partners bg `#f8f1ff→#fff`). AI-slop 3색 그라디언트 없음.

**현재 코드** — `globals.css` 토큰이 위 전부 1:1 매핑(design.md 토큰표 SSoT). `transition-colors/opacity/transform` 만(no `transition-all`), 이모지 장식 0.

**Gap** — **MATCH**. (문서화된 a11y 트레이드오프) 헤더 흰 글자 on `#b769ff` = 3.24:1(AA 4.5:1 미달). **사용자 결정 = Figma 정확 우선** → 유지, Difference Report 에 `ACCEPT(a11y 부채)` 기록.

---

## 7. Spacing 체계

**Figma 사실** — gutter 120/60/60/16(1440/1025/768/375). 섹션 수직 패딩 ~74~100. 카드 gap: 목록 1440 grid gap-x 24·gap-y 48, 1025 24, 768 18, 375 단열. KPI 카드 radius 20, ArticleCard 이미지 radius 14, StoryCard 12, Menu 999(알약). 다수 고정 px(`w-293`·`h-423`·`py-100`)는 Figma 절대값.

**현재 코드** — `SectionContainer` + Tailwind 4px 그리드(`gap-6`/`py-16 lg:py-24`) + 정합용 매직 px(ADR-035 수용). radius 토큰 `--radius-*` + 인라인 `rounded-[14px]/[12px]`.

**Gap** — **MATCH**. (low) 매직 px(`h-[423px]` 등)는 Figma 절대값 직역 — ADR-035 로 수용. 4 배수 그리드 이탈은 *정합 우선* 의도적.

---

## 8. 중복 패턴 (de-dup 대상)

**Figma 사실 → 현재 코드 → 권고** —

| 중복 | Figma | 코드 현황 | 권고 |
|---|---|---|---|
| 카드 3종 | ArticleCard / StoryCard(`44:1840`) / 상세 관련글 Card(`93:8868` ← ArticleCard 동형) | ArticleCard + StoryCard + `[id]` 인라인 카드 | 관련글 → `ArticleCard size=3` 흡수. StoryCard → `MediaCard` 리네임. **2 컴포넌트** |
| CTA 3종 | Hero(dark `#3c1264`) / Featured(vivid `#b35feb`) / ArticleGrid(text+화살표) | 각 hand-rolled `<Link>` | `CtaButton` 1개 + shadcn `buttonVariants` brandDark/brandVivid |
| 태그 2종 | solid(StorySection·badge) / hashtag(상세 `#태그`) | 인라인 pill ×3 | `Tag` 1개 `variant=solid\|hashtag` |
| Banner | 목록·상세 공통(`125:8915`=`106:9112` 동일) | SubBanner | 1개 재사용 ✅(이미 정합) |
| Header/Footer | 전 페이지 instance | PublicHeader/Footer | 1개 ✅ |
| 섹션 H2 | 5 섹션 유사 구조 | 각 인라인 h2 | `SectionHeading`(구조만) |
| KpiCard | KPI 카드 ~8 | KpiSection 인라인 | `KpiCard` 추출(291→~120줄) |

**Gap** — **개선 기회(Phase 2 아키텍처)**. 정합 결함 아님, 유지보수성 향상.

---

## 9. Absolute Position 사용

**Figma 사실** — 절대배치는 *장식·레이어링 한정*:
- Hero `BannerBackground`(`97:7054`, 2875×1441 풀스크린 그래픽, 음수 offset) + flower 일러스트.
- Story 데코 `heart`/`star`×2/`Vector`×4 (`97:7244` 등) — **전 8 BP 존재**(1440·1025·1439·768·1024·375·767 모두).
- KPI 보라카드 벡터 오버레이.
- 상세 `ScrollButton`(`93:8871`, 우하단 floating 116).

**현재 코드** — Hero flower `absolute`(모바일) → `lg:relative`. Story 데코 `absolute ... hidden lg:block`(**lg+ 만**). ScrollTopButton `fixed`. 레이아웃엔 absolute 미사용.

**Gap** —
- **MATCH**: Hero flower, ScrollButton, KPI 벡터.
- **DRIFT(low, fidelity)**: Story 데코 — Figma 전 BP vs 코드 `lg+`만. 모바일 좁은 폭 overflow 회피로 숨긴 것(가로스크롤 0 우선). 그린필드에서 **모바일 데코 노출 재검토**(축소 배치로 살릴지) → Difference Report 후보.

---

## 10. Responsive 위험 구간

**Figma 사실** — 8 BP(랜딩) / 5 BP(소식 목록). 컴포지션 전환:

| 섹션 | 1440·1920 | 1025·1439 | 768·1024 | 375·767 |
|---|---|---|---|---|
| Header | 4메뉴+pill+검색(h88) | 동일(h88) | 4메뉴+pill+검색(h70) | 단일 pill→드롭다운+검색(h54) |
| Hero | 가로 2단, 단색 보라 | 좁은 2단 | flower 우측 | flower 우측 absolute 겹침 |
| KPI | 데스크탑 벤토(좌헤딩+우그리드) | 벤토(stacked, 사이드컬럼 X) | 유동 벤토 | 640↑ 2열 / <640 1열 |
| Story | 좌 이미지+우 텍스트+Result 가로3열 | 좌우 유지 | 세로 스택 | 세로 스택, Result 가로3열 |
| ArticleGrid | 좌 다크 사이드 + 우 마조네리 3열 | 다크 사이드 + 3열 | 다크 가로배너 + 2열 | 헤딩 위 + 1열 |
| Partners | 5 로고 가로 | 가로 | 3+2 | 1열 스택 |
| 소식 목록 카드 | size1 3열 | size3 3열 | size2 2열 | 343 1열 |
| 소식 CategoryTabs | 5탭 가로 | 가로 | 가로 | **HorizontalScroll** |

**현재 코드** — Tailwind 표준 BP(sm640/md768/lg1024/xl1280) + `wide:1440`(custom) + `clamp()`. 핵심: **side-column 전환 = `wide`(1440), `lg` 아님**(1024~1439 stacked) — review-final 루트코즈.

**Gap** — **MATCH(검증 완료)**. 위험 구간:
- **R-경계쌍 767/768·1024/1025**: 컴포지션 전환점. 그린필드 검증 필수(가로스크롤 0).
- **R-side-column**: KPI/Story/ArticleGrid 2단 = `wide` 고정(content max-w 1264 상 1440 미만 2-col 미수용). **회귀 금지 1순위**.
- **R-소식 상세 모바일**: Figma 375/768 시안 **부재**(1440 only). → `[추론]` 구현, 가로스크롤 0 + 구조 무결성만 보장.
- **R-Story 데코 전 BP**(§9 DRIFT).

---

## 부록 A — 검증된 노드 ID 맵 (2026-06-04 라이브)

**랜딩 `96:5908`** (8 BP, 전부 "시안4"): 1440 `96:7689` / 1920 `331:7984` / **1439 `332:8837`(존재!)** / 1025 `97:8573` / 1024 `332:9254` / 768 `97:9014` / 767 `126:12232` / 375 `99:6950`. 1440 섹션: Hero `96:7690` · KPI `96:7773` · Story `96:7834` · ArticleGrid `96:7877` · Partners `96:7897` · Footer `126:10897`.

**소식 `95:9359`**: 상세 `93:8810`(1440 only) · 목록 1440 `125:8904` / 1025 `125:9872` / 768 `125:13072` / 767 `135:12490` / 375 `135:11268`.

**컴포넌트 `97:10250`**: Header `97:9431` · Menu `9:3300` · StoryCard `44:1840` · ArticleCard `114:8164` · Heart `114:8303`.

## 부록 B — design.md 정정 사항 (Atomic Update 대상)

1. **1439 프레임 존재** (`332:8837`) — design.md "1439 자식 frame 삭제 (1440에 통합)" → 정정 필요. (8 BP 전부 그려져 있음, export 8장과 일치.)
2. **Story 데코 전 BP 존재** — 모바일 포함 8 BP 모두 heart/star/Vector 데코 있음.
