// 공지(notices) Server Actions — 얇은 진입점. Zod 검증 + super 가드 + service 위임 (news actions 컨벤션)
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth-guards";
import { type ActionResult, toActionError } from "@/lib/action-result";
import {
  type PresignedUploadResult,
  createPresignedAttachmentUpload,
  createPresignedUpload,
  isAllowedImageMime,
  MAX_IMAGE_BYTES,
} from "@/features/storage";
import { validateAttachment } from "@/features/storage/attachment-policy";
import * as noticeService from "./service";
import {
  noticeInputSchema,
  setNoticePinOrderInputSchema,
  type NoticeInput,
  type SetNoticePinOrderInput,
} from "./schemas";

// 공지 변경 시 공개 + 어드민 캐시 무효화 — 공지는 랜딩·큐레이션과 무관해 news 보다 좁은 묶음
function revalidateNoticeRoutes(id?: string) {
  revalidatePath("/notices");
  revalidatePath("/admin/notices");
  if (id) {
    revalidatePath(`/notices/${id}`);
    revalidatePath(`/admin/notices/${id}/edit`);
  }
}

export async function createNoticeAction(
  id: string,
  input: NoticeInput,
): Promise<ActionResult<{ id: string }, NoticeInput>> {
  try {
    const session = await requireSuperAdmin();
    // 새 공지 id 는 client 생성 UUID — 업로드 prefix(notices/{id}/) 와 동일 (news 동일)
    if (!z.uuid().safeParse(id).success) {
      return { success: false, error: "잘못된 공지 ID 형식입니다." };
    }
    const parsed = noticeInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error };
    }
    const created = await noticeService.createNotice(id, parsed.data, session.user.id);
    revalidateNoticeRoutes(created.id);
    return { success: true, data: created };
  } catch (e) {
    return toActionError(e, "noticeAction");
  }
}

export async function updateNoticeAction(
  id: string,
  input: NoticeInput,
): Promise<ActionResult<{ id: string }, NoticeInput>> {
  try {
    await requireSuperAdmin();
    if (!z.uuid().safeParse(id).success) {
      return { success: false, error: "잘못된 공지 ID 형식입니다." };
    }
    const parsed = noticeInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error };
    }
    const updated = await noticeService.updateNotice(id, parsed.data);
    if (!updated) return { success: false, error: "Not Found" };
    revalidateNoticeRoutes(id);
    return { success: true, data: updated };
  } catch (e) {
    return toActionError(e, "noticeAction");
  }
}

export async function deleteNoticeAction(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin();
    if (!z.uuid().safeParse(id).success) {
      return { success: false, error: "잘못된 공지 ID 형식입니다." };
    }
    const deleted = await noticeService.deleteNotice(id);
    if (!deleted) return { success: false, error: "Not Found" };
    revalidateNoticeRoutes(id);
    return { success: true, data: deleted };
  } catch (e) {
    return toActionError(e, "noticeAction");
  }
}

// 발행/해제 — 어드민 목록 row 토글 버튼용 (편집 페이지 저장과 별도)
export async function publishNoticeAction(
  id: string,
  publish: boolean,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin();
    if (!z.uuid().safeParse(id).success) {
      return { success: false, error: "잘못된 공지 ID 형식입니다." };
    }
    const updated = await noticeService.setPublishedAt(id, publish);
    if (!updated) return { success: false, error: "Not Found" };
    revalidateNoticeRoutes(id);
    return { success: true, data: updated };
  } catch (e) {
    return toActionError(e, "noticeAction");
  }
}

// 상위 고정 순서 저장 — 최대 N개·중복 불가·발행 공지만. 명시 Save (드롭마다 자동저장 아님). revalidate 공개+어드민
export async function setNoticePinOrderAction(
  input: SetNoticePinOrderInput,
): Promise<ActionResult<{ count: number }, SetNoticePinOrderInput>> {
  try {
    await requireSuperAdmin();
    const parsed = setNoticePinOrderInputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error };

    const result = await noticeService.setNoticePinOrder(parsed.data.orderedNoticeIds);
    if (result.kind === "has_unpublished") {
      return {
        success: false,
        error: "발행된 공지만 상위 고정할 수 있습니다.",
      };
    }
    revalidateNoticeRoutes();
    return { success: true, data: { count: parsed.data.orderedNoticeIds.length } };
  } catch (e) {
    return toActionError(e, "noticeAction");
  }
}

// ─── 업로드 presign 발급 ─────────────────────────────────────────────────

// mime 은 빈 문자열 허용 — hwp 등 OS 미등록 형식은 브라우저가 "" 로 신고 (attachment-policy 가 판정)
const noticeUploadInputSchema = z.object({
  noticeId: z.uuid(),
  filename: z.string().min(1).max(300),
  mime: z.string().max(100),
  size: z.number().int().positive(),
});

export type NoticeUploadInput = z.infer<typeof noticeUploadInputSchema>;

// 본문 이미지 — news 와 동일 이미지 정책(JPG/PNG/WEBP 5MB), key 는 notices/{id}/ prefix
export async function uploadNoticeImageAction(
  input: NoticeUploadInput,
): Promise<ActionResult<PresignedUploadResult, NoticeUploadInput>> {
  try {
    await requireSuperAdmin();
  } catch (e) {
    return toActionError(e, "noticeAction");
  }
  const parsed = noticeUploadInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }
  const { noticeId, filename, mime, size } = parsed.data;
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
  try {
    const result = await createPresignedUpload({
      scope: { noticeId },
      filename,
      mime,
      size,
    });
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "업로드 URL 발급 실패",
    };
  }
}

// 첨부파일 — 문서형 정책(ADR-041). 검증 실패 사유를 한국어로 매핑
const ATTACHMENT_REJECT_MESSAGE = {
  ext: "허용되지 않은 파일 형식입니다. (PDF·Word·Excel·PPT·한글·ZIP·이미지만 가능)",
  mime: "파일 형식을 확인할 수 없습니다. 다른 파일로 시도해주세요.",
  size: "첨부파일 용량이 20MB 를 초과합니다.",
} as const;

export async function uploadNoticeAttachmentAction(
  input: NoticeUploadInput,
): Promise<ActionResult<PresignedUploadResult, NoticeUploadInput>> {
  try {
    await requireSuperAdmin();
  } catch (e) {
    return toActionError(e, "noticeAction");
  }
  const parsed = noticeUploadInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }
  const { noticeId, filename, mime, size } = parsed.data;
  const validation = validateAttachment(filename, mime, size);
  if (!validation.ok) {
    return { success: false, error: ATTACHMENT_REJECT_MESSAGE[validation.reason] };
  }
  try {
    const result = await createPresignedAttachmentUpload({
      noticeId,
      filename,
      mime,
      size,
    });
    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "업로드 URL 발급 실패",
    };
  }
}
