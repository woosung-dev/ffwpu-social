<!-- 영역별 측정 정합 루프(1안) 템플릿 — 복제해서 docs/design/areas/<area>.md 로 사용 -->

# 영역 감사 — <영역명>

> **측정 정합 루프(1안).** Figma 4-BP 실측 ↔ 라이브 렌더를 **숫자로** 대조한다. "눈대중 정합 완료" 금지 — 숫자가 맞아야 잠근다.
> 4-BP 토큰 매핑: `docs/design.md §"Tailwind 토큰 매핑 — 4-BP SSoT"`. 토큰 정의: `src/app/globals.css @theme`.
> 4 구간: base(0~767)=375 / `md:`(768~1023)=768 / `lg:`(1024~1439)=1025 / `wide:`(1440~)=1440.

## 0. 대상

- 파일: `src/client/...`
- Figma 4-BP 노드: base `?` / md `?` / lg `?` / wide `?`
- 상태: ☐ 미착수 · ☐ 측정중 · ☐ 잠금완료

## 1. Figma 4-BP 기준 (step ① — `get_metadata` + `get_screenshot`)

> 각 BP 노드에서 자식 w/h 추출. 모호하면 `get_design_context` 로 CSS 확인.

| 요소 | base 375 | md 768 | lg 1025 | wide 1440 |
|---|---|---|---|---|
| (요소) w×h | | | | |

## 2. 라이브 실측 (step ② — playwright)

> 선행: `PORT=3100 pnpm dev` (무한 새로고침·`_next/image` 깨짐이면 `rm -rf .next` 후 재기동).
> 4 폭(375 / 768 / 1024 / 1440) resize → `getBoundingClientRect()` / `getComputedStyle()` 로 측정.

| 요소 | base | md | lg | wide |
|---|---|---|---|---|
| (요소) | | | | |

## 3. Diff (step ③)

- [ ] (요소) <BP>: Figma `X` / 라이브 `Y` → 수정

## 4. 수정→재측정 (step ④·⑤)

- 변경 파일 / 커밋:

## 5. 합격 체크리스트 (step ⑥ — 잠금)

- [ ] 4 BP 전부 요소 사이즈 Figma 일치(±2px)
- [ ] 4 BP 전부 **간격(gap·margin·padding)** Figma 일치 — *요소 사이즈만 보지 말 것*. Figma 부모 frame 의 자식 좌표 역산(`다음자식.y − (앞자식.y + 앞자식.h)`)으로 gap 산출. (2026-06-05 Partners 회귀: 사이즈만 검증하고 Wrap gap 30·Contents gap 70 누락)
- [ ] 가로 오버플로 0 (375/768/1024/1440)
- [ ] 레이아웃 전환 BP 정확 — **`lg`(1024)와 `wide`(1440)를 뭉개지 않음**
- [ ] a11y: alt · 색대비 · focus-visible
- [ ] 증거 캡처: `docs/design/screenshots/<area>-{375,768,1024,1440}.png`

## 증거

- (before/after 스크린샷 링크)
