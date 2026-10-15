// Zod v4 JIT 비활성 — 첫 파싱 때 Function("") 로 eval 가능 여부를 탐지하는데, CSP(ADR-067)가 eval 을 막아
// 위반 리포트가 남는다(기능은 Zod 가 자체 폴백). 탐지 자체를 끄면 'unsafe-eval' 없이 위반 0.
// 클라이언트 Zod 사용처는 어드민 폼뿐이라 어드민 레이아웃(app/admin/layout.tsx)에서만 평가 — 공개 번들에 zod 미포함.
"use client";

import { z } from "zod";

z.config({ jitless: true });

export function ZodJitless() {
  return null;
}
