# 프로덕션 앱 이미지(청사진) — Next.js standalone 멀티스테이지. AWS EC2/ECS 이전용(ADR-001a).
# 마이그레이션은 이 이미지가 아니라 CI 일회성 잡(deploy.yml의 migrate 패턴)으로 RDS에 적용 권장(B-1).
#   └ 컨테이너 자체 migrate(B-2/B-3)는 standalone 트레이싱이 migrator를 누락할 수 있어, 그 경우 full-deps로 별도 빌드.
# syntax=docker/dockerfile:1

FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build
# output: "standalone" (next.config.ts) → .next/standalone/server.js + 추적된 최소 node_modules

FROM node:22-slim AS run
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# standalone 산출물 + 정적 자산
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
# 마이그레이션 SQL/러너 동봉(컨테이너 self-migrate B-2/B-3 옵션 대비)
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/src/db/migrate.ts ./src/db/migrate.ts
EXPOSE 3000
CMD ["node", "server.js"]
