// 기존 news 행 커버 치수 백필 — cover_image_url 있고 width NULL 인 행만 S3 에서 받아 파싱 후 UPDATE.
// 비파괴(TRUNCATE 없음 → featured/story/hero 큐레이션 보존)·idempotent(채워진 행 재선택 안 됨)·실패 행 warn 후 계속. tsx 실행.
// dotenv 를 다른 모듈보다 먼저 실행해야 하므로 db/schema·lib/s3 는 dynamic import (seed.ts 패턴)
import { config } from "dotenv";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { and, eq, isNotNull, isNull } from "drizzle-orm";

import { readImageSize } from "../features/storage/image-size";

config({ path: ".env.local" });

const { db } = await import("./index");
const { news } = await import("./schema");
const { s3, S3_BUCKET } = await import("../lib/s3");

// public URL → S3 객체 키. getPublicUrl(`${base}/${key}`) 의 역연산: prefix strip. 외부/레거시 URL 은 null
function deriveKey(url: string, publicBase: string): string | null {
  const base = publicBase.replace(/\/$/, "");
  if (!url.startsWith(`${base}/`)) return null;
  return url.slice(base.length + 1);
}

async function backfill() {
  const publicBase = process.env.NEXT_PUBLIC_S3_PUBLIC_URL;
  if (!publicBase) {
    console.error("[backfill] NEXT_PUBLIC_S3_PUBLIC_URL 미설정 (.env.local 확인)");
    process.exit(1);
  }

  // idempotent 필터 — 커버 있음 + 치수 미기록(width NULL). width/height 는 쌍으로 set 되므로 width 만 검사해도 충분
  const rows = await db
    .select({ id: news.id, url: news.coverImageUrl })
    .from(news)
    .where(and(isNotNull(news.coverImageUrl), isNull(news.coverImageWidth)));

  console.log(`[backfill] 대상 ${rows.length}행`);
  let ok = 0;
  let skipped = 0;
  for (const row of rows) {
    const url = row.url;
    if (!url) {
      skipped++;
      continue;
    }
    try {
      const key = deriveKey(url, publicBase);
      if (!key) {
        console.warn(`[backfill] ⚠ ${row.id}: 키 도출 실패 (${url}) — skip`);
        skipped++;
        continue;
      }
      const obj = await s3.send(
        new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }),
      );
      if (!obj.Body) {
        console.warn(`[backfill] ⚠ ${row.id}: 빈 Body — skip`);
        skipped++;
        continue;
      }
      // AWS SDK v3 스트림 → 버퍼. 커버 ≤5MB(MAX_IMAGE_BYTES) 라 전체 메모리 로드 안전
      const bytes = await obj.Body.transformToByteArray();
      const size = readImageSize(Buffer.from(bytes));
      if (!size) {
        console.warn(`[backfill] ⚠ ${row.id}: 치수 파싱 실패(webp/미지원) — skip`);
        skipped++;
        continue;
      }
      await db
        .update(news)
        .set({
          coverImageWidth: size.width,
          coverImageHeight: size.height,
          updatedAt: new Date(),
        })
        .where(eq(news.id, row.id));
      console.log(`[backfill] ✓ ${row.id} ${size.width}×${size.height}`);
      ok++;
    } catch (err) {
      console.warn(
        `[backfill] ⚠ ${row.id}: ${err instanceof Error ? err.message : err} — skip`,
      );
      skipped++;
    }
  }
  console.log(
    `[backfill] 완료. 성공 ${ok} / 스킵 ${skipped} / 전체 ${rows.length}`,
  );
  process.exit(0);
}

backfill().catch((err) => {
  console.error("[backfill] failed:", err);
  process.exit(1);
});
