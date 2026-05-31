// @myorg/db 패키지 진입점 — 스키마·클라이언트·타입을 한 곳으로 모아 재수출
export * from "./schema";
// schema 를 네임스페이스로도 노출 — drizzle 쿼리 빌더에서 `schema.users` 형태로 접근 가능
export * as schema from "./schema";
export { db, type Database } from "./client";
export { ALL_CATEGORY_SLUG } from "./schema/categories";
export { seed, INITIAL_CATEGORIES, type SeedOptions } from "./seed";
