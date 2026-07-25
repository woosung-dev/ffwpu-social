// /news 상단 히어로 — 운영자가 '활동 스토리 관리 → 스토리 대표글' 탭(/admin/news?tab=featured)에서 지정한 우선 소식 최대 4개를 FeaturedStoryCard(캐러셀)로 노출. 미지정 시 비노출
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
  }));

  return (
    // 배경(연한 회색)은 양옆 끝까지 풀폭(full-bleed) — 콘텐츠만 SectionContainer 밴드에 정렬 (Figma 125:8904)
    // 섹션 패딩 Figma: 375=pt40/pb60, 768·1025=pt20/pb40, 1440=pt30/pb60
    <section className="w-full bg-surface-card pt-10 pb-[60px] md:pt-5 md:pb-10 wide:pt-[30px] wide:pb-[60px]">
      <SectionContainer>
        <FeaturedStoryCard stories={stories} />
      </SectionContainer>
    </section>
  );
}
