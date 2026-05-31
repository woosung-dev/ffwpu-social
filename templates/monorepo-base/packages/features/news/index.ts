// news 도메인 vertical slice 진입점 — 3-Layer 구조 (actions / service / db / schemas) 재노출
export * from "./schemas";
export * as newsService from "./service";
export * as newsDb from "./db";
export * as newsActions from "./actions";
