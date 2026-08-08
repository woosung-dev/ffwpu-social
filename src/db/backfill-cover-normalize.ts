// 기존 커버 이미지 정규화 백필 — 업로드 시점 정규화(Phase 3) 이전에 올라온 커버를 소급 처리한다.
//
// 왜: next/image 런타임 최적화를 이탈(next.config.ts unoptimized)하면서 저장본이 곧 전송본이 됐는데,
// 기존 커버는 평균 1,161KB(최대 4,133KB)에 12장이 PNG 라 그대로는 모바일에서 감당이 안 된다.
// 게다가 커버는 og:image 로 직행하는데 36장 중 24장이 카카오톡 500KB 상한을 넘고 있었다.
//
// 비파괴 설계 — 세 가지를 지킨다:
//   1. 원본을 <dir>/original/ 로 복사 후 보존한다. Cloudinary·imgix·Shopify·WordPress 모두 원본을 버리지 않는다 —
//      표시 스펙은 반드시 바뀌기 때문(디자인 개편·새 디바이스·AVIF·인쇄 요청).
//   2. 정규화본은 **새 키**에 쓴다. 덮어쓰면 CDN·카카오톡 스크래퍼 캐시가 옛 이미지를 붙들고,
//      롤백 수단도 사라진다. 새 키면 DB URL 만 되돌리면 원복된다.
//   3. 기존 객체를 삭제하지 않는다. v1.1 orphan cleanup 이 이걸 지우지 않도록 제외 규칙 필요.
//
// idempotent: 이미 jpg + 긴 변 ≤ COVER_MAX_EDGE_PX + ≤ COVER_TARGET_BYTES 면 skip. 재실행해도 중복 생성 없음.
//
// 실행:
//   pnpm tsx src/db/backfill-cover-normalize.ts                    # dry-run (기본, 쓰기 없음)
//   pnpm tsx src/db/backfill-cover-normalize.ts --apply --limit 1  # 1건만 실제 적용
//   pnpm tsx src/db/backfill-cover-normalize.ts --apply
//   pnpm tsx src/db/backfill-cover-normalize.ts --env .env.prod --apply         # 프로덕션 대상
//
// ⚠️ 프로덕션 자격증명은 Vercel 에서 못 가져온다 — 환경변수가 전부 Sensitive 타입이라
//    `vercel env pull` 이 키 이름만 주고 값은 빈 문자열로 내려온다(Vercel 설계).
//    값은 원천에서 받는다: DATABASE_URL → Neon 대시보드 / S3_ENDPOINT·버킷 → Cloudflare R2 /
//    R2 API 토큰은 생성 시 1회만 표시되므로 사본이 없으면 새로 발급(기존 토큰은 살아 있어 배포 무영향).
//
// dotenv 를 다른 모듈보다 먼저 실행해야 하므로 db/schema·lib/s3 는 dynamic import (seed.ts·backfill-cover-dims.ts 패턴)
import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { eq, isNotNull } from "drizzle-orm";
import sharp from "sharp";

import {
  COVER_JPEG_QUALITY,
  COVER_MAX_EDGE_PX,
  JPEG_QUALITY_LADDER,
  COVER_TARGET_BYTES,
} from "../features/storage/image-policy";

type Args = { apply: boolean; limit: number | null; envPath: string };

function parseArgs(argv: string[]): Args {
  const limitRaw = argv[argv.indexOf("--limit") + 1];
  const envRaw = argv[argv.indexOf("--env") + 1];
  return {
    apply: argv.includes("--apply"),
    limit: argv.includes("--limit") ? Number(limitRaw) : null,
    envPath: argv.includes("--env") ? envRaw : ".env.local",
  };
}

const args = parseArgs(process.argv.slice(2));
config({ path: args.envPath });

const { db } = await import("./index");
const { news, popups } = await import("./schema");
const { s3, S3_BUCKET, getPublicUrl } = await import("../lib/s3");

// public URL → S3 객체 키. getPublicUrl 의 역연산. 외부/레거시 URL 은 null (backfill-cover-dims.ts 와 동일 규칙)
function deriveKey(url: string, publicBase: string): string | null {
  const base = publicBase.replace(/\/$/, "");
  if (!url.startsWith(`${base}/`)) return null;
  return url.slice(base.length + 1);
}

// news/<id>/<uuid>.png → news/<id>/original/<uuid>.png
function originalKeyFor(key: string): string {
  const slash = key.lastIndexOf("/");
  return `${key.slice(0, slash)}/original/${key.slice(slash + 1)}`;
}

function newCoverKeyFor(key: string): string {
  return `${key.slice(0, key.lastIndexOf("/"))}/${randomUUID()}.jpg`;
}

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function mimeForKey(key: string): string {
  return MIME_BY_EXT[key.split(".").pop()?.toLowerCase() ?? ""] ?? "image/jpeg";
}

type Normalized = { buffer: Buffer; width: number; height: number; quality: number };

/**
 * 긴 변을 COVER_MAX_EDGE_PX 로 맞춰 JPEG 재인코딩한다.
 * - flatten(#fff): PNG 투명 배경이 JPEG 에서 검정으로 변하는 것을 막는다
 * - 메타데이터 미보존(sharp 기본): 현장 사진의 GPS·촬영기기 EXIF 제거 — ADR-004 개인정보 보호
 * - 품질 사다리: COVER_TARGET_BYTES 초과 시에만 낮춘다. 36장 실측 최대가 329KB 라 통상 1회로 끝난다.
 */
async function normalize(input: Buffer): Promise<Normalized> {
  const meta = await sharp(input).metadata();
  const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0);
  const resizeOpts =
    longEdge > COVER_MAX_EDGE_PX
      ? (meta.width ?? 0) >= (meta.height ?? 0)
        ? { width: COVER_MAX_EDGE_PX }
        : { height: COVER_MAX_EDGE_PX }
      : {};

  const lastQuality = JPEG_QUALITY_LADDER[JPEG_QUALITY_LADDER.length - 1];
  for (const quality of JPEG_QUALITY_LADDER) {
    const pipeline = sharp(input)
      .resize({ ...resizeOpts, withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality, mozjpeg: true });
    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
    if (data.length <= COVER_TARGET_BYTES || quality === lastQuality) {
      return { buffer: data, width: info.width, height: info.height, quality };
    }
  }
  throw new Error("unreachable");
}

type Target = {
  table: "news" | "popups";
  id: string;
  url: string;
};

async function loadTargets(): Promise<Target[]> {
  const newsRows = await db
    .select({ id: news.id, url: news.coverImageUrl })
    .from(news)
    .where(isNotNull(news.coverImageUrl));
  const popupRows = await db
    .select({ id: popups.id, url: popups.imageUrl })
    .from(popups);

  return [
    ...newsRows.flatMap((r) =>
      r.url ? [{ table: "news" as const, id: r.id, url: r.url }] : [],
    ),
    ...popupRows.map((r) => ({
      table: "popups" as const,
      id: r.id,
      url: r.url,
    })),
  ];
}

const kb = (n: number) => Math.round(n / 1024);

async function run() {
  const publicBase = process.env.NEXT_PUBLIC_S3_PUBLIC_URL;
  if (!publicBase) {
    console.error(`[normalize] NEXT_PUBLIC_S3_PUBLIC_URL 미설정 (${args.envPath} 확인)`);
    process.exit(1);
  }

  const all = await loadTargets();
  const targets = args.limit ? all.slice(0, args.limit) : all;
  console.log(
    `[normalize] ${args.apply ? "APPLY" : "DRY-RUN"} · env=${args.envPath} · 대상 ${targets.length}/${all.length}건 · 목표 ${COVER_MAX_EDGE_PX}px q${COVER_JPEG_QUALITY}`,
  );

  let done = 0;
  let skipped = 0;
  let failed = 0;
  let bytesBefore = 0;
  let bytesAfter = 0;

  for (const t of targets) {
    const label = `${t.table}/${t.id.slice(0, 8)}`;
    try {
      const key = deriveKey(t.url, publicBase);
      if (!key) {
        console.warn(`[normalize] ⚠ ${label}: 키 도출 실패 (${t.url}) — skip`);
        skipped++;
        continue;
      }

      const obj = await s3.send(
        new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }),
      );
      if (!obj.Body) {
        console.warn(`[normalize] ⚠ ${label}: 빈 Body — skip`);
        skipped++;
        continue;
      }
      const source = Buffer.from(await obj.Body.transformToByteArray());
      const meta = await sharp(source).metadata();
      const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0);
      const out = await normalize(source);

      // idempotent 판정 — "규격 안에 든다"가 아니라 "재인코딩해도 이득이 없다"로 판정한다.
      //
      // 치수·용량만 보면(예: jpeg 1440×1081 432KB) 규격은 통과하지만 q85~90 으로 저장된 과품질 파일이라
      // q75 재인코딩 시 절반 이하로 준다. 그런 파일을 남기면 카카오톡 500KB 상한 코앞(432/500)에 방치된다.
      //
      // 반대로 이미 우리가 만든 q75 결과물은 재인코딩해도 크기가 거의 같아(≥85%) 여기서 걸러진다 →
      // 2회차 실행은 전건 skip 이 되어 멱등성이 유지되고, 불필요한 세대 손실(generation loss)도 없다.
      if (
        meta.format === "jpeg" &&
        longEdge <= COVER_MAX_EDGE_PX &&
        out.buffer.length > source.length * 0.85
      ) {
        console.log(
          `[normalize] = ${label}: 재인코딩 이득 없음 (${meta.width}×${meta.height}, ${kb(source.length)}KB) — skip`,
        );
        skipped++;
        continue;
      }

      bytesBefore += source.length;
      bytesAfter += out.buffer.length;

      const originalKey = originalKeyFor(key);
      const coverKey = newCoverKeyFor(key);
      console.log(
        `[normalize] ${args.apply ? "✓" : "·"} ${label}: ${meta.format} ${meta.width}×${meta.height} ${kb(source.length)}KB` +
          ` → jpeg ${out.width}×${out.height} ${kb(out.buffer.length)}KB (q${out.quality}, -${Math.round((1 - out.buffer.length / source.length) * 100)}%)`,
      );

      if (!args.apply) {
        done++;
        continue;
      }

      // 1) 원본 보존 — 표시 스펙은 바뀌어도 원본은 남긴다. 이미 있으면 덮어쓰지 않는다
      try {
        await s3.send(
          new GetObjectCommand({ Bucket: S3_BUCKET, Key: originalKey }),
        );
      } catch {
        await s3.send(
          new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: originalKey,
            Body: source,
            ContentType: mimeForKey(key),
          }),
        );
      }

      // 2) 정규화본을 새 키에 write
      await s3.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: coverKey,
          Body: out.buffer,
          ContentType: "image/jpeg",
        }),
      );

      // 3) DB URL + 치수 갱신. 치수를 같이 안 바꾸면 마조네리·CLS 계산이 옛 비율로 어긋난다
      const publicUrl = getPublicUrl(coverKey);
      if (t.table === "news") {
        await db
          .update(news)
          .set({
            coverImageUrl: publicUrl,
            coverImageWidth: out.width,
            coverImageHeight: out.height,
            updatedAt: new Date(),
          })
          .where(eq(news.id, t.id));
      } else {
        await db
          .update(popups)
          .set({
            imageUrl: publicUrl,
            imageWidth: out.width,
            imageHeight: out.height,
            updatedAt: new Date(),
          })
          .where(eq(popups.id, t.id));
      }
      done++;
    } catch (err) {
      console.warn(
        `[normalize] ⚠ ${label}: ${err instanceof Error ? err.message : err} — skip`,
      );
      failed++;
    }
  }

  console.log(
    `\n[normalize] 완료 — 처리 ${done} / 스킵 ${skipped} / 실패 ${failed} (전체 ${targets.length})`,
  );
  if (bytesBefore > 0) {
    console.log(
      `[normalize] 용량 ${kb(bytesBefore)}KB → ${kb(bytesAfter)}KB` +
        ` (평균 ${kb(bytesBefore / done)}KB → ${kb(bytesAfter / done)}KB, -${Math.round((1 - bytesAfter / bytesBefore) * 100)}%)`,
    );
  }
  if (!args.apply) {
    console.log("[normalize] DRY-RUN 이었습니다. 실제 적용은 --apply 를 붙이세요.");
  }
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("[normalize] failed:", err);
  process.exit(1);
});
