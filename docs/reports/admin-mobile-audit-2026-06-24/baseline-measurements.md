# 어드민 모바일 반응형 — 베이스라인 객관 측정 (2026-06-24)

워크트리 dev `localhost:3200`. 측정: `documentElement.scrollWidth` vs `innerWidth`(+1 허용), 뷰포트 밖 요소(`overflow-x` 컨테이너 자손 제외). 스크린샷: `baseline/<page>-<vw>.png`.

## C1/C2 페이지 가로 오버플로 — 360px 1차 스캔

| 화면 | 360 scrollW | overflowBy | 판정 | 주요 offender |
|------|-------------|-----------|------|---------------|
| dashboard | 405 | **+45** | ❌ FAIL | `인기 글` 리스트 `li.flex.justify-between` + `span.shrink-0.tabular-nums`(통계, w164) → 행 w364. 기간 선택 행도 의심 |
| news-manage | 377 | **+17** | ❌ FAIL | 툴바 `div.flex.items-center.gap-2`(w361) + `a.inline-flex.shrink-0`(새 글 작성 CTA) |
| editor-new | 391 | **+31** | ❌ FAIL | offender 0 검출 — Tiptap 툴바 내부/`fixed` 하단바 의심(스크린샷 확인 필요) |
| news-featured | 345 | -15 | ✅ | — |
| landing | 345 | -15 | ✅ | — |
| main-story | 345 | -15 | ✅ | — |
| categories | 345 | -15 | ✅ | — |
| kpi | 345 | -15 | ✅ | — |
| accounts | 360 | 0 | ✅(경계) | — |
| accounts(add dialog) | dlg w328, margin16 | — | ✅ | DialogContent `max-w-[calc(100%-2rem)]` 정상 |
| login | (인증 시 /admin 리다이렉트) | — | ⏳ | 최종 검증 시 logout 후 캡처 |

768/1024 는 전 화면 오버플로 없음(dashboard/news-manage/editor 확인). editor 768: 데스크탑 툴바가 내부 `overflow-x` 로 스크롤(페이지 미오버플로).

## 해석
- **객관 하드 오버플로 3건**: dashboard·news-manage·editor (모두 360). 사용자 체감 "깨짐"의 1차 후보.
- 나머지 6화면은 360 페이지 오버플로 없음 → **시각·기능 깨짐(C5~C9: 잘림·겹침·cramped·탭타깃·드래그행)** 은 스크린샷 기반 audit 으로 확정.
- 다이얼로그(shadcn)는 반응형 정상.

## 스크린샷 파일 (baseline/)
각 화면 `-360 / -768 / -1024.png` (login 제외, accounts 추가로 `-dialog-360`).
