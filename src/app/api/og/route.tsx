// 동적 OG 이미지(1200×630) — ?title= 글 제목 또는 기본 브랜드. 커버 없는 글·랜딩·목록 공유 썸네일 생성.
// 한글 렌더용 Gmarket Sans Bold TTF(Satori 는 woff2 미지원 → ttf). public/ 자산을 사이트 자체 URL 로 HTTP fetch
// (file:// import.meta.url 은 로컬 Node fetch 미지원, public+절대URL 은 로컬·Vercel 모두 동작). runtime 지정 불가(cacheComponents).
import { ImageResponse } from "next/og";

import { SITE_URL } from "@/lib/site";

let fontPromise: Promise<ArrayBuffer> | null = null;
function loadFont() {
  fontPromise ??= fetch(`${SITE_URL}/fonts/og/GmarketSans-Bold.ttf`).then((res) =>
    res.arrayBuffer(),
  );
  return fontPromise;
}

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const title =
    searchParams.get("title")?.slice(0, 70) || "쌀 나눔으로 따뜻한 변화를";
  const fontData = await loadFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "84px",
          background: "linear-gradient(135deg, #B769FF 0%, #501F7E 100%)",
          fontFamily: "GmarketSans",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, color: "#F0E1FF" }}>
          사회공헌단 Sow Good
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 66,
            lineHeight: 1.25,
            color: "#ffffff",
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#E9D1FF" }}>
          쌀 나눔으로 따뜻한 변화를 이어갑니다
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
