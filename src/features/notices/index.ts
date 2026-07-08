// notices 도메인 server-side public API — db.ts 격리, actions/service/schemas 만 외부 노출 (ADR-024/042)
// Client Component 에서 쓰는 도메인 UI 는 별도 client-safe barrel — @/features/notices/components
import "server-only"; // client bundle 유입 시 빌드 에러 (경계 강제)

export {
  createNoticeAction,
  updateNoticeAction,
  deleteNoticeAction,
  publishNoticeAction,
  setNoticePinOrderAction,
  uploadNoticeImageAction,
  uploadNoticeAttachmentAction,
  type NoticeUploadInput,
} from "./actions";

export {
  listNotices,
  getNoticeDetail,
  getAdjacentNotices,
  getPublishedAttachment,
  listNoticesForAdmin,
  getAdminNoticeDetail,
  getNoticePinBoard,
} from "./service";

export {
  noticeInputSchema,
  listNoticesQuerySchema,
  setNoticePinOrderInputSchema,
  MAX_PINNED_NOTICES,
  type NoticeInput,
  type NoticeAttachmentInput,
  type ListNoticesQuery,
  type SetNoticePinOrderInput,
} from "./schemas";

export { attachmentContentDisposition } from "./content-disposition";
