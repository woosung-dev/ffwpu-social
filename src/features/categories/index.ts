// categories 도메인 public API — server-only (drizzle / auth 의존). Client Component import 금지
import "server-only"; // client bundle 유입 시 빌드 에러 (codex v2 P2 — 경계 강제)

export {
  createCategoryAction,
  updateCategoryAction,
  reorderCategoriesAction,
} from "./actions";
export { type ActionResult } from "@/lib/action-result";
export {
  CATEGORY_SLUG_REGEX,
  createCategorySchema,
  updateCategorySchema,
  reorderCategoriesSchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type ReorderCategoriesInput,
} from "./schemas";
export { listAllForAdmin } from "./service";
