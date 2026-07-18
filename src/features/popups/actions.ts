"use server";

// 홈 팝업 Server Actions — 권한·입력·이미지 URL 검증 후 서비스에 위임한다.
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
import * as popupService from "./service";
import { popupInputSchema, type PopupInput } from "./schemas";

function revalidatePopupRoutes() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/popups");
}

function isValidPopupId(id: string) {
  return z.uuid().safeParse(id).success;
}

export async function createPopupAction(
  id: string,
  input: PopupInput,
): Promise<ActionResult<{ id: string }, PopupInput>> {
  try {
    const session = await requireSuperAdmin();
    if (!isValidPopupId(id)) return { success: false, error: "잘못된 팝업 ID 형식입니다." };
    const parsed = popupInputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error };
    if (!isAllowedImagePublicUrl(parsed.data.imageUrl)) {
      return { success: false, error: "허용되지 않은 이미지 주소입니다." };
    }
    const created = await popupService.createPopup(id, parsed.data, session.user.id);
    revalidatePopupRoutes();
    return { success: true, data: created };
  } catch (e) {
    return toActionError(e, "popupAction");
  }
}

export async function updatePopupAction(
  id: string,
  input: PopupInput,
): Promise<ActionResult<{ id: string }, PopupInput>> {
  try {
    await requireSuperAdmin();
    if (!isValidPopupId(id)) return { success: false, error: "잘못된 팝업 ID 형식입니다." };
    const parsed = popupInputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error };
    if (!isAllowedImagePublicUrl(parsed.data.imageUrl)) {
      return { success: false, error: "허용되지 않은 이미지 주소입니다." };
    }
    const updated = await popupService.updatePopup(id, parsed.data);
    if (!updated) return { success: false, error: "Not Found" };
    revalidatePopupRoutes();
    return { success: true, data: updated };
  } catch (e) {
    return toActionError(e, "popupAction");
  }
}

export async function deletePopupAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin();
    if (!isValidPopupId(id)) return { success: false, error: "잘못된 팝업 ID 형식입니다." };
    const deleted = await popupService.deletePopup(id);
    if (!deleted) return { success: false, error: "Not Found" };
    revalidatePopupRoutes();
    return { success: true, data: deleted };
  } catch (e) {
    return toActionError(e, "popupAction");
  }
}

export async function setPopupActiveAction(
  id: string,
  isActive: boolean,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin();
    if (!isValidPopupId(id)) return { success: false, error: "잘못된 팝업 ID 형식입니다." };
    if (!z.boolean().safeParse(isActive).success) {
      return { success: false, error: "활성 상태 형식이 올바르지 않습니다." };
    }
    const updated = await popupService.setPopupActive(id, isActive);
    if (!updated) return { success: false, error: "Not Found" };
    revalidatePopupRoutes();
    return { success: true, data: updated };
  } catch (e) {
    return toActionError(e, "popupAction");
  }
}

const popupUploadInputSchema = z.object({
  popupId: z.uuid(),
  filename: z.string().min(1).max(300),
  mime: z.string().max(100),
  size: z.number().int().positive(),
});

export type PopupUploadInput = z.infer<typeof popupUploadInputSchema>;

export async function uploadPopupImageAction(
  input: PopupUploadInput,
): Promise<ActionResult<PresignedUploadResult, PopupUploadInput>> {
  try {
    await requireSuperAdmin();
    const parsed = popupUploadInputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error };
    const { popupId, filename, mime, size } = parsed.data;
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
    const result = await createPresignedUpload({
      scope: { popupId },
      filename,
      mime,
      size,
    });
    return { success: true, data: result };
  } catch (e) {
    return toActionError(e, "popupAction");
  }
}
