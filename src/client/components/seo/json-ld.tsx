// JSON-LD 구조화 데이터 script 태그 — 검색엔진 리치 결과용. 본문의 < 를 유니코드로 치환해 태그 조기종료 주입 차단 (Next 공식 XSS 패턴)
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
