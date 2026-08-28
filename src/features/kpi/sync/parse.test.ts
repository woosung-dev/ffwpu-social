// 시트 CSV 파싱·누적 지표 추출 검증 (순수 함수)
import { describe, expect, it } from "vitest";

import {
  extractCumulativeMetrics,
  parseCsv,
  parseSheetNumber,
} from "./parse";

describe("parseCsv", () => {
  it("따옴표 필드 안의 콤마를 한 필드로 보존한다", () => {
    expect(parseCsv('a,"4,973 명",c')).toEqual([["a", "4,973 명", "c"]]);
  });

  it("CRLF·LF 줄바꿈을 행으로 분리한다", () => {
    expect(parseCsv("a,b\r\nc,d")).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });

  it('따옴표 이스케이프("")를 한 개의 따옴표로 푼다', () => {
    expect(parseCsv('"a""b",c')).toEqual([['a"b', "c"]]);
  });
});

describe("parseSheetNumber", () => {
  it("그룹 정수에서 숫자만 추출(단위 무시)", () => {
    expect(parseSheetNumber("4,973 명")).toBe(4973);
  });

  it("소수도 추출", () => {
    expect(parseSheetNumber("529.4 시간")).toBe(529.4);
  });

  it("'건' 단위 정수", () => {
    expect(parseSheetNumber("313 건")).toBe(313);
  });

  it("숫자가 없으면 null", () => {
    expect(parseSheetNumber("집계중")).toBeNull();
  });
});

// 실제 시트 레이아웃 모사 — 병합셀로 라벨/값 사이 빈 칸, '이번 주'·주차 표는 매칭 제외 확인
const SHEET_CSV = [
  "사회공헌국 주간 봉사활동 추이,,,,,,",
  "최종 갱신: 2026-06-18 14:22,,,,,,",
  ",,,,,,",
  "총 누적 지표,,,,,,",
  "총 누적 활동건수,,총 누적 봉사참여자수,,총 누적 봉사시간,,연인원봉사시간 누계",
  '313 건,,"4,973 명",,529.4 시간,,"7,873.5 시간"',
  "이번 주 신규 ▲ 137건,,이번 주 신규 ▲ 2675명,,,,",
  "이번 주 (6/12~6/18),,,,,,",
  "총 봉사건수,,총 봉사참여자수,,총 봉사시간,,연인원봉사시간",
  '137 건,,"2,675 명",,178.0 시간,,"3,422.5 시간"',
].join("\n");

describe("extractCumulativeMetrics", () => {
  const metrics = extractCumulativeMetrics(parseCsv(SHEET_CSV));
  const bySlug = new Map(metrics.map((m) => [m.slug, m]));

  it("매핑된 3개 누적 지표의 숫자만 추출한다", () => {
    expect(metrics).toHaveLength(3);
    expect([...bySlug.keys()].sort()).toEqual([
      "event_count",
      "volunteer_count",
      "volunteer_period",
    ]);
  });

  it("봉사참여자수 → volunteer_count (병합셀 우측 스캔, 숫자만)", () => {
    expect(bySlug.get("volunteer_count")).toMatchObject({
      value: 4973,
      externalId: "총 누적 봉사참여자수",
    });
  });

  it("연인원봉사시간 누계 → volunteer_period (총 누적 봉사시간 아님)", () => {
    expect(bySlug.get("volunteer_period")).toMatchObject({
      externalId: "연인원봉사시간 누계",
    });
  });

  it("소수는 버림 — 7,873.5 → 7873 (KPI 카드 숫자가 카드를 넘치지 않게)", () => {
    // 시트 원본은 "7,873.5 시간". parseSheetNumber 는 7873.5 를 그대로 주지만,
    // 들여오는 지표는 정수로 내린다. 올림이 아니라 버림 — 실적을 실제보다 크게 표시하지 않는다.
    expect(parseSheetNumber('"7,873.5 시간"')).toBe(7873.5);
    expect(bySlug.get("volunteer_period")?.value).toBe(7873);
    expect(Number.isInteger(bySlug.get("volunteer_period")!.value)).toBe(true);
  });

  it("추출된 모든 지표가 정수다", () => {
    for (const m of metrics) {
      expect(Number.isInteger(m.value)).toBe(true);
    }
  });

  it("활동건수 → event_count", () => {
    expect(bySlug.get("event_count")?.value).toBe(313);
  });

  it("'이번 주' 주간 지표(누적 아님)는 매칭하지 않는다", () => {
    // 4,973(누적) 이지 2,675(주간) 이 아님
    expect(bySlug.get("volunteer_count")?.value).toBe(4973);
  });
});

// 쌀 나눔 대장 시트 — 실제 CSV export 구조(2026-08-28 실측). 행 0 라벨 / 행 1 총계 / 행 2+ 행사별.
const RICE_CSV = [
  "순번,행사명,행사일,쌀화환 참여기관 수,쌀 나눔 포대 수,쌀 나눔 포대 무게(kg),나눔가정 수,나눔 단체 수,나눔 기관명,비고",
  ',,,175,323,"3,210",106,6,,',
  "1,천일국 14년 한식 파주원전 참배식,2026. 4. 6,16,32,300,22,2,흑석종합사회복지관 6포,",
  '3,창립 72주년 기념식,2026. 6. 15,52,102,"1,020",X,4,철원 푸드뱅크 30포,',
].join("\n");

describe("extractCumulativeMetrics — 쌀 나눔 대장(kind: story)", () => {
  const metrics = extractCumulativeMetrics(parseCsv(RICE_CSV), "story");
  const bySlug = new Map(metrics.map((m) => [m.slug, m]));

  it("총계 행에서 story 통계 3개만 추출한다", () => {
    expect([...bySlug.keys()].sort()).toEqual([
      "story_local_facilities",
      "story_supported_households",
      "story_supported_orgs",
    ]);
  });

  it("쌀 나눔 포대 무게(kg) → 그룹 숫자 콤마 제거", () => {
    expect(bySlug.get("story_supported_orgs")).toMatchObject({
      value: 3210,
      externalId: "쌀 나눔 포대 무게(kg)",
    });
  });

  it("나눔가정 수 / 나눔 단체 수", () => {
    expect(bySlug.get("story_supported_households")?.value).toBe(106);
    expect(bySlug.get("story_local_facilities")?.value).toBe(6);
  });

  it("행사별 행(2행 이하)의 숫자를 총계로 오인하지 않는다", () => {
    // 첫 행사 행의 22가정/2단체가 아니라 총계 106/6
    expect(bySlug.get("story_supported_households")?.value).not.toBe(22);
  });

  it("미매핑 컬럼(쌀화환 참여기관 수·쌀 나눔 포대 수)은 무시한다", () => {
    expect(metrics.map((m) => m.value)).not.toContain(175);
    expect(metrics.map((m) => m.value)).not.toContain(323);
  });

  it("kind 를 안 넘기면 impact 맵이라 story 라벨은 안 잡힌다 (시트 교차 오염 방지)", () => {
    expect(extractCumulativeMetrics(parseCsv(RICE_CSV))).toHaveLength(0);
  });
});
