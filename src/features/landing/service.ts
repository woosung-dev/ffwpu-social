// 랜딩 전역 설정 비즈니스 로직 — db import 금지, DB 레이어 함수만 호출 (fullstack.md §3)
import "server-only";

import * as landingDb from "./db";

export async function getFeaturedVisibleCount() {
  return landingDb.getFeaturedVisibleCount();
}

export async function updateFeaturedVisibleCount(count: number) {
  return landingDb.setFeaturedVisibleCount(count);
}
