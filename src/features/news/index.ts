// 도메인 server-side public API — db.ts 격리, actions/service/schemas 만 외부 노출 (ADR-024)
// 외부에서 features/news/db.ts 직접 import 금지. service 또는 actions 경유.
// Client Component 에서 사용하는 도메인 UI 컴포넌트는 별도 client-safe barrel — @/features/news/components
import "server-only"; // client bundle 유입 시 빌드 에러 (codex v2 P2 — 경계 강제)

export {
  listNewsAction,
  getNewsDetailAction,
  createNewsAction,
  updateNewsAction,
  deleteNewsAction,
  publishNewsAction,
  searchTagsAction,
  uploadImageAction,
  type ActionResult,
  type UploadImageInput,
} from "./actions";

export {
  listNews,
  getNewsDetail,
  listCategories,
  getAdminNewsDetail,
  listNewsForAdmin,
  getAdminDashboard,
} from "./service";

export {
  newsInputSchema,
  listNewsQuerySchema,
  ALL_CATEGORY_SLUG,
  type NewsInput,
  type ListNewsQuery,
} from "./schemas";
