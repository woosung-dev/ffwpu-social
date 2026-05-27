// 도메인 public API — db.ts 격리, actions/service/types/components 만 외부 노출 (ADR-024)
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

// 공유 컴포넌트 (D-4) — 사용자(src/client)·어드민(src/admin) 양쪽이 이 경로로만 import
export { ArticleCard, type ArticleLite } from "./components/ArticleCard";
export { StoryCard } from "./components/StoryCard";
export {
  FeaturedStoryCard,
  type FeaturedStory,
} from "./components/FeaturedStoryCard";
export { Heart } from "./components/Heart";
export { CategoryTabs } from "./components/CategoryTabs";
export { Pagination } from "./components/Pagination";
export { KpiCard } from "./components/KpiCard";
