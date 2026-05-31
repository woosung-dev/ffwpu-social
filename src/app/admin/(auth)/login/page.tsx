// 어드민 로그인 페이지 — LoginForm 렌더 (Credentials Provider, ADR-020).
// 이미 로그인된 사용자는 proxy.ts 가 /admin 으로 redirect (중복 체크 제거).
import { LoginForm } from "@/admin/components/LoginForm";

export default function AdminLoginPage() {
  return <LoginForm />;
}
