// 홈 구조화 데이터(Organization + WebSite @graph) 빌더 — 구글 사이트명 인식의 1순위 신호. 순수 함수라 단위 테스트 가능 (ADR-057/063)
import {
  SITE_ALT_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_PARENT_ORG,
  SITE_URL,
} from "@/lib/site";

// 도메인 루트에만 둔다 (서브디렉토리는 자체 사이트명을 가질 수 없음). 이름 문자열은 ADR-062 동결 — 여기서 바꾸지 않는다.
// @id 로 두 노드를 묶고 WebSite.publisher → Organization, Organization.parentOrganization → 상위 조직(실제 관계만 기술).
export function buildLandingJsonLd() {
  const orgId = `${SITE_URL}/#organization`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: SITE_NAME,
        alternateName: SITE_ALT_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/icon.png`,
        description: SITE_DESCRIPTION,
        parentOrganization: {
          "@type": "Organization",
          name: SITE_PARENT_ORG.name,
          url: SITE_PARENT_ORG.url,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        alternateName: SITE_ALT_NAME,
        url: SITE_URL,
        inLanguage: "ko",
        publisher: { "@id": orgId },
      },
    ],
  };
}
