<!-- Header(PublicHeader) 영역 측정 정합 감사 — 1안 루프 -->

# 영역 감사 — Header (PublicHeader)

> **측정 정합 루프(1안).** Figma 4-BP 실측 ↔ 라이브를 숫자로 대조. 템플릿: `_TEMPLATE.md`.
> 4 구간: base(0~767)=375 / `md:`(768~1023)=768 / `lg:`(1024~1439)=1025 / `wide:`(1440~)=1440. 토큰 SSoT `globals.css @theme`.

## 0. 대상

- 파일: `src/client/layouts/PublicHeader.tsx` (144줄)
- Figma Header = **4 variant 컴포넌트 세트** `97:9431`:
  - base 375 → `97:9691` (375×**54**)
  - md 768 → `97:9640` (768×**70**)
  - lg 1025 → `97:9588` (1025×**88**)
  - wide 1440 → `97:9432` (1440×**88**)
- 상태: ☑ 측정중 (step ① 부분 — 헤더 높이만 확보, 하위 요소 미확보)

## 🔴 착수 전 의심점 (코드 정적 분석)

1. **`wide:` 미사용** — PublicHeader 는 `lg:`(8회)·`md:`(2회)만 쓰고 `wide:` 없음 → **lg/wide 뭉갬 의심**(Partners 와 동일 회귀 패턴, [[figma_breakpoint_lg_wide]]).
2. **헤더 높이 불일치 의심** — 코드 `h-16`/`h-20`(64/80px) 존재 vs Figma **base 54 / md 70 / lg·wide 88**. 4-BP 높이 매핑 안 됐을 가능성.
3. **메뉴 전환** — Figma·DESIGN.md: **768+ = 풀 4메뉴 + active 흰 pill**, **375~767 = 단일 활성 pill→드롭다운**, 검색 아이콘 전 BP 노출. 코드 분기 기준이 `md`(768)인지 확인 필요(이전 "1024 햄버거"는 오류로 정정됨, DESIGN.md §핵심패턴 1).

## 1. Figma 4-BP 기준 (step ① — 진행 중)

> 다음 세션: `get_metadata` 로 각 variant(`97:9691/9640/9588/9432`) 자식 드릴 → 로고·메뉴칩·검색·pill 의 w/h·폰트 추출해 표 완성. 시각 확인은 `get_screenshot`.

| 요소 | base 375 | md 768 | lg 1025 | wide 1440 |
|---|---|---|---|---|
| 헤더 높이 | 54 | 70 | 88 | 88 |
| 로고 | TBD | TBD | TBD | TBD |
| 메뉴 4칩 (폰트/높이) | (드롭다운) | TBD | TBD | TBD |
| active pill | TBD | TBD | TBD | TBD |
| 검색 아이콘 | TBD | TBD | TBD | TBD |

## 2. 라이브 실측 (step ② — 미착수)

> `PORT=3100 pnpm dev` (stale 시 `rm -rf .next`). 375/768/1024/1440 resize 후 헤더 높이·로고·메뉴·검색 측정.

## 3. Diff (step ③ — 미착수)

## 4. 수정→재측정 (step ④·⑤ — 미착수)

## 5. 합격 체크리스트 (step ⑥)

- [ ] 헤더 높이 4-BP = 54 / 70 / 88 / 88 (±2px)
- [ ] **`lg`(1024)와 `wide`(1440) 안 뭉갬** — 둘 사이 사이즈/컴포지션 차이가 Figma대로면 분리, 같으면 한 값
- [ ] 768+ 풀 4메뉴 + active 흰 pill / 375~767 단일 pill→드롭다운
- [x] 검색 아이콘 **미노출** — ADR-037 "검색 아이콘 제거"(1차 범위 밖, domain "헤더 아이콘만"이나 미구현). Figma 는 노출하나 결정상 제외(2026-06-10 사용자 재확인)
- [ ] scrollspy active 정확 (랜딩 4메뉴 ↔ 섹션, 소식 페이지 "활동 스토리" 고정 — ADR-009)
- [ ] 가로 오버플로 0 (375/768/1024/1440)
- [ ] a11y: 메뉴 focus-visible · 색대비 · aria
- [ ] 증거: `docs/design/screenshots/header-{375,768,1024,1440}.png`

## 다음 세션 킥오프 프롬프트

```
docs/design/areas/header.md 의 Header 측정 정합 루프를 이어서 진행해줘.
1) get_metadata 로 Figma variant 97:9691/9640/9588/9432 자식을 드릴해 §1 표(로고·메뉴·검색·pill) 완성
2) PORT=3100 pnpm dev 띄우고 375/768/1024/1440 에서 라이브 실측(§2)
3) §3 diff → 특히 wide: 누락·헤더 높이(코드 h-16/20 vs Figma 88) 우선 확인
4) 수정 후 재측정, §5 체크리스트 전부 통과시키고 증거 스크린샷 저장
파일은 src/client/layouts/PublicHeader.tsx.
```

## 증거

- (미착수)
