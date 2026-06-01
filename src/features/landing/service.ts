// 메인 랜딩 service — db 호출 통합. 사용자 사이트 메인 / 와 (PR C) 어드민 미리보기에서 동일 호출
import "server-only";

import * as landingDb from "./db";

export async function getLandingData() {
  const [kpiMetrics, storySlots, featuredGrid] = await Promise.all([
    landingDb.listActiveKpiMetrics(),
    landingDb.listStorySlots(),
    landingDb.listFeaturedGrid(7),
  ]);
  return { kpiMetrics, storySlots, featuredGrid };
}
