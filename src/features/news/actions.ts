// 소식(news) Server Actions — 얇은 진입점. Zod 검증 + super 가드 (requireSuperAdmin) + service 위임 (fullstack.md §3·§5)
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth-guards";
import { type ActionResult, toActionError } from "@/lib/action-result";
import { isAllowedImagePublicUrl } from "@/lib/s3";
import {
  type PresignedUploadResult,
  createPresignedUpload,
  isAllowedImageMime,
  MAX_IMAGE_BYTES,
} from "@/features/storage";
import * as newsService from "./service";
import { newsInputSchema, type NewsInput } from "./schemas";

// 커버 이미지 URL 서버측 검증 — S3 public prefix 만 허용 (codex v2 P2#3, next/image unoptimized 가 remotePatterns 우회하므로 필수)
function isInvalidCover(url: string | null | undefined): boolean {
  return Boolean(url) && !isAllowedImagePublicUrl(url as string);
}

// 어드민 CRUD revalidate 묶음 — 글 변경 시 사용자 사이트 + 어드민 캐시 무효화.
// 발행 해제·카테고리 변경 시 hero·landing 슬롯이 동반 정리되므로(A1b) 큐레이션 페이지도 함께 무효화
function revalidateNewsRoutes(id?: string) {
  revalidatePath("/news");
  revalidatePath("/admin/news");
  revalidatePath("/admin");
  revalidatePath("/admin/news-hero");
  revalidatePath("/admin/landing");
  revalidatePath("/");
  if (id) {
    revalidatePath(`/news/${id}`);
    revalidatePath(`/admin/news/${id}/edit`);
  }
}

// ─── 사용자 사이트 (인증 불필요, 읽기 전용) ─────────────────────────────────
// 목록 조회는 Server Action 대신 GET /api/news (route handler) — 클라 useSuspenseQuery 렌더 중 Router setState 경고 방지

export async function getNewsDetailAction(id: string) {
  const data = await newsService.getNewsDetail(id);
  if (!data) return { success: false as const, error: "Not Found" };
  return { success: true as const, data };
}

// 익명 좋아요 토글 / 상태 조회 — 인증 불필요. sessionId 는 client localStorage UUID (ADR-026, IP 미수집)
export async function toggleHeartAction(newsId: string, sessionId: string) {
  if (
    !z.uuid().safeParse(newsId).success ||
    !z.uuid().safeParse(sessionId).success
  ) {
    return { success: false as const, error: "Invalid request" };
  }
  try {
    const data = await newsService.toggleHeart(newsId, sessionId);
    return { success: true as const, data };
  } catch {
    return { success: false as const, error: "좋아요 처리에 실패했습니다." };
  }
}

export async function heartStateAction(newsId: string, sessionId: string) {
  if (
    !z.uuid().safeParse(newsId).success ||
    !z.uuid().safeParse(sessionId).success
  ) {
    return { success: false as const, error: "Invalid request" };
  }
  try {
    const data = await newsService.getHeartState(newsId, sessionId);
    return { success: true as const, data };
  } catch {
    return { success: false as const, error: "조회 실패" };
  }
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
    return toActionError(e, "newsAction");
  }
}

export async function updateNewsAction(
  id: string,
  input: NewsInput,
): Promise<ActionResult<{ id: string }, NewsInput>> {
  try {
    await requireSuperAdmin();
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
    const updated = await newsService.updateNews(id, parsed.data);
    if (!updated) return { success: false, error: "Not Found" };
    revalidateNewsRoutes(id);
    return { success: true, data: updated };
  } catch (e) {
    return toActionError(e, "newsAction");
  }
}

export async function deleteNewsAction(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin();
    if (!z.uuid().safeParse(id).success) {
      return { success: false, error: "잘못된 글 ID 형식입니다." };
    }
    const deleted = await newsService.deleteNews(id);
    if (!deleted) return { success: false, error: "Not Found" };
    revalidateNewsRoutes(id);
    return { success: true, data: deleted };
  } catch (e) {
    return toActionError(e, "newsAction");
  }
}

// 발행/해제 — UI 의 row 토글 버튼용 (편집 페이지 저장과 별도 — 결정 로그 [T7 publish 분리])
export async function publishNewsAction(
  id: string,
  publish: boolean,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin();
    if (!z.uuid().safeParse(id).success) {
      return { success: false, error: "잘못된 글 ID 형식입니다." };
    }
    const updated = await newsService.setPublishedAt(id, publish);
    if (!updated) return { success: false, error: "Not Found" };
    revalidateNewsRoutes(id);
    return { success: true, data: updated };
  } catch (e) {
    return toActionError(e, "newsAction");
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
    return toActionError(e, "newsAction");
  }
}

// 메인 랜딩 슬롯 설정 — /admin/landing 큐레이션. story (1~2) / featured (1~7). null = 해제. revalidate / 메인 + 어드민 landing
const setLandingSlotInputSchema = z.object({
  newsId: z.uuid(),
  kind: z.enum(["story", "featured"]),
  slot: z.number().int().min(1).max(7).nullable(),
});
type SetLandingSlotInput = z.infer<typeof setLandingSlotInputSchema>;

export async function setLandingSlotAction(
  input: SetLandingSlotInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin();
    const parsed = setLandingSlotInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error };
    }
    // story 슬롯은 1~2 만 허용 (UI 강제 보강 — DB 컬럼 제약 외 비즈니스 룰)
    if (parsed.data.kind === "story" && parsed.data.slot != null && parsed.data.slot > 2) {
      return { success: false, error: "StorySection 슬롯은 1 또는 2 만 가능합니다." };
    }
    const result = await newsService.setLandingSlot(
      parsed.data.newsId,
      parsed.data.kind,
      parsed.data.slot,
    );
    if (result.kind === "not_found") {
      return { success: false, error: "글을 찾을 수 없습니다." };
    }
    if (result.kind === "ineligible") {
      return {
        success: false,
        error: "발행된 쌀 나눔 글만 메인에 노출할 수 있습니다.",
      };
    }
    // 메인 / 사용자 사이트 + 어드민 큐레이션 페이지 동시 revalidate
    revalidatePath("/");
    revalidatePath("/admin/landing");
    return { success: true, data: { id: result.id } };
  } catch (e) {
    return toActionError(e, "newsAction");
  }
}

// /news Hero 정렬 저장 — 최대 4개, 중복 불가. 명시 Save (드롭마다 자동저장 아님). revalidate /news + 어드민
const setHeroOrderInputSchema = z
  .object({
    orderedNewsIds: z
      .array(z.uuid())
      .max(4, "Hero 는 최대 4개까지 지정할 수 있습니다."),
  })
  .refine(
    (v) => new Set(v.orderedNewsIds).size === v.orderedNewsIds.length,
    { message: "중복된 글이 포함되어 있습니다." },
  );
type SetHeroOrderInput = z.infer<typeof setHeroOrderInputSchema>;

export async function setHeroOrderAction(
  input: SetHeroOrderInput,
): Promise<ActionResult<{ count: number }, SetHeroOrderInput>> {
  try {
    await requireSuperAdmin();
    const parsed = setHeroOrderInputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error };

    const result = await newsService.setHeroOrder(parsed.data.orderedNewsIds);
    if (result.kind === "has_unpublished") {
      return {
        success: false,
        error: "발행된 글만 히어로에 지정할 수 있습니다.",
      };
    }
    revalidatePath("/news");
    revalidatePath("/admin/news-hero");
    return { success: true, data: { count: parsed.data.orderedNewsIds.length } };
  } catch (e) {
    return toActionError(e, "newsAction");
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
    return toActionError(e, "newsAction");
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
    const result = await createPresignedUpload({ scope, filename, mime, size });
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "업로드 URL 발급 실패",
    };
  }
}
