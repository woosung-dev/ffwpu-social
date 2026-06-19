// 구 '소식 대표 글' 라우트 — 사이드바 재구성으로 '활동 스토리 관리'의 스토리 대표글 탭으로 흡수. 기존 북마크·내부 링크 안전망 리다이렉트
import { redirect } from "next/navigation";

export default function AdminNewsHeroRedirect() {
  redirect("/admin/news?tab=featured");
}
