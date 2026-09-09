// 사이트 전역 SEO/메타 상수 단일 출처 — metadataBase·OG 기본값·sitemap 에서 공용 사용.
// 배포 시 NEXT_PUBLIC_SITE_URL 을 실제 도메인으로(예: https://sowgood.kr). 미설정 시 로컬 폴백.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3100";

export const SITE_NAME = "사회공헌단 Sow Good";

// 구글 사이트명(검색결과 도메인 자리) 후보 — WebSite.alternateName 으로 짧은 브랜드명도 함께 제시.
// 구글은 사이트당 이름 1개만 채택하므로 SITE_NAME 이 정본, 이건 보조 신호다.
export const SITE_ALT_NAME = "Sow Good";

// 사회공헌국(운영 부서)과 사회공헌단 Sow Good(사이트명)을 구분해 쓴다 — 예전 문구 "사회공헌국 Sow Good" 은
// 구글이 스니펫으로 그대로 뽑아 사이트명 후보를 셋("Sow Good"·"사회공헌단 Sow Good"·"사회공헌국 Sow Good")으로
// 갈라놓았다. 홈의 모든 텍스트 소스가 SITE_NAME 문자열을 그대로 쓰도록 맞춘다 (ADR-062).
export const SITE_DESCRIPTION =
  "세계평화통일가정연합 신한국협회 사회공헌국이 운영하는 사회공헌단 Sow Good — 쌀 나눔으로 따뜻한 변화를 이어갑니다.";

// 상위 조직 — JSON-LD Organization.parentOrganization 에만 쓴다 (실제 소속 관계 기술, ADR-063). 사이트명 후보가 아니다.
export const SITE_PARENT_ORG = {
  name: "세계평화통일가정연합",
  url: "https://ffwpu.or.kr",
} as const;

// 커버 없는 글·랜딩·목록의 기본 OG 썸네일 — next/og 동적 생성 라우트(1200×630)
export const DEFAULT_OG_IMAGE = "/api/og";

// Organization.sameAs — 공식 SNS·유튜브 등 "같은 실체" 표면(LLMO 엔티티 일관성, ADR-065).
// 공식 채널 URL 은 사회공헌국 확인 후 채운다. 비어 있으면 sameAs 를 출력하지 않는다 — 추정 URL 금지.
export const SITE_SAME_AS: string[] = [];
