// 홈 팝업 비즈니스 로직 — DAL 호출과 삭제 후 스토리지 정리를 담당한다.
import { deleteByPrefix } from "@/features/storage";
import * as popupDb from "./db";
import type { PopupInput } from "./schemas";

export async function listActivePopups() {
  return popupDb.listActivePopups();
}

export async function listPopupsForAdmin() {
  return popupDb.listPopupsForAdmin();
}

export async function getPopupById(id: string) {
  return popupDb.getPopupById(id);
}

export async function createPopup(id: string, input: PopupInput, userId: string | null) {
  return popupDb.insertPopup({
    id,
    title: input.title,
    imageUrl: input.imageUrl,
    imageWidth: input.imageWidth ?? null,
    imageHeight: input.imageHeight ?? null,
    linkUrl: input.linkUrl,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    isActive: input.isActive,
    createdBy: userId,
  });
}

export async function updatePopup(id: string, input: PopupInput) {
  return popupDb.updatePopup(id, {
    title: input.title,
    imageUrl: input.imageUrl,
    imageWidth: input.imageWidth ?? null,
    imageHeight: input.imageHeight ?? null,
    linkUrl: input.linkUrl,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    isActive: input.isActive,
  });
}

export async function setPopupActive(id: string, isActive: boolean) {
  return popupDb.updatePopup(id, { isActive });
}

export async function deletePopup(id: string) {
  const deleted = await popupDb.deletePopup(id);
  if (deleted) {
    deleteByPrefix(`popups/${id}/`).catch((err) => {
      // eslint-disable-next-line no-console
      console.error("[popups.deletePopup] S3 cleanup 실패 (best-effort)", err);
    });
  }
  return deleted;
}
