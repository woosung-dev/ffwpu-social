// 홈 활성 팝업을 조회해 클라이언트 다이얼로그에 필요한 값만 전달한다.
import { listActivePopups } from "../db";
import { PopupDialog } from "./popup-dialog";

// Cache Components 환경에서 uncached 쿼리이므로 반드시 Suspense 내부에 마운트한다.
export async function PopupGate() {
  const popups = await listActivePopups();
  if (popups.length === 0) return null;

  return (
    <PopupDialog
      popups={popups.map(
        ({ id, title, imageUrl, imageWidth, imageHeight, linkUrl }) => ({
          id,
          title,
          imageUrl,
          imageWidth,
          imageHeight,
          linkUrl,
        }),
      )}
    />
  );
}
