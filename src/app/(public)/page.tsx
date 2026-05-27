// 사용자 랜딩 페이지 — Figma 96:7689 (1440) / 126:11815 (1920). 5섹션 (Hero / KPI / Story / ArticleGrid / Partners) + Footer는 PublicLayout 처리. 스크롤스파이는 PublicHeader가 #kpi·#stories·#story id 추적
import type { Metadata } from "next";

import {
  ArticleGridSection,
  HeroBanner,
  KpiSection,
  PartnersSection,
  StorySection,
} from "@/client/sections";

export const metadata: Metadata = {
  title: "Sow Good — 가치를 삶으로, 변화를 꽃피우는 동행",
  description:
    "세계평화통일가정연합 신한국협회 사회공헌국 Sow Good. 쌀 나눔으로 따뜻한 변화를 이어갑니다.",
  openGraph: {
    title: "Sow Good — 가치를 삶으로, 변화를 꽃피우는 동행",
    description:
      "세계평화통일가정연합 신한국협회 사회공헌국. 쌀 나눔으로 따뜻한 변화를.",
    type: "website",
    locale: "ko_KR",
  },
};

export default async function Home() {
  return (
    <>
      <HeroBanner />
      <KpiSection />
      <StorySection />
      <ArticleGridSection />
      <PartnersSection />
    </>
  );
}
