// 브라우저에서 분석 이벤트 payload를 만드는 클라이언트 유틸
import { getAnonSessionId } from "@/client/lib/anon-session";
import type { AnalyticsEventInput } from "./schemas";

function pickUtm(searchParams: URLSearchParams, key: string): string | undefined {
  return searchParams.get(key)?.slice(0, 500) || undefined;
}

function getUserAgentFamily(): AnalyticsEventInput["userAgentFamily"] {
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Chrome/") || ua.includes("CriOS/")) return "Chrome";
  if (ua.includes("Safari/")) return "Safari";
  return "Other";
}

export function buildAnalyticsPayload(
  input: Pick<AnalyticsEventInput, "eventType" | "newsId">,
): AnalyticsEventInput {
  const url = new URL(window.location.href);
  return {
    ...input,
    sessionId: getAnonSessionId(),
    path: `${url.pathname}${url.search}`,
    referrer: document.referrer || undefined,
    utmSource: pickUtm(url.searchParams, "utm_source"),
    utmMedium: pickUtm(url.searchParams, "utm_medium"),
    utmCampaign: pickUtm(url.searchParams, "utm_campaign"),
    userAgentFamily: getUserAgentFamily(),
  };
}
