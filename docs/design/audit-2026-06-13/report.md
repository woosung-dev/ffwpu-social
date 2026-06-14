<!-- 랜딩 스크롤 인터랙션(스티키+리빌) 적용 후 Figma 정합 재검증 리포트 — Generator-Evaluator (2026-06-13) -->

# 랜딩 모션 적용 후 Figma 정합 재검증 리포트 (2026-06-13)

> 범위: 홈 랜딩(96:5908) 4-BP(375/768/1025/1440) — 섹션 내 스티키 좌블록 + 스크롤 리빌 적용 후 **회귀 검증**.
> 베이스라인: 2026-06-10 전수 감사(±2px 수렴, main 머지). 본 작업은 모션 추가가 레이아웃 정합을 깨지 않았는지 확인하는 패스.
> 방법: Generator–Evaluator 멀티에이전트 — BP별 렌더↔Figma export 시각 비교(4) → 후보 갭 적대적 검증(refute 기본값) → 확정만 수정.

## 1. 결과 요약

| BP | Evaluator 판정 | 후보 findings | 적대 검증 후 **확정 갭** |
|---|---|---|---|
| 375 | PASS | 0 | 0 |
| 768 | PASS | 0 | 0 |
| 1025 | MINOR_GAPS | 1 (Hero 우상단 장식) | **0** (refuted — 양 이미지 모두 장식 존재, 오독) |
| 1440 | PASS | 0 | 0 |

**확정 레이아웃 갭 0건.** 모션 변경(스티키·리빌)은 정적 레이아웃을 바꾸지 않아 2026-06-10 ±2px 정합이 그대로 보존됨.
(스티키는 `wide` 스크롤 동작만, 리빌은 `transform/opacity`로 `transform: none` 도달 시 레이아웃 동일. 측정은 force-reveal 상태로 수행.)

## 2. 모션 동작 실측 (Playwright getBoundingClientRect)

| 항목 | 측정 | 판정 |
|---|---|---|
| KPI 좌헤딩 스티키(1440×720) | scrollY 990·1290 → topVP **112px** (헤더 88 + 24) | 핀 OK·헤더 비겹침 |
| ArticleGrid 다크블록 스티키(1440×720) | topVP 112 핀 → 섹션 하단서 21(해제) | 핀↔해제 OK |
| `<wide`(1280) | 두 블록 `position: static` | 스티키 미적용("왼쪽일 때만") OK |
| 리빌 적용 후 KPI 스티키 | 리빌 완료(transform none) 후 112px 유지 | transform↔sticky 분리 OK |
| 리빌 초기 상태 | `[data-reveal]` 15/15 opacity 0(scripting on), 진입 시 revealed | OK |
| 카드 stagger | 마조네리 60→300ms(캡) | OK |
| reduced-motion / scripting 규칙 | CSSOM 존재 확인 | OK |
| 가로 오버플로 | 4-BP 전부 0 | OK |
| 콘솔 | 0 errors | OK |

## 3. 전역 CSS 회귀 — /news 영향 점검

`--header-h` 토큰화는 `scroll-padding-top`을 전역 변경하므로 비랜딩 점검.

| /news 항목 | 값 | 판정 |
|---|---|---|
| 헤더 높이 | 88px (=`--header-h` 5.5rem) | OK |
| scroll-padding-top | 88px | OK |
| `[data-reveal]` leak | 0 (리빌 랜딩 전용) | OK |
| 가로 오버플로 | 0 | OK |

## 4. 의도적 이탈 — 보존 (감사 제외, 사용자 확정)

2026-06-10 `allowlist.md` 21항목 승계 + 본 작업 확정 3항목:
- 헤더 메뉴 라벨·순서 변경(#54·#56, ADR-038) / 검색 아이콘
- 히어로 CTA 카피(#54)
- Story·ArticleGrid 노출 글 2-of-3 (운영자 숨김 — 데이터 상태)
- 본문 14→16px·날짜 #6F7682(접근성 절대제약), KPI 실제값 vs Figma 더미

## 5. 산출물

```
docs/design/audit-2026-06-13/
├── report.md            # 본 문서
├── .gitignore           # shots/ 제외(용량)
└── shots/               # 렌더 4-BP 스크린샷(로컬 — git 제외)
```

## 6. 한계

- 시각 비교(vision)는 ±2px 픽셀 측정이 아닌 구조·비례 대조. 절대 픽셀 정합은 2026-06-10 numeric 감사가 SSoT, 본 패스는 그 위 모션 변경의 **회귀 부재**를 확인하는 목적.
- 사진/썸네일은 실데이터(2026-06-10 이후 일부 수령) — 콘텐츠 차이로 인한 마조네리 높이 변동은 비교 제외.
