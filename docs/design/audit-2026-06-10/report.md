<!-- Figma 정합 전수 감사 최종 리포트 — 하트 B 시안 + 3면×4BP Generator-Evaluator 멀티에이전트 (2026-06-10) -->

# Figma 정합 전수 감사 리포트 (2026-06-10)

> 범위: 홈 랜딩(96:5908) + 소식 목록(95:9359) + 소식 상세(749:7920) + 컴포넌트 시트(97:10250) × 4BP(375/768/1025/1440) + 경계(640/767/1024).
> 방법: Generator–Evaluator 분리 멀티에이전트 — Figma 스펙 추출(6) → Playwright 실측(15 표면) → 수치·시각 비교(15) → 적대적 refute(4) → 수정(6+5건) → 재측정·재검증(9) → 표적 검증(1). 허용오차 ±2px.
> 브랜치: `feat/news-heart-bottom-fidelity` = main + PR #40(figma-fidelity-sweep) 머지 + 사용자 커밋 8cb0995(관리자 분석·예약 발행).

## 1. 핵심 변경 — 소식 상세 하트 B 시안 (사용자 확정)

| 항목 | 변경 전 (A, 93:8810) | 변경 후 (B, 749:7920) |
|---|---|---|
| 위치 | 상단 날짜줄 우측 배지 | **하단 공유줄 우측 필 버튼** |
| 형태 | ♡ + 카운트 | ♡ + **"공감해요"** + 카운트 (pill, border 1.3px·radius full) |
| 상태 | — | Default 외곽선 / 클릭 시 ♥ 채움 + 카운트 `brand-vivid` [추론 — §4-1] |
| 색 | — | `ink-date`(#6F7682) — Figma #959BA9 의 AA 상향 (allowlist #11 선례) |

서버 액션·서비스·DB 무변 (ADR-026 그대로). 카드 호버 배지·관련 글 하위호환 유지. 토글·낙관 업데이트·원복 실측 검증 완료.

## 2. 수치 요약

| 단계 | 결과 |
|---|---|
| Round 1 비교 (15 에이전트) | raw 201건 → **confirmed 108** / allowlisted 28 / artifact 22 / invalid 43 |
| 수정 1차 (6 Generator 병렬) | 17개 파일, confirmed 108건 중 정책 기각 제외 전량 반영 |
| Round 2 재검증 (9 에이전트) | **fixed 90 / policy-rejected 16 / regressed 2** + 신규 P1 1·P2 관찰 다수 |
| 수정 2차 (표적 5건) | CTA h40·767 이미지칼럼 343·Story 칩 h35·Partners 768 중앙·배너 h132 |
| Round 3 표적 실측 | **5/5 PASS** — 수렴 종료 |
| 품질 게이트 | tsc 0 · lint 0 · vitest 52/52 · build (스모크 수행) · 가로 오버플로 0 · 콘솔 에러 0 |

대표 수정 (전체 내역: `findings-round1.json` + git diff):
- **랜딩**: 헤더↔히어로 40px 간격 복원(768/1025/1440 단일 루트코즈), Story 칩·헤딩·Result 통계 구조(1440 285×56), KPI 카드3 패딩·우정렬, ArticleGrid 4-BP 패딩·마조네리 열16/행20·CTA #E9CFFF·다크블록 인셋, Partners radius 8/20.
- **소식 목록**: Featured 미니 로고 복원·타이포 4-BP(20/20/25/34)·인디케이터 [22,17,17,17]·gap2·이미지 aspect(325/230→580/395), 수직 리듬(밴드 py30·그리드→페이지네이션 80·푸터 100/110), 1025 헤딩 28px, 767 colGap 18.
- **소식 상세**: 하트 B + 본문 lg 20px/lh1.5, 제목 lh1.5, 배경 그라데이션 밴드 신설(P0), 스크롤탑 다크 원형 55·화살표 36·우측 90px, 수직 리듬(50/70/16/40).
- **컴포넌트**: 헤더 pill h 33/40·nav↔검색 gap 16/20/24, 페이지네이션 화살표 currentColor 상태색(2페이지에서 prev 가 비활성색으로 보이던 실버그 해소)·셀 연접 gap0, 카드 하트 배지 14px/16px.

## 3. 의도적 이탈 — 보존 (수정 안 함)

allowlist.md 21항목 + 정책 기각 16건. 주요:

| 항목 | 사유 |
|---|---|
| 본문성 텍스트 14px 지정 4곳 (Featured 본문 375/768·Story 설명) → **16px 유지** | 도메인 절대 제약 "본문 16px 이상" (의도서 §7 접근성). 코드 주석 명기 |
| SubBanner 카피 leading-relaxed (+12px) | PR #40 접근성 우선 결정 수용 |
| 상세 본문 컬럼 905 vs 900 | PR #40 — 목록 lg 밴드 905 통일 |
| 하트 pill·날짜 #959BA9 → #6F7682 | WCAG AA 상향 선례 (2.79:1 → 4.58:1) |
| heroEllipse x 오프셋 (−13/−8/−16, BP별 상이) | 디자이너 수동 배치 노이즈 판정 [추론] — 시각 영향 미미 |
| 상세 Title/Tag/Text +4px 들여쓰기·태그 h38 | 디자이너 오프셋 노이즈·PR #40 수용 |
| 공유 버튼 2개 (카카오/페북/링크 3개 대신) | v1.1 SDK 보류 결정 (share-row 주석) — §4-4 참조 |
| 검색·정렬 툴바, 마조네리 columns 구현, sm 640 예외 등 | ADR-035/036/037 기존 결정 |

## 4. 디자이너/사회공헌국 확인 필요 (escalation)

1. **하트 pill 클릭(채움) 상태** — Figma 에 pill 의 Click 변형 미노출. 구형 Heart 컴포넌트(114:8301)의 #B35FEB 채움을 [추론] 적용. 확정 필요.
2. **Featured 미니 로고 vs 카테고리 칩** — Figma SSoT 원칙("Figma 없으면 코드 없음")에 따라 꽃 미니 로고 복원·카테고리 칩 제거. 칩(실데이터 카테고리 노출)이 제품 의도였다면 번복 가능 — 한 줄 수정.
3. **Partners 768 의 5로고 2행 배치** — Figma 는 더미 중복 3셀이라 미정의. 중앙 정렬 채택 (1행은 Figma 산식과 동치).
4. **공유 버튼 데스크탑 동작 중복** — navigator.share 미지원 데스크탑에서 공유·링크복사 두 버튼이 같은 동작. v1.1 카카오/페북 SDK 도입 전까지 데스크탑에서 첫 버튼 숨김 고려 (docs/TODO.md 등재).
5. **Story Result 통계 1440 폭 250 vs 285** — 실데이터 텍스트 길이 종속. 실데이터 확정 후 재확인.
6. **본문 14px 4곳** — 접근성 16px 유지가 맞는지 디자이너와 최종 합의 권장.

## 5. 산출물 맵

```
docs/design/audit-2026-06-10/
├── allowlist.md            # 의도적 이탈 21항목 + 측정 아티팩트 (refuter 기준)
├── specs/                  # Figma 추출 스펙 6종 (상세/목록×2/랜딩×2/컴포넌트)
├── figma-shots/            # Figma 원본 스크린샷 17장
├── measured/               # Round 1 실측 JSON 15 (PNG 는 용량상 git 제외·로컬 보존 — .gitignore)
├── measured-r2/            # Round 2 실측 JSON 15 (동일)
├── findings-round1.json    # 판정 전량 (confirmed/allowlisted/artifact/invalid)
├── fixes/                  # 그룹별 수정 지시서 6종
└── report.md               # 본 문서
```

## 6. 한계

- 소식 상세 Figma 는 1440 프레임 단독 — 375/768/1025 상세는 반응형 sanity(오버플로 0·겹침 없음·폰트 역전 없음)만 검증, 픽셀 대조 불가.
- 사진 16장 placeholder 상태 — 이미지 콘텐츠·실비율 차이는 비교 제외 (실데이터 수령 후 Featured airy 갭·마조네리 높이 자연 변동 예상).
- Round 1 의 visual-news-detail 비교가 API 장애로 1회 실패 → Round 2 에서 수행 완료.
