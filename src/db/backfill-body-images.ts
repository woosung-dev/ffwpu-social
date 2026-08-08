// 본문 인라인 이미지 정규화 백필 — 업로드 시점 정규화(prepareImageForUpload) 이전에 올라온 이미지를 소급 처리한다.
//
// 왜: next/image 런타임 최적화를 이탈했으므로(ADR-051) 저장본이 곧 전송본이다. 프로덕션 본문 이미지 151개가
// 평균 763KB(최대 3,442KB) / 합계 110.8MB 로, 가장 무거운 글은 모바일에서 끝까지 읽으면 10.4MB 를 내려받는다.
//
// 커버 백필(backfill-cover-normalize.ts)과 결정적으로 다른 점: 커버는 cover_image_url **컬럼 하나**만
// 바꿨지만 본문은 body(JSONB, Tiptap 문서) **전체를 다시 쓴다.** 실패하면 글 본문이 손상되므로
// 되돌리기 장치를 갖춘다:
//   1. --apply 시 건드릴 모든 행의 원본 body 를 backup/body-backup-<ISO>.json 에 **먼저** 기록
//   2. --rollback <file> 로 그 파일에서 body 를 그대로 복원
//   3. 이미지는 새 키에 쓰고 원본을 <dir>/original/ 에 보존, 기존 객체는 삭제하지 않는다
//
// 스킵 규칙 (image-policy.ts 와 동일 정책):
//   - 투명 픽셀 TRANSPARENT_SKIP_RATIO(10%) 이상 → JPEG 는 알파가 없어 흰 박스가 된다
//   - 재인코딩 이득 REENCODE_MIN_GAIN(15%) 미만 → 세대 손실 방지 + 재실행 멱등성
//
// 실행:
//   pnpm tsx src/db/backfill-body-images.ts --env .env.prod                      # dry-run (기본)
//   pnpm tsx src/db/backfill-body-images.ts --env .env.prod --apply --limit 1    # 1개 글만
//   pnpm tsx src/db/backfill-body-images.ts --env .env.prod --apply
//   pnpm tsx src/db/backfill-body-images.ts --env .env.prod --rollback backup/body-backup-....json
//
// ⚠️ 프로덕션 자격증명은 Vercel 에서 못 가져온다 — 환경변수가 전부 Sensitive 타입이라
//    `vercel env pull` 이 키 이름만 주고 값은 빈 문자열로 내려온다. 값은 Neon·Cloudflare 원천에서 받는다.
//
// dotenv 를 다른 모듈보다 먼저 실행해야 하므로 db/schema·lib/s3 는 dynamic import (seed.ts 패턴)
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { config } from "dotenv";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import sharp from "sharp";

import {
  JPEG_QUALITY_LADDER,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_EDGE_PX,
  REENCODE_MIN_GAIN,
  TRANSPARENT_SKIP_RATIO,
} from "../features/storage/image-policy";

type Args = {
  apply: boolean;
  limit: number | null;
  envPath: string;
  rollback: string | null;
};

function parseArgs(argv: string[]): Args {
  const at = (flag: string) => argv[argv.indexOf(flag) + 1];
  return {
    apply: argv.includes("--apply"),
    limit: argv.includes("--limit") ? Number(at("--limit")) : null,
    envPath: argv.includes("--env") ? at("--env") : ".env.local",
    rollback: argv.includes("--rollback") ? at("--rollback") : null,
  };
}

const args = parseArgs(process.argv.slice(2));
config({ path: args.envPath });

const { db } = await import("./index");
const { news, notices } = await import("./schema");
const { s3, S3_BUCKET, getPublicUrl } = await import("../lib/s3");

const BACKUP_DIR = "backup";
const kb = (n: number) => Math.round(n / 1024);

type TableName = "news" | "notices";
type Row = { table: TableName; id: string; body: unknown };

/** Tiptap 문서를 재귀 순회해 우리 스토리지 이미지 src 를 모은다 */
function collectSrcs(node: unknown, base: string, into: Set<string>): void {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const n of node) collectSrcs(n, base, into);
    return;
  }
  const n = node as { type?: string; attrs?: { src?: string }; content?: unknown };
  if (n.type === "image" && n.attrs?.src?.startsWith(base)) into.add(n.attrs.src);
  if (n.content) collectSrcs(n.content, base, into);
}

/**
 * src 를 매핑으로 치환한 새 문서를 반환한다(원본 불변).
 * `attrs.width`/`height` 는 건드리지 않는다 — 그건 에디터가 정한 **표시 폭(CSS px)** 이라
 * 원본 픽셀과 독립이고, 축소만 하므로 렌더 결과가 바뀌지 않는다.
 */
function replaceSrcs(node: unknown, map: Map<string, string>): unknown {
  if (!node || typeof node !== "object") return node;
  if (Array.isArray(node)) return node.map((n) => replaceSrcs(n, map));
  const n = node as Record<string, unknown> & {
    type?: string;
    attrs?: Record<string, unknown>;
    content?: unknown;
  };
  const next: Record<string, unknown> = { ...n };
  if (n.type === "image" && typeof n.attrs?.src === "string") {
    const replacement = map.get(n.attrs.src);
    if (replacement) next.attrs = { ...n.attrs, src: replacement };
  }
  if (n.content) next.content = replaceSrcs(n.content, map);
  return next;
}

function deriveKey(url: string, publicBase: string): string | null {
  const base = publicBase.replace(/\/$/, "");
  if (!url.startsWith(`${base}/`)) return null;
  return url.slice(base.length + 1);
}

function originalKeyFor(key: string): string {
  const slash = key.lastIndexOf("/");
  return `${key.slice(0, slash)}/original/${key.slice(slash + 1)}`;
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

/** 투명 픽셀 비율(0~1). 알파 채널이 없으면 0 */
async function transparentRatio(input: Buffer): Promise<number> {
  const meta = await sharp(input).metadata();
  if (!meta.hasAlpha) return 0;
  const alpha = await sharp(input).extractChannel(3).raw().toBuffer();
  let transparent = 0;
  for (let i = 0; i < alpha.length; i++) if (alpha[i] < 250) transparent++;
  return transparent / alpha.length;
}

type Normalized = { buffer: Buffer; width: number; height: number; quality: number };

async function normalize(input: Buffer): Promise<Normalized> {
  const meta = await sharp(input).metadata();
  const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0);
  const resizeOpts =
    longEdge > MAX_IMAGE_EDGE_PX
      ? (meta.width ?? 0) >= (meta.height ?? 0)
        ? { width: MAX_IMAGE_EDGE_PX }
        : { height: MAX_IMAGE_EDGE_PX }
      : {};

  const lastQuality = JPEG_QUALITY_LADDER[JPEG_QUALITY_LADDER.length - 1];
  for (const quality of JPEG_QUALITY_LADDER) {
    const { data, info } = await sharp(input)
      .resize({ ...resizeOpts, withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
    if (data.length <= MAX_IMAGE_BYTES || quality === lastQuality) {
      return { buffer: data, width: info.width, height: info.height, quality };
    }
  }
  throw new Error("unreachable");
}

async function loadRows(): Promise<Row[]> {
  const newsRows = await db
    .select({ id: news.id, body: news.body })
    .from(news);
  const noticeRows = await db
    .select({ id: notices.id, body: notices.body })
    .from(notices);
  return [
    ...newsRows.map((r) => ({ table: "news" as const, id: r.id, body: r.body })),
    ...noticeRows.map((r) => ({
      table: "notices" as const,
      id: r.id,
      body: r.body,
    })),
  ];
}

async function writeBody(table: TableName, id: string, body: unknown) {
  const patch = { body, updatedAt: new Date() };
  if (table === "news") {
    await db.update(news).set(patch).where(eq(news.id, id));
  } else {
    await db.update(notices).set(patch).where(eq(notices.id, id));
  }
}

async function rollback(file: string) {
  const entries = JSON.parse(readFileSync(file, "utf8")) as Row[];
  console.log(`[body] ROLLBACK ${file} — ${entries.length}행 복원`);
  for (const e of entries) {
    await writeBody(e.table, e.id, e.body);
    console.log(`[body] ↩ ${e.table}/${e.id.slice(0, 8)}`);
  }
  console.log(`[body] 복원 완료 ${entries.length}행`);
}

async function run() {
  const publicBase = process.env.NEXT_PUBLIC_S3_PUBLIC_URL;
  if (!publicBase) {
    console.error(`[body] NEXT_PUBLIC_S3_PUBLIC_URL 미설정 (${args.envPath} 확인)`);
    process.exit(1);
  }
  const base = publicBase.replace(/\/$/, "");

  if (args.rollback) {
    await rollback(args.rollback);
    process.exit(0);
  }

  const allRows = await loadRows();
  // 이미지를 가진 글만 대상. --limit 은 "글 수" 기준
  const withImages = allRows.filter((r) => {
    const s = new Set<string>();
    collectSrcs(r.body, base, s);
    return s.size > 0;
  });
  const rows = args.limit ? withImages.slice(0, args.limit) : withImages;

  const srcs = new Set<string>();
  for (const r of rows) collectSrcs(r.body, base, srcs);

  console.log(
    `[body] ${args.apply ? "APPLY" : "DRY-RUN"} · env=${args.envPath} · 글 ${rows.length}/${withImages.length}건 · 이미지 ${srcs.size}개 · 목표 ${MAX_IMAGE_EDGE_PX}px q${JPEG_QUALITY_LADDER[0]}`,
  );

  // 1) 이미지 정규화 — src → 새 src 매핑을 만든다
  const map = new Map<string, string>();
  let processed = 0;
  let skipTransparent = 0;
  let skipNoGain = 0;
  let failed = 0;
  let before = 0;
  let after = 0;

  for (const src of srcs) {
    const label = `...${src.slice(-16)}`;
    try {
      const key = deriveKey(src, base);
      if (!key) {
        console.warn(`[body] ⚠ ${label}: 키 도출 실패 — skip`);
        failed++;
        continue;
      }
      const obj = await s3.send(
        new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }),
      );
      if (!obj.Body) {
        console.warn(`[body] ⚠ ${label}: 빈 Body — skip`);
        failed++;
        continue;
      }
      const source = Buffer.from(await obj.Body.transformToByteArray());

      const ratio = await transparentRatio(source);
      if (ratio >= TRANSPARENT_SKIP_RATIO) {
        console.log(
          `[body] = ${label}: 투명 ${(ratio * 100).toFixed(0)}% (${kb(source.length)}KB) — skip`,
        );
        skipTransparent++;
        continue;
      }

      const out = await normalize(source);
      if (out.buffer.length > source.length * (1 - REENCODE_MIN_GAIN)) {
        console.log(
          `[body] = ${label}: 재인코딩 이득 없음 (${kb(source.length)}KB) — skip`,
        );
        skipNoGain++;
        continue;
      }

      processed++;
      before += source.length;
      after += out.buffer.length;
      const meta = await sharp(source).metadata();
      console.log(
        `[body] ${args.apply ? "✓" : "·"} ${label}: ${meta.format} ${meta.width}×${meta.height} ${kb(source.length)}KB` +
          ` → jpeg ${out.width}×${out.height} ${kb(out.buffer.length)}KB (q${out.quality}, -${Math.round((1 - out.buffer.length / source.length) * 100)}%)`,
      );

      if (!args.apply) continue;

      // 원본 보존 — 이미 있으면 덮어쓰지 않는다
      const originalKey = originalKeyFor(key);
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

      const newKey = `${key.slice(0, key.lastIndexOf("/"))}/${randomUUID()}.jpg`;
      await s3.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: newKey,
          Body: out.buffer,
          ContentType: "image/jpeg",
        }),
      );
      map.set(src, getPublicUrl(newKey));
    } catch (err) {
      console.warn(
        `[body] ⚠ ${label}: ${err instanceof Error ? err.message : err} — skip`,
      );
      failed++;
    }
  }

  console.log(
    `\n[body] 이미지 — 처리 ${processed} / 투명 스킵 ${skipTransparent} / 이득없음 스킵 ${skipNoGain} / 실패 ${failed}`,
  );
  if (processed > 0) {
    console.log(
      `[body] 용량 ${kb(before)}KB → ${kb(after)}KB (평균 ${kb(before / processed)}KB → ${kb(after / processed)}KB, -${Math.round((1 - after / before) * 100)}%)`,
    );
  }

  if (!args.apply) {
    console.log("[body] DRY-RUN 이었습니다. 실제 적용은 --apply 를 붙이세요.");
    process.exit(failed > 0 ? 1 : 0);
  }
  if (map.size === 0) {
    console.log("[body] 치환할 이미지가 없어 body 를 건드리지 않았습니다.");
    process.exit(0);
  }

  // 2) body 백업 — DB 쓰기 **전에** 기록한다. 이게 유일한 되돌리기 수단이다
  const targets = rows.filter((r) => {
    const s = new Set<string>();
    collectSrcs(r.body, base, s);
    return [...s].some((src) => map.has(src));
  });
  mkdirSync(BACKUP_DIR, { recursive: true });
  const backupPath = `${BACKUP_DIR}/body-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(backupPath, JSON.stringify(targets, null, 2));
  console.log(`[body] 백업 기록 ${backupPath} (${targets.length}행)`);

  // 3) body 재작성 — 행마다 단일 UPDATE 라 그 자체가 원자적이다
  let updated = 0;
  for (const r of targets) {
    await writeBody(r.table, r.id, replaceSrcs(r.body, map));
    console.log(`[body] ✓ ${r.table}/${r.id.slice(0, 8)} body 갱신`);
    updated++;
  }
  console.log(
    `\n[body] 완료 — body ${updated}행 갱신. 되돌리려면:\n  pnpm tsx src/db/backfill-body-images.ts --env ${args.envPath} --rollback ${backupPath}`,
  );
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("[body] failed:", err);
  process.exit(1);
});
