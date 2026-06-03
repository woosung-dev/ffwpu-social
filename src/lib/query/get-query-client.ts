// React Query 클라이언트 팩토리 — 서버: 요청별 새 인스턴스 / 브라우저: 싱글톤 (TanStack Advanced SSR 공식 레시피)
import {
  QueryClient,
  defaultShouldDehydrateQuery,
} from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // SSR 직후 클라이언트 즉시 refetch 방지 (공식 권장)
        staleTime: 60 * 1000,
      },
      dehydrate: {
        // pending 쿼리 포함 — prefetchQuery 를 await 하지 않고 Promise 자체를 Suspense 스트리밍
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  // isServer 는 v5.101 deprecated — window 직접 체크
  if (typeof window === "undefined") {
    // 서버: 요청 간 캐시 누수 방지 — 항상 새로
    return makeQueryClient();
  }
  // 브라우저: 초기 렌더 suspend 시 재생성 방지 — 싱글톤
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
