// Youtube 확장 — src null 가드. 기본 @tiptap/extension-youtube 는 renderHTML 에서
// getEmbedUrlFromYoutubeUrl(src) → null.match() 로 src 가 null 이면 크래시(에디터 마운트 전체 실패).
// src 기본값을 "" 로 바꿔 null 진입을 차단(빈 문자열은 안전).
import Youtube from "@tiptap/extension-youtube";

export const SafeYoutube = Youtube.extend({
  addAttributes() {
    const parent = this.parent?.() as
      | Record<string, Record<string, unknown>>
      | undefined;
    return {
      ...(parent ?? {}),
      src: { ...(parent?.src ?? {}), default: "" },
    };
  },
});
