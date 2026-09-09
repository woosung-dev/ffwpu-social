// 홈 JSON-LD 회귀 테스트 — 사이트명 신호(name/alternateName)와 노드 연결(@id·publisher)이 깨지면 실패. SEO 테스트 0건 상태 해소 (ADR-063)
import { describe, expect, it } from "vitest";

import { buildLandingJsonLd } from "./landing-json-ld";
import { SITE_ALT_NAME, SITE_NAME, SITE_URL } from "./site";

describe("buildLandingJsonLd", () => {
  const graph = buildLandingJsonLd()["@graph"];
  const org = graph.find((n) => n["@type"] === "Organization");
  const site = graph.find((n) => n["@type"] === "WebSite");

  it("WebSite 와 Organization 이 같은 사이트명·대체명·URL 을 쓴다 (구글 문서: 홈 내 일관성)", () => {
    expect(site?.name).toBe(SITE_NAME);
    expect(org?.name).toBe(SITE_NAME);
    expect(site?.alternateName).toBe(SITE_ALT_NAME);
    expect(org?.alternateName).toBe(SITE_ALT_NAME);
    expect(site?.url).toBe(SITE_URL);
    expect(org?.url).toBe(SITE_URL);
  });

  it("WebSite.publisher 가 Organization @id 를 가리킨다", () => {
    expect(org?.["@id"]).toBeTruthy();
    expect(site && "publisher" in site ? site.publisher : undefined).toEqual({ "@id": org?.["@id"] });
  });

  it("직렬화 가능하고 </script> 탈출 대상 문자가 없다", () => {
    const json = JSON.stringify(buildLandingJsonLd());
    expect(JSON.parse(json)).toBeTruthy();
    expect(json).not.toContain("</script");
  });
});
