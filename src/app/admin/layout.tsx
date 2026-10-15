// 어드민 공통 레이아웃 — (auth)·(panel) 공용. Zod JIT 비활성(CSP eval 위반 방지, ADR-067)만 담당
import { ZodJitless } from "@/admin/components/ZodJitless";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ZodJitless />
      {children}
    </>
  );
}
