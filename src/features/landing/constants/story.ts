// StorySection 우측 카피 — v1.0 코드 상수 (변경 빈도 분기↓). Figma node 331:8123 (랜딩 시안4) 정합
// 통계 3개(후원기관·지원가정·지역시설)는 kpi_metrics(section='story') DB 연결로 이동 — 운영자 /admin/landing 입력

// 제목·부제는 "줄 단위 배열" — 각 줄을 별도 엘리먼트로 렌더해 원하는 지점에서만 줄바꿈 강제
// (자연 줄바꿈 시 와이드에서 "가/족"처럼 어긋남). 한 줄이 컨테이너보다 넓으면 break-keep 으로 어절 단위 자연 래핑 fallback
export const STORY_SECTION_CONTENT = {
  tag: "쌀 나눔 활동",
  titleLines: ["밥이 사랑입니다", "나누는 우리는 식구입니다"],
  subtitleLines: [
    "온기가 필요한 이웃에게 밥 한 공기의 진심을 전하며,",
    "더 큰 가족을 만들어갑니다.",
  ],
} as const;
