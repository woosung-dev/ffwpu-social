// web 앱(Next.js 16) 빌드·런타임 설정 - cacheComponents + 워크스페이스 transpile 지정
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next.js 16: Partial Prerendering 후속 캐시 모델
  cacheComponents: true,
  // 워크스페이스 패키지를 Next 가 그대로 번들링하도록 지정 (소스 import)
  transpilePackages: [
    "@myorg/db",
    "@myorg/features",
    "@myorg/ui-base",
    "@myorg/config",
  ],
  experimental: {
    // Server Actions 는 16 에서 기본 활성 - 추가 옵션만 명시
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    // 외부 이미지 도메인은 다운스트림에서 추가
    remotePatterns: [],
  },
};

export default nextConfig;
