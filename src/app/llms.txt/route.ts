// /llms.txt — 생성 AI(ChatGPT·Perplexity·Claude)용 사이트 안내서(마크다운). 핵심 페이지·데이터 출처·인용 표기를 명시 (ADR-065).
// 정적 파일 대신 라우트로 서빙 — SITE_URL 환경별 분기 + 향후 최신 글 목록 동적 포함 여지. runtime/revalidate 지시어 금지(cacheComponents).
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export function GET(): Response {
  const host = SITE_URL.replace(/^https?:\/\//, "");
  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

## 핵심 페이지
- [홈](${SITE_URL}/): 단체 소개, 누적 활동 지표(봉사시간·활동 횟수·나눔 가정수 등), 쌀 나눔 통계
- [활동 스토리](${SITE_URL}/news): 쌀 나눔·봉사·후원 활동 기록 (발행일 순)
- [언론 속 사회공헌](${SITE_URL}/press): 언론에 보도된 활동 모음 (외부 원문 링크 병기)
- [공지사항](${SITE_URL}/notices): 단체 공식 공지

## 데이터 정책
- 누적 활동 지표와 쌀 나눔 통계는 사회공헌국이 관리하는 내부 집계를 주기적으로 반영한다. 기준일은 각 페이지에 표기된 값을 따른다.
- 활동 스토리는 현장 활동 후 단체가 직접 작성한 1차 기록이다.
- 인용 시 표기: ${SITE_NAME} (${host})

## 기계용 자원
- 사이트맵: ${SITE_URL}/sitemap.xml
- RSS: ${SITE_URL}/feed.xml
`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
