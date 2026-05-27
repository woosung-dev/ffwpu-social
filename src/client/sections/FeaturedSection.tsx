// FeaturedSection — 피처드 스토리 4개 정적 데이터로 FeaturedStoryCard 래핑 (Figma 125:8985)
import Image from "next/image";

import {
  FeaturedStoryCard,
  type FeaturedStory,
} from "@/features/news/components";

const FEATURED_STORIES = [
  {
    id: "1",
    title: "동작구립 흑석종합사회복지관에 쌀 60Kg 기부",
    description: "따뜻한 진심을 담아 나누는 활동들을 소개합니다.",
    href: "#",
    imageUrl: "/images/featured-image50.png",
    badge: "쌀 나눔",
  },
  {
    id: "2",
    title: "삼태기마을에 따뜻한 온기를 전하다",
    description: "지역 봉사 활동을 통해 이웃과 함께하는 시간.",
    href: "#",
    imageUrl: "/images/featured-image50.png",
  },
  {
    id: "3",
    title: "가족 치유 캠프 — 함께하는 회복의 시간",
    description: "가족이 함께 성장하는 특별한 프로그램.",
    href: "#",
    imageUrl: "/images/featured-image50.png",
  },
  {
    id: "4",
    title: "환경 캠페인 — 지구를 위한 작은 실천",
    description: "자연과 함께하는 환경 보전 활동.",
    href: "#",
    imageUrl: "/images/featured-image50.png",
  },
] as const satisfies readonly FeaturedStory[];

export function FeaturedSection() {
  return (
    <section className="bg-surface-card py-12 px-5 lg:px-20">
      <div className="mx-auto max-w-screen-xl">
        {/* 미니 로고 */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/icons/featured-mini-logo.svg"
            alt=""
            width={98}
            height={65}
          />
        </div>
        <FeaturedStoryCard stories={FEATURED_STORIES} />
      </div>
    </section>
  );
}
