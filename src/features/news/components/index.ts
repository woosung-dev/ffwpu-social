// client-safe components barrel — Client Component 에서 import 시 actions/service/db (server-only) 가 함께 묶이지 않도록 분리
export { ArticleCard, type ArticleLite } from "./ArticleCard";
export { FeaturedStoryCard, type FeaturedStory } from "./FeaturedStoryCard";
export { Heart } from "./Heart";
export { CategoryTabs, type CategoryTabItem } from "./CategoryTabs";
// Pagination 은 notices 와 공용이라 src/client/components 로 승격 (ADR-042). 기존 소비자 위해 re-export 유지
export { Pagination } from "@/client/components/Pagination";
export { SearchInput } from "./SearchInput";
