// 사용자 사이트 홈 — 6 섹션 조립 (Figma 1440 기준 위→아래 순서)
import { ArticleGridSection } from "@/client/sections/ArticleGridSection";
import { FeaturedSection } from "@/client/sections/FeaturedSection";
import { HeroBanner } from "@/client/sections/HeroBanner";
import { KpiSection } from "@/client/sections/KpiSection";
import { PartnersSection } from "@/client/sections/PartnersSection";
import { StorySection } from "@/client/sections/StorySection";

export default function Home() {
  return (
    <>
      <HeroBanner />
      <KpiSection />
      <StorySection />
      <FeaturedSection />
      <ArticleGridSection />
      <PartnersSection />
    </>
  );
}
