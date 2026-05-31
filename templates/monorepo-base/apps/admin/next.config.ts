// admin Next.js 16 설정 — cacheComponents 활성화·workspace 패키지 transpile
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  cacheComponents: true,
  transpilePackages: ['@myorg/db', '@myorg/features', '@myorg/ui-base'],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
