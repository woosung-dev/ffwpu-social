<!-- Figma 디자인 SSoT 영속 참조 — Figma URL·MCP 호출 패턴·screenshots 매핑 -->

# docs/design/ — Figma SSoT 참조

> **이 폴더는 Figma 의 추출본·인덱스.** 코드 결정 시 항상 Figma 를 1차 확인.
> Figma 가 SSoT (ADR-000·ADR-018). 이 폴더는 *Figma 의 캐시·매핑*.

---

## 🎨 Figma 파일

- **URL:** https://www.figma.com/design/lmjjU4UxUpK2pDi67BGRiW/사회공헌국
- **File Key:** `lmjjU4UxUpK2pDi67BGRiW` (영구. URL 의 `/design/<key>/` 부분)
- **권한:** Viewer (사회공헌국 → 개발자)
- **마지막 동기화:** 2026-05-26 (`docs/design.md` 상단 참조)

> ⚠️ Figma 가 업데이트되면 `docs/design.md` 상단의 "마지막 확인 날짜" 갱신 필수.

---

## 🔌 Figma MCP 사용 — 영속 호출 패턴

본 프로젝트는 **Figma MCP plugin** 을 사용. 도구 prefix: `mcp__plugin_figma_figma__*`.

### 📌 호출 전 필수 — `figma-use` 스킬

**write/JS-실행 작업 (use_figma 호출 전) 은 반드시 `/figma-use` 스킬 선행.** 안 하면 자주 디버깅 어려운 실패. 읽기 전용 (get_*) 은 직접 호출 OK.

```
mcp__plugin_figma_figma__use_figma     ← 노드 생성/수정·variables 작업 (skill 필수)
mcp__plugin_figma_figma__get_design_context  ← 노드 코드 컨텍스트 추출
mcp__plugin_figma_figma__get_screenshot      ← 노드 스크린샷 (PNG)
mcp__plugin_figma_figma__get_metadata        ← 노드 트리·구조
mcp__plugin_figma_figma__get_variable_defs   ← Variables (토큰) 정의
mcp__plugin_figma_figma__search_design_system ← 디자인 시스템 검색
mcp__plugin_figma_figma__get_libraries       ← 라이브러리 목록
```

### 호출 예시 (코드 결정 시 표준 패턴)

```ts
// 1) 노드 코드 컨텍스트 (CSS·레이아웃·variables 매핑)
mcp__plugin_figma_figma__get_design_context({
  nodeId: "126:11815",  // 1920 랜딩 노드 (파일명 기준)
  // 또는 figma URL: https://www.figma.com/design/.../?node-id=126-11815
});

// 2) 노드 스크린샷 (시각 확인)
mcp__plugin_figma_figma__get_screenshot({
  nodeId: "126:11815",
});

// 3) Variables 토큰 (KeyColor 등)
mcp__plugin_figma_figma__get_variable_defs({});
```

> 노드 ID 표기: `126:11815` (콜론) 또는 `126-11815` (대시) 모두 인식. 파일명은 대시 사용.

---

## 📸 screenshots/ 매핑

`docs/design/screenshots/` 의 PNG 파일명 규칙: `<scope>-<nodeId>-<viewport>.png`

| 파일 | 노드 | 뷰포트 | 용도 |
|---|---|---|---|
| **landing-* (히어로 + 6 섹션)** | | | |
| `landing-99-6950-375px.png` | 99:6950 | 375 | 모바일 |
| `landing-97-9014-768px.png` | 97:9014 | 768 | 태블릿 |
| `landing-97-8573-1025px.png` | 97:8573 | 1025 | 작은 데스크탑 |
| `landing-126-12232-767px.png` | 126:12232 | 767 | (대안 모바일) |
| `landing-126-10980-1024px.png` | 126:10980 | 1024 | (대안 1024) |
| `landing-126-11398-1439px.png` | 126:11398 | 1439 | 노트북 |
| `landing-96-7689-1440px.png` | 96:7689 | 1440 | (대안 1440) |
| `landing-126-11815-1920px.png` | 126:11815 | 1920 | **데스크탑 마스터** ⭐ |
| **news-list-* (소식 목록)** | | | |
| `news-list-135-11268-375px.png` | 135:11268 | 375 | 모바일 |
| `news-list-135-12490-767px.png` | 135:12490 | 767 | 태블릿 |
| `news-list-125-13072-768px.png` | 125:13072 | 768 | (대안 태블릿) |
| `news-list-125-9872-1025px.png` | 125:9872 | 1025 | 작은 데스크탑 |
| `news-list-125-8904-1440px.png` | 125:8904 | 1440 | **데스크탑 마스터** ⭐ |
| **news-detail-* (소식 상세)** | | | |
| `news-detail-93-8810-1440px.png` | 93:8810 | 1440 | **데스크탑 마스터** ⭐ |
| **component-* (재사용 컴포넌트)** | | | |
| `component-9-3300.png` | 9:3300 | — | (확인 필요) |
| `component-44-1840.png` | 44:1840 | — | (확인 필요) |
| `component-97-9431.png` | 97:9431 | — | (확인 필요) |
| `component-114-8164.png` | 114:8164 | — | (확인 필요) |
| `component-114-8303.png` | 114:8303 | — | (확인 필요) |

> 위 표의 "확인 필요" 컴포넌트는 D-3 진입 시 `get_metadata` 로 노드 이름 확인 후 라벨 추가.

---

## 🗂️ 자산 매핑 (Figma node → 코드 위치)

> Figma MCP `get_design_context` 결과의 `img` URL 을 다운로드 → 본 매핑 표에 영속 기록. 7 일 후 URL 만료되므로 노드 ID 기록이 핵심.

| Figma 노드 | 명칭 | 파일 형식 | 코드 위치 | 메모 |
|---|---|---|---|---|
| `I98:7101;97:10027` (`_레이어_1`) | Sow Good 헤더 BI 로고 | SVG 24KB | `public/icons/sow-good-header-logo.svg` | 80×53.333 viewBox, 보라+노란 해바라기 일러스트. HeroBanner 헤더 좌측 |
| `I98:7101;97:10079;928:9074` | 헤더 검색 아이콘 | SVG 506B | `public/icons/search-icon.svg` | 20.6667×20.6667 viewBox, 돋보기 stroke white. 일반 lucide-react Search 와 거의 동일 (선택적 교체) |
| `9:5456` (clip-path id 추정) | Sow Good 푸터 로고 | inline TSX | `src/client/components/icons/SowGoodFooterLogo.tsx` | 59×39 워드마크 + 꽃 BI. currentColor 사용 (다크 배경 위 라벤더 `--color-brand-lavender`) |

### 자산 다운로드 표준 절차

```bash
# 1) Figma MCP get_design_context 호출 → img URL 추출
mcp__plugin_figma_figma__get_design_context({
  nodeId: "98:7101", fileKey: "lmjjU4UxUpK2pDi67BGRiW",
  clientFrameworks: "react,nextjs",
  clientLanguages: "typescript,tsx,tailwindcss",
});
# 결과 예: const img1 = "https://www.figma.com/api/mcp/asset/<uuid>";

# 2) 7 일 안에 curl 로 다운로드 (URL 만료 전)
curl -sSL -o public/icons/<asset-name>.tmp "<img URL>"
file public/icons/<asset-name>.tmp     # SVG / PNG 확인
mv public/icons/<asset-name>.tmp public/icons/<asset-name>.<ext>

# 3) 본 README 자산 매핑 표에 노드 ID + 파일 위치 영속 기록
```

> **이미지 vs inline SVG 판단:**
> - 작은 SVG (< 1KB), 색상 토큰 매핑 필요 → React 컴포넌트 (inline + currentColor)
> - 큰 SVG (≥ 5KB), 다중 색상 BI → `public/icons/*.svg` + `<img>` 태그
> - Next.js Image 컴포넌트는 SVG 대응 `dangerouslyAllowSVG` 옵션 필요 → 가능하면 단순 `<img>` 사용

---

## 🔑 핵심 컴포넌트 노드 ID — 영구 참조표

> 다음 노드 ID 는 코드 결정 시 매번 Figma 재호출하지 않도록 영속 기록. Figma 가 업데이트되면 본 표 갱신.

| 컴포넌트 | Figma 노드 | 핵심 명세 (get_design_context 추출 발췌) |
|---|---|---|
| **HeroBanner Header** | `98:7101` | 배경 `bg-brand-bright` (`#B769FF`) · padding 120px · flex items-center · 인터랙션 어노테이션 "스크롤 위치에 따라 탭이 이동하는 인터렉션" (스크롤스파이) |
| Header 메뉴 (active) | `I98:7101;97:10252` | white bg + `border-brand-primary` 1.6px + rounded-full + px-5/py-2.5 + SUIT ExtraBold 16px `text-brand-primary` |
| Header 메뉴 (inactive) | `I98:7101;97:10253~10255` | 배경 없음 + px-5/py-2.5 + SUIT Bold 16px text-white |
| Header 검색 버튼 | `I98:7101;97:10078` | 42×42 size, 28×28 IconSet, 18.667×18.667 Icon |
| ArticleCard (12 variants) | `114:8164` (마스터) | size 1~4 × default/hover/none. None state: 보라 그라디언트 + 중앙 "보도자료" 텍스트만 (본문 영역 없음) |
| Banner (소식 페이지 전용) | `125:8915` (1440×132) | "Sow Good — 따뜻한 진심을 담아 / 나누는 진실의 활동들을 소개합니다" 가로 띠 |
| Footer (단순) | `93:8810` 내부 | 다크 띠 #242424, Sow Good 로고 + "COPYRIGHT 2026 © Sow Good All rights reserved." |
| HeroBanner (전체) | `96:7690` | 740 height, 헤더 + 슬로건 + 해바라기 일러스트 |

> **추가 핵심 명세는 `docs/design.md`** (컬러 토큰·타이포·반응형 4 BP).

---

## 🧭 코드 결정 시 권장 워크플로우

1. **읽기 단계:** `docs/design.md` 의 해당 섹션 + screenshots/ PNG 시각 확인
2. **불확실 시:** `mcp__plugin_figma_figma__get_design_context({ nodeId })` 로 정확한 CSS·variables 추출
3. **Variables 매핑:** `get_variable_defs` 결과 → `src/app/globals.css` `@theme inline` 으로 매핑
4. **Figma 외 추가 금지:** Figma 명세에 없는 폰트·아이콘·텍스트·섹션 임의 추가 금지 (사용자 명시 2026-05-27).

---

## 🚫 절대 제약 — Figma SSoT 위반 시 사례

다음 안티 패턴은 **즉시 거절·재검토:**
- "이 정도면 자연스러우니 추가하자" → ❌ Figma 없으면 코드 없음
- "lucide 아이콘 하나 더 추가하면 좋겠다" → ❌ Figma 에 그 아이콘 있나 먼저 확인
- "polishing 차원에서 transition·hover 효과 추가" → ❌ Figma 의 인터랙션 명세 우선
- "임시 placeholder 카피 만들기" → ❌ 빈 화면이 임의 카피보다 낫다 (D-5 "데이터 검증" 노출 사고)

위반 사례 (D-4): 상단 보라 Banner 띠 (Figma 미존재) / 홈 "준비 중" placeholder 카피 / Footer "© 2026 FFWPU Korea ... All rights reserved." (Figma 미확인).
**처리:** 2026-05-27 사용자 지적 → 정합 작업 진행.

---

## 관련 문서

- `docs/design.md` — Figma 추출본 (사이트맵·컬러 토큰·컴포넌트 명세·타이포)
- `docs/current.md` — 현재 합의된 사이트 정의 (Figma 외 요구 사항 포함)
- `docs/decisions.md` — ADR (Figma 결정 사유)
- `.ai/project/domain.md` — 도메인 절대 제약 (정치 중립·포교 금지·개인정보·운영 자율성)
