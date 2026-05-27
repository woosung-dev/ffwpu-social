// 도메인 public API — db.ts 격리, actions/service/types만 외부 노출 (ADR-024)
// 외부에서 features/news/db.ts 직접 import 금지. service 또는 actions 경유.
export {
  listNewsAction,
  getNewsDetailAction,
  createNewsAction,
  type ActionResult,
} from "./actions";

export { listNews, getNewsDetail } from "./service";

export {
  newsCategorySchema,
  newsInputSchema,
  listNewsQuerySchema,
  type NewsCategoryValue,
  type NewsInput,
  type ListNewsQuery,
} from "./schemas";
