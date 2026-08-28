// 시트 CSV 파싱 + 지표 추출 — 순수 함수(네트워크·DB 의존 0, 단위 테스트 대상).
// 라벨 맵은 호출측이 주입한다(시트 2개: 협회 누적 지표 / 쌀나눔 대장).
import { SHEET_CONFIG, type SheetKind, type SyncTargetSlug } from "./mapping";

export type ParsedMetric = {
  slug: SyncTargetSlug;
  // 시트에서 추출한 숫자. 동기화는 이 값만 갱신 → 화면은 value+unit 으로 자동 표시.
  // 항상 정수다 — 아래 truncateToInt 참조.
  value: number;
  // 시트 원본 라벨 — 추적/디버깅
  externalId: string;
};

// 라벨 정규화 — 앞뒤 공백 제거 + 내부 연속 공백 1칸 (시트 셀 공백 변동 흡수)
function normalizeLabel(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

// 라벨 맵 → 정규화 라벨 역인덱스 (시트 셀 공백 변동 흡수)
export function buildLabelLookup(
  labels: Record<string, SyncTargetSlug>,
): Record<string, SyncTargetSlug> {
  return Object.fromEntries(
    Object.entries(labels).map(([label, slug]) => [normalizeLabel(label), slug]),
  );
}

// 시트 종류별 역인덱스
const LOOKUP_BY_KIND: Record<SheetKind, Record<string, SyncTargetSlug>> = {
  impact: buildLabelLookup(SHEET_CONFIG.impact.labels),
  story: buildLabelLookup(SHEET_CONFIG.story.labels),
};

// 최소 CSV 파서 — 따옴표 필드 안의 콤마·줄바꿈 보존("4,973 명" 같은 그룹 숫자), RFC4180 "" → " 이스케이프
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/\r\n?/g, "\n"); // CRLF 정규화
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  row.push(field);
  rows.push(row);
  return rows;
}

// 셀에서 숫자만 추출(소수 허용) — "4,973 명"→4973 · "529.4 시간"→529.4 · "313 건"→313 · 숫자없음→null. 단위는 운영자 소유라 무시.
export function parseSheetNumber(raw: string): number | null {
  const match = raw.trim().match(/[\d,]+(?:\.\d+)?/);
  if (!match) return null;
  const n = Number(match[0].replace(/,/g, ""));
  return Number.isNaN(n) ? null : n;
}

// 시트에서 들여오는 지표는 정수로 내린다(버림).
// 왜: 시트의 '연인원봉사시간 누계' 같은 셀이 16,078.5 처럼 소수를 갖는데, 그대로 들어오면
// 랜딩 KPI 카드가 "16,078.5시간" 이 되어 whitespace-nowrap 숫자가 카드를 넘친다 (사용자 보고 2026-08-28).
// 올림·사사오입이 아니라 버림인 이유: 누적 실적 수치를 실제보다 크게 표시하지 않는다 (ADR-004 재정 투명성).
// 운영자가 어드민에서 직접 입력하는 값은 대상이 아니다 — 특수 표기가 필요할 때의 자유도를 남긴다.
function truncateToInt(n: number): number {
  return Math.trunc(n);
}

// 그리드에서 라벨 ↔ 다음 행 숫자 추출. 라벨 셀 발견 → 같은 열의 다음 행 값(비면 우측 3칸 스캔, 병합셀 오프셋 대비). slug 당 첫 매치만. 숫자 없으면 제외(기존 값 보존).
// 두 시트 모두 "라벨 행 바로 아래가 총계 행" 구조라 같은 알고리즘을 공유한다 — 다른 건 라벨 맵뿐.
export function extractCumulativeMetrics(
  grid: string[][],
  kind: SheetKind = "impact",
): ParsedMetric[] {
  const lookup = LOOKUP_BY_KIND[kind];
  const results: ParsedMetric[] = [];
  const seen = new Set<string>();
  for (let r = 0; r < grid.length - 1; r++) {
    const labelRow = grid[r];
    const valueRow = grid[r + 1] ?? [];
    for (let c = 0; c < labelRow.length; c++) {
      const slug = lookup[normalizeLabel(labelRow[c] ?? "")];
      if (!slug || seen.has(slug)) continue;
      let rawValue = "";
      for (let cc = c; cc < Math.min(c + 4, valueRow.length); cc++) {
        if (valueRow[cc]?.trim()) {
          rawValue = valueRow[cc];
          break;
        }
      }
      const parsed = parseSheetNumber(rawValue);
      if (parsed == null) continue;
      const value = truncateToInt(parsed);
      results.push({ slug, value, externalId: normalizeLabel(labelRow[c]) });
      seen.add(slug);
    }
  }
  return results;
}
