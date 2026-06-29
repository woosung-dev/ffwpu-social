# Next.js 16 standalone 프로덕션 이미지 — deps·builder·runner(기본)·migrate 멀티스테이지
# runner = 최소 서빙 이미지, migrate = advisory-lock 마이그레이션 1회성 러너(tsx·소스 포함)
# syntax=docker/dockerfile:1

FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# --- deps: 빌드용 전체 의존성 설치 (lockfile 고정) ---
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# --- builder: Next standalone 빌드 ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# 빌드 시 모듈 로드 가드 충족용 placeholder. DATABASE_URL은 빌드 중 미접속(connect 안 함).
# NEXT_PUBLIC_*는 클라 번들에 인라인되므로 CI에서 실제 prod 값을 --build-arg로 주입해야 함.
ARG DATABASE_URL="postgresql://build:build@localhost:5432/build"
ARG NEXT_PUBLIC_SITE_URL="http://localhost:3100"
ARG NEXT_PUBLIC_S3_PUBLIC_URL="http://localhost:9000/ffwpu-social"
ARG NEXT_PUBLIC_GA_ID=""
ENV DATABASE_URL=$DATABASE_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_S3_PUBLIC_URL=$NEXT_PUBLIC_S3_PUBLIC_URL \
    NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID
RUN pnpm build

# --- migrate: 1회성 마이그레이션 러너 (builder 재사용 — tsx·src/db·drizzle 포함) ---
FROM builder AS migrate
ENV NODE_ENV=production
CMD ["pnpm", "db:migrate:deploy"]

# --- sharp: 런타임 플랫폼용 sharp 독립 설치 (pnpm 심링크 트레이스 누락 보완) ---
FROM node:22-slim AS sharp
WORKDIR /sharp
RUN npm init -y >/dev/null 2>&1 && npm install --omit=dev sharp@0.33.5

# --- runner: 최소 런타임 서빙 이미지 (기본 타깃 — 파일 마지막 스테이지) ---
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
RUN useradd -m -u 1001 nextjs
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nextjs /app/public ./public
# next/image 최적화용 sharp 주입 — 깨진 pnpm 심링크 제거 후, 독립 설치본 전체(sharp+@img+detect-libc 등 의존성)를
# 격리 디렉터리로 복사하고 NODE_PATH로 해결 (pnpm 트리 clobber 없음)
RUN rm -rf node_modules/sharp node_modules/@img
COPY --from=sharp --chown=nextjs:nextjs /sharp/node_modules ./_sharp_modules
ENV NODE_PATH=/app/_sharp_modules
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
