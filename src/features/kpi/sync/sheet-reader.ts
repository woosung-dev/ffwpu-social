// 시트 CSV 읽기 어댑터 — 공개 게시 CSV(채택) / 향후 서비스 계정(비공개)으로 교체 가능하도록 인터페이스 분리
import "server-only";

import { SHEET_CONFIG, type SheetKind } from "./mapping";

export interface SheetReader {
  fetchCsv(): Promise<string>;
}

// 공개 게시(또는 링크 공개) 시트의 CSV export URL 을 그대로 fetch. 인증 불필요.
// 시트가 '제한됨' 이면 이 URL 은 401 → Apps Script 웹앱 URL 로 env 만 교체하면 동일 인터페이스로 동작한다.
export class PublishedCsvReader implements SheetReader {
  constructor(private readonly url: string) {}

  async fetchCsv(): Promise<string> {
    const res = await fetch(this.url, { cache: "no-store", redirect: "follow" });
    if (!res.ok) {
      throw new Error(`시트 fetch 실패: HTTP ${res.status}`);
    }
    return res.text();
  }
}

// env 기반 기본 reader. URL 미설정은 명시 에러(db/index.ts 의 DATABASE_URL 가드와 동일 패턴).
export function getSheetReader(kind: SheetKind = "impact"): SheetReader {
  const { envKey, displayName } = SHEET_CONFIG[kind];
  const url = process.env[envKey];
  if (!url) {
    throw new Error(
      `${envKey} is not set (${displayName} 시트). Check .env.local`,
    );
  }
  return new PublishedCsvReader(url);
}
