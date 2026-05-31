// 어드민 루트 — /dashboard 로 영구 리다이렉트
import { redirect } from 'next/navigation';

export default function AdminRoot(): never {
  redirect('/dashboard');
}
