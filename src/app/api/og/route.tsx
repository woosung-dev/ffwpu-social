// 동적 OG 이미지(1200×630) — 시안 A(랜딩 히어로 정합): 흰 배경 + 하단 보라 곡선 + 우하단 꽃.
// ?title= 있으면 헤드라인 대체(커버 없는 글 공유), 없으면 기본 브랜드 카피. 게시글은 coverImageUrl 우선이라 이 라우트 미경유.
// 한글 렌더용 Gmarket Sans Bold TTF(Satori 는 woff2 미지원 → ttf). public/ 자산은 사이트 자체 URL 로 HTTP fetch
// (file:// import.meta.url 은 로컬 Node fetch 미지원, public+절대URL 은 로컬·Vercel 모두 동작). runtime 지정 불가(cacheComponents).
// 꽃은 복잡 SVG(<use>/<defs>) 라 Satori 가 깨질 위험 → 사전 래스터한 hero-flower-og.png(투명) 사용. 곡선은 단순 path(Satori 안정).
import { ImageResponse } from "next/og";

import { SITE_URL } from "@/lib/site";

let fontPromise: Promise<ArrayBuffer> | null = null;
function loadFont() {
  fontPromise ??= fetch(`${SITE_URL}/fonts/og/GmarketSans-Bold.ttf`).then((res) =>
    res.arrayBuffer(),
  );
  return fontPromise;
}

const DEFAULT_HEADLINE = "가치를 삶으로,\n변화를 꽃피우는 동행";

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const headline = searchParams.get("title")?.slice(0, 70) || DEFAULT_HEADLINE;
  const fontData = await loadFont();

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#ffffff",
          fontFamily: "GmarketSans",
        }}
      >
        {/* 하단 보라 곡선 — convex dome(랜딩 히어로 타원 곡선 재현). 단순 path 라 Satori 안정 */}
        <svg
          width="1200"
          height="300"
          viewBox="0 0 1200 300"
          style={{ position: "absolute", bottom: 0, left: 0 }}
        >
          <path d="M0 90 Q600 -30 1200 90 L1200 300 L0 300 Z" fill="#b769ff" />
        </svg>

        {/* 꽃 — 우하단 오버행(곡선 위로 겹침). 760×694 원본을 380×347 로 축소 */}
        {/* eslint-disable-next-line @next/next/no-img-element -- OG(Satori) 렌더 */}
        <img
          src={`${SITE_URL}/icons/hero-flower-og.png`}
          width={380}
          height={347}
          alt=""
          style={{ position: "absolute", right: 48, bottom: 0 }}
        />

        {/* 텍스트 레이어 — 마지막 자식(최상단 페인트). 로고(상)·헤드라인(중)·태그라인(하) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            padding: "84px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", fontSize: 34, color: "#501f7e" }}>
            사회공헌단 Sow Good
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 720,
              fontSize: 58,
              lineHeight: 1.25,
              color: "#3a0f62",
            }}
          >
            {headline.split("\n").map((line, i) => (
              <div key={i} style={{ display: "flex" }}>
                {line}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#ffffff" }}>
            쌀 나눔으로 따뜻한 변화를 이어갑니다
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "GmarketSans", data: fontData, weight: 700, style: "normal" },
      ],
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" },
    },
  );
}
