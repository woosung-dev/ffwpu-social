// 소식 목록 placeholder — D-2 스프린트에서 Figma 125:8904 정합 본격 구현 시 교체. 현재는 PublicHeader의 prefetch RSC 404 회피용 빈 컨테이너 + 안내 메타데이터
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "쌀 나눔 소식 — Sow Good",
  description:
    "쌀 나눔으로 이어지는 사회공헌단의 활동 기록과 이야기를 곧 만나보실 수 있습니다.",
};

export default function NewsPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-[1200px] items-center justify-center px-4 py-24">
      <p className="text-base text-ink-subtle">
        소식 페이지는 곧 공개됩니다.
      </p>
    </section>
  );
}
