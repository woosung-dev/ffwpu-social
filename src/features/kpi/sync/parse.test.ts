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

  it("봉사시간 → volunteer_period (소수 보존)", () => {
    expect(bySlug.get("volunteer_period")?.value).toBe(529.4);
  });

  it("활동건수 → event_count", () => {
    expect(bySlug.get("event_count")?.value).toBe(313);
  });

  it("'이번 주' 주간 지표(누적 아님)는 매칭하지 않는다", () => {
    // 4,973(누적) 이지 2,675(주간) 이 아님
    expect(bySlug.get("volunteer_count")?.value).toBe(4973);
  });
});
