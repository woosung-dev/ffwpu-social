// 도메인 패키지 barrel — 하위 슬라이스(news/auth/storage)는 서브패스 import 권장
export * as news from "./news";
export * as authAdmin from "./auth/admin";
export * as authPublic from "./auth/public";
export * as authShared from "./auth/shared";
export * as storage from "./storage";
