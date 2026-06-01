// StorySection 우측 카피 + 통계 3개 — v1.0 코드 상수 (변경 빈도 분기↓, v1.1 어드민화 후보)
// Figma node 331:8123 (랜딩 시안4) 정합

export const STORY_SECTION_CONTENT = {
  tag: "쌀 나눔 활동",
  title: "밥이 사랑입니다\n나누는 우리는 식구입니다",
  subtitle:
    "온기가 필요한 이웃에게 밥 한 공기의 진심을 전하며, 더 큰 가족을 만들어갑니다.",
  stats: [
    { label: "후원 기관", value: "16개" },
    { label: "지원 가정", value: "23가정" },
    { label: "지역 시설", value: "2시설" },
  ],
} as const;
