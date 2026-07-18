// 홈 팝업 도메인 server-side public API — DAL을 감추고 후속 어드민·공개 화면에 제공한다.
import "server-only";

export {
  createPopupAction,
  updatePopupAction,
  deletePopupAction,
  setPopupActiveAction,
  uploadPopupImageAction,
  type PopupUploadInput,
} from "./actions";

export {
  listActivePopups,
  listPopupsForAdmin,
  getPopupById,
} from "./service";

export { popupInputSchema, type PopupInput } from "./schemas";
