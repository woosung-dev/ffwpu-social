// 사이트 전역 SEO/메타 상수 단일 출처 — metadataBase·OG 기본값·sitemap 에서 공용 사용.
// 배포 시 NEXT_PUBLIC_SITE_URL 을 실제 도메인으로(예: https://sowgood.kr). 미설정 시 로컬 폴백.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3100";

export const SITE_NAME = "사회공헌단 Sow Good";

// 구글 사이트명(검색결과 도메인 자리) 후보 — WebSite.alternateName 으로 짧은 브랜드명도 함께 제시.
// 구글은 사이트당 이름 1개만 채택하므로 SITE_NAME 이 정본, 이건 SITE_NAME 이 선택되지 않았을 때의 대안이다.
// 배열 순서 = 선호 순서 (구글 공식 site-names 문서 권고). 한글 표기는 사회공헌국 확정 대기 —
// 구글 AI Overview 가 자체적으로 "쏘굿" 을 쓰고 있어 우선 그 표기를 함께 제시한다.
export const SITE_ALT_NAME = ["Sow Good", "사회공헌단", "쏘굿"];

export const SITE_DESCRIPTION =
  "세계평화통일가정연합 신한국협회 사회공헌국 Sow Good — 쌀 나눔으로 따뜻한 변화를 이어갑니다.";

// 커버 없는 글·랜딩·목록의 기본 OG 썸네일 — next/og 동적 생성 라우트(1200×630)
export const DEFAULT_OG_IMAGE = "/api/og";
