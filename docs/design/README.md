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
