// 소식(news) Server Actions — 얇은 진입점. Zod 검증 + super 가드 (requireSuperAdmin) + service 위임 (fullstack.md §3·§5)
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth-guards";
import { isAllowedImagePublicUrl } from "@/lib/s3";
import {
  type PresignedUploadResult,
  createPresignedPost,
  isAllowedImageMime,
  MAX_IMAGE_BYTES,
} from "@/features/storage";
import * as newsService from "./service";
import {
  listNewsQuerySchema,
  newsInputSchema,
  type NewsInput,
} from "./schemas";

export type ActionResult<T, Input = unknown> =
  | { success: true; data: T }
  | { success: false; error: string | z.ZodError<Input> };

// 가드 실패를 ActionResult 로 변환 — 모든 admin action 첫 줄에 사용 (codex P1#2 통일 패턴)
function authError(e: unknown): { success: false; error: string } {
  if (e instanceof Error) return { success: false, error: e.message };
  return { success: false, error: "Unauthorized" };
}

// 커버 이미지 URL 서버측 검증 — S3 public prefix 만 허용 (codex v2 P2#3, next/image unoptimized 가 remotePatterns 우회하므로 필수)
function isInvalidCover(url: string | null | undefined): boolean {
  return Boolean(url) && !isAllowedImagePublicUrl(url as string);
}

// 어드민 CRUD revalidate 묶음 — 글 변경 시 사용자 사이트 + 어드민 캐시 무효화
function revalidateNewsRoutes(id?: string) {
  revalidatePath("/news");
  revalidatePath("/admin/news");
  revalidatePath("/admin");
  revalidatePath("/");
  if (id) {
    revalidatePath(`/news/${id}`);
    revalidatePath(`/admin/news/${id}/edit`);
  }
}

// ─── 사용자 사이트 (인증 불필요, 읽기 전용) ─────────────────────────────────

export async function listNewsAction(rawQuery: Record<string, unknown>) {
  const parsed = listNewsQuerySchema.safeParse(rawQuery);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error };
  }
  const data = await newsService.listNews(parsed.data);
  return { success: true as const, data };
}

export async function getNewsDetailAction(id: string) {
  const data = await newsService.getNewsDetail(id);
  if (!data) return { success: false as const, error: "Not Found" };
  return { success: true as const, data };
}

// ─── 어드민 CRUD (super 가드) — RHF handleSubmit 의 values 객체 직접 수신 (결정 로그 [T7 시그니처]) ──

export async function createNewsAction(
  id: string,
  input: NewsInput,
): Promise<ActionResult<{ id: string }, NewsInput>> {
  try {
    const session = await requireSuperAdmin();
    // 새 글 id 는 client 생성 UUID — 업로드 prefix(news/{id}/) 와 동일하게 (codex v2 P2#2, temp prefix 제거)
    if (!z.uuid().safeParse(id).success) {
      return { success: false, error: "잘못된 글 ID 형식입니다." };
    }
    const parsed = newsInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error };
    }
    if (isInvalidCover(parsed.data.coverImageUrl)) {
      return {
        success: false,
        error: "커버 이미지 URL 이 허용된 스토리지 경로가 아닙니다.",
      };
    }
    const created = await newsService.createNews(
      id,
      parsed.data,
      session.user.id,
    );
    revalidateNewsRoutes(created.id);
    return { success: true, data: created };
  } catch (e) {
    return authError(e);
  }
}

export async function updateNewsAction(
  id: string,
  input: NewsInput,
): Promise<ActionResult<{ id: string }, NewsInput>> {
  try {
    await requireSuperAdmin();
    const parsed = newsInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error };
    }
    if (isInvalidCover(parsed.data.coverImageUrl)) {
      return {
        success: false,
        error: "커버 이미지 URL 이 허용된 스토리지 경로가 아닙니다.",
      };
    }
    const updated = await newsService.updateNews(id, parsed.data);
    if (!updated) return { success: false, error: "Not Found" };
    revalidateNewsRoutes(id);
    return { success: true, data: updated };
  } catch (e) {
    return authError(e);
  }
}

export async function deleteNewsAction(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin();
    const deleted = await newsService.deleteNews(id);
    if (!deleted) return { success: false, error: "Not Found" };
    revalidateNewsRoutes(id);
    return { success: true, data: deleted };
  } catch (e) {
    return authError(e);
  }
}

// 발행/해제 — UI 의 row 토글 버튼용 (편집 페이지 저장과 별도 — 결정 로그 [T7 publish 분리])
export async function publishNewsAction(
  id: string,
  publish: boolean,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin();
    const updated = await newsService.setPublishedAt(id, publish);
    if (!updated) return { success: false, error: "Not Found" };
    revalidateNewsRoutes(id);
    return { success: true, data: updated };
  } catch (e) {
    return authError(e);
  }
}

// 태그 자동완성 — TagsInput(T8) 진입점. super 가드 (결정 로그 [T8 searchTags 인증])
export async function searchTagsAction(
  prefix: string,
): Promise<ActionResult<Array<{ tag: string; count: number }>>> {
  try {
    await requireSuperAdmin();
    const tags = await newsService.searchTags(prefix);
    return { success: true, data: tags };
  } catch (e) {
    return authError(e);
  }
}

// ─── 이미지 업로드 Presigned POST 발급 (codex P1#4 + 결정 #16) ────────────

const uploadInputSchema = z
  .object({
    filename: z.string().min(1).max(200),
    mime: z.string().min(1).max(50),
    size: z.number().int().positive(),
    target: z.enum(["cover", "body"]),
    // 작성 모드(newsId 미존재) → tempId. 수정 모드 → newsId. 둘 중 정확히 하나.
    newsId: z.uuid().optional(),
    tempId: z.uuid().optional(),
  })
  .refine((v) => Boolean(v.newsId) !== Boolean(v.tempId), {
    message: "newsId 또는 tempId 둘 중 정확히 하나 필요",
  });

export type UploadImageInput = z.infer<typeof uploadInputSchema>;

export async function uploadImageAction(
  input: UploadImageInput,
): Promise<ActionResult<PresignedUploadResult, UploadImageInput>> {
  try {
    await requireSuperAdmin();
  } catch (e) {
    return authError(e);
  }
  const parsed = uploadInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }
  const { filename, mime, size, newsId, tempId } = parsed.data;
  if (!isAllowedImageMime(mime)) {
    return {
      success: false,
      error: `허용되지 않은 이미지 형식: ${mime} (JPG/PNG/WEBP 만)`,
    };
  }
  if (size > MAX_IMAGE_BYTES) {
    return {
      success: false,
      error: `이미지 용량이 5MB 를 초과합니다 (${Math.round(size / 1024)}KB)`,
    };
  }
  const scope = newsId ? { newsId } : { tempId: tempId! };
  try {
    const result = await createPresignedPost({ scope, filename, mime, size });
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "업로드 URL 발급 실패",
    };
  }
}
