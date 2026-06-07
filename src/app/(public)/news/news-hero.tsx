// /news 상단 히어로 — 운영자가 /admin/news-hero 에서 지정한 우선 소식 최대 4개를 FeaturedStoryCard(탭 슬라이더)로 노출. 미지정 시 비노출
import { getHeroNews } from "@/features/news";
import {
  FeaturedStoryCard,
  type FeaturedStory,
} from "@/features/news/components";
import { extractExcerpt } from "@/features/news/render/excerpt";
import { SectionContainer } from "@/client/components/layout";

export async function NewsHero() {
  const items = await getHeroNews();
  if (items.length === 0) return null; // hide-when-empty — 지정된 히어로 없으면 섹션 자체 비노출

  const stories: FeaturedStory[] = items.map((item) => ({
    id: item.id,
    title: item.title,
    description: extractExcerpt(item.body),
    href: `/news/${item.id}`,
    imageUrl: item.coverImageUrl,
    badge: item.categoryName,
  }));

  return (
    // 배경(연한 회색)은 양옆 끝까지 풀폭(full-bleed) — 콘텐츠만 SectionContainer 밴드에 정렬 (Figma 125:8904)
    <section className="w-full bg-surface-card pt-5 pb-[60px] lg:pt-[30px]">
      <SectionContainer>
        <FeaturedStoryCard stories={stories} />
      </SectionContainer>
    </section>
  );
}
