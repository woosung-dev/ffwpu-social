// 섹션 콘텐츠 공통 래퍼 — Figma 구간별 *고정폭* (전 섹션 동일, 4프레임 Contents x좌표 역산 검증 2026-06-05).
// mobile 375~767: 유동(px-4, 콘텐츠 vw−32) / tablet 768~1024: 648 / desktop 1025~1439: 905 / wide 1440~: 1200.
// 각 구간 뷰포트 > max-w 라 max-w 가 곧 고정폭. gutter 는 mx-auto 중앙정렬 여백으로 자동(768→60·1024→188·1440→120).
// (`wide:` 단위 불일치 정렬 버그는 globals.css 에서 --breakpoint-wide: 90rem 으로 수정함 — 2026-06-06, docs/design.md.)
// 섹션별 flex/gap 은 className 으로 주입. (ADR-024 client 영역 공통 컴포넌트)
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  /** 헤더 해시 내비 점프 앵커 — 섹션 셸이 아닌 콘텐츠 래퍼에 id 를 둬서 상단 패딩을 헤더 뒤로 흡수(ADR-038) */
  id?: string;
  className?: string;
  children: ReactNode;
};

export function SectionContainer({ id, className, children }: Props) {
  return (
    <div id={id} className={cn("mx-auto w-full px-4 md:max-w-[648px] md:px-0 lg:max-w-[905px] wide:max-w-[1200px]", className)}>
      {children}
    </div>
  );
}
