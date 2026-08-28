---
status: active
opened: 2026-08-28
branch: feat/rice-sheet-sync
slice_id: TASK-20260828-rice-sheet-sync
spec_status: confirmed
brainstorming_done: 2026-08-28
---

# 쌀나눔 시트 → StorySection 통계 자동 반영

## 문제

랜딩 StorySection 통계("나눔 쌀 2,370kg / 나눔 가정 106가정 / 나눔 시설 6개 시설")가
운영자 수기 입력이라 낡았다. 사회공헌국이 관리하는 쌀나눔 시트에는 3,210kg 이 들어 있다.

시트: `docs.google.com/spreadsheets/d/1rHTzNuqFA1d0BQFhmThIGEwJZsK5hFHPJttbhqzV1vw` (gid=0)

## 시트 구조 (2026-08-28 실측, CSV export 200 OK)

행 0 = 라벨, 행 1 = 총계(행사별 합계). 기존 파서(라벨 행 → 다음 행 값)가 **수정 없이** 맞는다.

| 시트 컬럼 | 총계 | → slug | 화면 |
|---|---|---|---|
| 쌀 나눔 포대 무게(kg) | 3,210 | `story_supported_orgs` | 나눔 쌀 |
| 나눔가정 수 | 106 | `story_supported_households` | 나눔 가정 |
| 나눔 단체 수 | 6 | `story_local_facilities` | 나눔 시설 |

`쌀화환 참여기관 수`(175) · `쌀 나눔 포대 수`(323) 는 미사용 — 사용자 결정 2026-08-28
(Figma 3열 레이아웃 유지 + '참여기관'은 기부처라 나머지 3개와 의미 축이 다름).

## 핵심 설계 결정

**story 통계를 impact KPI 와 같은 "숫자 우선" 모델로 전환한다.**

현재 story 통계는 `displayValue` 자유 텍스트 전용 (`value`/`unit` 을 에디터가 null 로 강제).
시트 동기화는 `value` 만 갱신하는 모델이라(단위·라벨은 운영자 소유) 이 구조로는 연결이 불가능하다.

- `StorySection` 렌더 → `formatKpiDisplay(value, unit, displayValue)` (impact 와 동일 함수)
- `StoryStatsEditor` → 숫자·단위 칸 추가 + "시트에서 불러오기" 버튼
- 마이그레이션 → story 3행의 `unit` 을 현재 화면 표기에 맞춰 backfill (`kg` / `가정` / `개 시설`)

**왜 안전한가**: `formatKpiDisplay` 는 `value == null` 이면 `displayValue` 를 그대로 반환한다.
prod 는 현재 `value=null` 이므로 마이그레이션 직후 화면은 **한 글자도 안 바뀐다**.
첫 동기화가 `value` 를 채우는 순간부터 "3,210" + `unit` 으로 자동 전환된다.

## 단계

1. `mapping.ts` — 시트별 라벨→slug 맵 2개 (impact / story) + 시트 종류 타입 → verify: `pnpm tsc --noEmit`
2. `parse.ts` — `extractCumulativeMetrics(grid, lookup)` 로 lookup 주입 (하드코딩 제거) → verify: `parse.test.ts` 통과 + 신규 story 케이스
3. `sheet-reader.ts` / `sync/service.ts` — 시트 종류별 env·동기화. 시트 하나 실패가 다른 시트를 막지 않게 격리 → verify: 단위 테스트
4. 숫자 우선 전환 — `StorySection` · `StoryStatsEditor` · `schemas` · `service` · 마이그레이션 → verify: `pnpm build` + 로컬 렌더
5. cron 라우트 + `.env.example` + `docs/deploy-env-checklist.md` → verify: 로컬 curl 로 라우트 200
6. 문서 — ADR + `docs/TODO.md` 개인정보 escalation

## 검증

```bash
pnpm tsc --noEmit && pnpm lint && pnpm test
pnpm build
# 로컬 동기화 스모크
curl -H "Authorization: Bearer $CRON_SECRET" localhost:3100/api/cron/sync-kpi
```

## 🔴 사회공헌국 escalation (ADR-004 개인정보)

시트가 **링크 공개** 상태인데 실명(`오인철 서울남부 부교구장 부친 및 오충완 경기북부 교구장 조부`)과
수혜 기관명이 들어 있다. 사이트에는 숫자 3개만 나가므로 노출 경로는 없지만, 시트 자체를
'제한됨' 으로 되돌리고 기존 KPI 시트처럼 Apps Script 경유로 바꾸는 편이 맞다.
구현은 env URL 만 교체하면 되므로 **이 작업의 차단 요인은 아니다**.

## TL;DR

- **문제**: StorySection 쌀나눔 통계가 수기 입력이라 낡음(2,370kg vs 시트 3,210kg)
- **원인**: story 통계가 `displayValue` 자유 텍스트 전용이라 시트 동기화(`value` 갱신) 모델과 연결 불가
- **채택안**: story 통계를 impact 와 같은 숫자 우선 모델로 전환 + 시트별 라벨 맵 2개로 파서 일반화
- **파일**: `features/kpi/sync/{mapping,parse,sheet-reader,service}.ts` · `features/kpi/{db,schemas,service,actions}.ts` · `client/sections/StorySection.tsx` · `admin/components/StoryStatsEditor.tsx` · `api/cron/sync-kpi/route.ts` · 마이그레이션 1
- **검증**: tsc + lint + test + build + 로컬 cron curl
- **폴백**: `value=null` 이면 기존 `displayValue` 가 그대로 렌더 → 마이그레이션만 적용된 상태의 화면 변화 0
