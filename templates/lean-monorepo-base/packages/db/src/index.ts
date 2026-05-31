// @repo/db 공개 진입점 — 양 앱이 import 할 표면 (client + schema + 도메인 타입 + features 어휘)
export { db, queryClient, type DB } from "./client";
// 테이블·관계·enum 의 named export (예: import { news, categories } from "@repo/db")
export * from "./schema";
// 동일 모듈을 namespace 형태로 함께 노출 — `import { schema } from "@repo/db"; schema.news` 패턴 지원
export * as schema from "./schema";
