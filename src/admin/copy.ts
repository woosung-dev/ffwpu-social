// 어드민 운영자 대면 라벨·도움말(HelpTip) 문구 단일 출처 — 개발 용어를 운영자 언어로 통일하고 비개발자가 한곳에서 검토·수정할 수 있게 모음
// 한 surface 에서만 쓰는 순수 UI 문구는 각 컴포넌트에 둔다. 여기에는 (1) 내비 라벨 (2) 페이지 제목·보조설명 (3) 용어가 바뀐 라벨 (4) 도움말 문구만 모은다.

export const ADMIN_COPY = {
  // ─── 좌측 네비게이션 (공개 사이트 섹션명에 맞춰 재그룹) ───
  nav: {
    brand: "Sow Good 어드민",
    brandSub: "사회공헌국 전용",
    dashboard: "대시보드",
    // 숫자로 보는 실천 (구 '메인 페이지' KPI)
    groupNumbers: "숫자로 보는 실천",
    kpi: "데이터 관리",
    // 밥이 사랑이다 (구 랜딩 'StorySection' — 카피·통계·상단 대표 사진)
    groupBob: "밥이 사랑이다",
    landing: "데이터 관리",
    // 스토리 (메인 스토리 카드 + 소식 운영 + 카테고리)
    groupStory: "스토리",
    mainStory: "메인 스토리 관리",
    story: "활동 스토리 관리",
    storyTabFeatured: "스토리 대표글",
    storyTabManage: "스토리 관리",
    categories: "스토리 카테고리",
    // 설정
    groupSystem: "설정",
    accounts: "관리자 계정",
    logout: "로그아웃",
  },

  // ─── 대시보드 ───
  dashboard: {
    title: "대시보드",
    description: "사이트 현황을 한눈에 보고, 자주 쓰는 작업으로 바로 이동합니다.",
    statusPublished: "발행된 글",
    statusDraft: "임시 저장",
    statusScheduled: "예약 발행 대기",
    quickTitle: "빠른 작업",
    quickNew: "새 글 작성",
    quickNewSub: "소식 글을 새로 씁니다",
    quickNews: "활동 스토리 관리",
    quickNewsSub: "대표글·글 목록·수정·발행",
    quickMain: "메인 페이지 꾸미기",
    quickMainSub: "노출 글·통계 설정",
    quickSite: "공개 사이트 보기",
    quickSiteSub: "새 탭으로 열기",
    analyticsTitle: "최근 콘텐츠 분석",
    analyticsDescription:
      "선택한 기간 동안 방문자가 사이트에서 보인 반응 요약이에요. 기간을 바꾸면 아래 숫자가 함께 바뀝니다.",
    analyticsUnavailable: "분석 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    periodLabel: "기간 선택",
    metricViews: "조회",
    metricUniqueViewers: "순 방문 브라우저",
    metricHeart: "공감 클릭",
    metricShare: "공유 클릭",
    popularTitle: "인기 글",
    popularEmpty: "아직 분석 이벤트가 없습니다.",
    referrerTitle: "유입 경로",
    referrerEmpty: "기록된 외부 유입이 없습니다.",
  },

  // ─── 스토리 카테고리 (구 소식 카테고리) ───
  categories: {
    title: "스토리 카테고리",
    description:
      "사용자 소식 페이지의 탭을 관리합니다. 순서를 드래그로 바꾸면 탭 순서도 그대로 바뀝니다.",
    titleHelp:
      "소식 글을 묶는 주제예요. 여기서 만든 카테고리가 사용자 소식 페이지의 탭이 됩니다.",
    nameLabel: "이름",
    nameHelp: "사용자 탭과 글 목록에 그대로 보이는 이름이에요. 예: 환경 캠페인",
    slugLabel: "URL 주소 (영문)",
    slugHelp:
      "사용자 사이트 주소에 쓰이는 영문 이름이에요. 예: 쌀 나눔 → rice-sharing. 영문 소문자·숫자·하이픈(-)만 쓸 수 있고, 한 번 정하면 바꿀 수 없어요.",
    slugPlaceholder: "rice-sharing",
    activeLabel: "사용자 사이트에 표시",
    activeHelp:
      "끄면 소식 페이지 탭과 글쓰기 카테고리 목록에서 사라져요. 이미 쓴 글은 삭제되지 않아요.",
    activeOn: "표시 중",
    activeOff: "숨김",
    slugLockNotice: "URL 주소는 한 번 정하면 바꿀 수 없어요. 순서는 목록에서 드래그로 조정하세요.",
  },

  // ─── 임팩트 데이터 (구 KPI) ───
  kpi: {
    title: "임팩트 데이터",
    description:
      "메인 페이지 '한 해동안 만들어낸 변화'에 보이는 숫자예요. 저장하면 사용자 사이트에 바로 반영됩니다.",
    titleHelp: "방문자에게 우리 활동의 성과를 숫자로 보여주는 영역이에요.",
    labelLabel: "제목",
    labelHelp: "예: 누적 봉사자 수",
    sublabelLabel: "작은 설명 (선택)",
    sublabelHelp: "제목 아래에 작게 붙는 보조 문구예요. 예: 지원가정",
    displayValueLabel: "화면에 보이는 값 (선택)",
    displayValueHelp:
      "비우면 아래 '화면 표시'대로(숫자+단위) 자동으로 보여요. 숫자로 표현 못 하는 특수 표기(예: 38년 5개월)가 필요할 때만 직접 적으세요.",
    valueLabel: "숫자",
    valueHelp:
      "이 숫자가 화면에 천단위 콤마와 함께 표시돼요(예: 4973 → 4,973). 협회 시트 동기화도 이 숫자만 갱신합니다. 콤마 없이 입력하세요.",
    unitHelp:
      "숫자 뒤에 붙는 단위예요. 예: 명, 시간, 건. '이상'을 뜻하는 '+'를 붙이려면 '명+'처럼 함께 적으면 계속 유지돼요.",
  },

  // ─── 밥이 사랑이다 (구 랜딩 StorySection — 카피·통계·상단 대표 사진) ───
  landing: {
    title: "밥이 사랑이다",
    description:
      "메인(랜딩) 페이지 '밥이 사랑이다' 영역의 카피·통계·상단 대표 사진을 정합니다.",
    statsTitle: "'밥이 사랑이다' 통계",
    statsHelp:
      "메인 페이지 '밥이 사랑이다' 영역의 작은 숫자예요. 화면에 보이는 값이 비어 있으면 그 통계는 숨겨집니다.",
    storyTitle: "'밥이 사랑이다' 대표 글 자리",
    storyHelp: "메인 페이지 '밥이 사랑이다'에 크게 보일 글이에요. 쌀 나눔 글만 고를 수 있어요.",
    featuredTitle: "'메인 스토리' 카드 자리",
    featuredHelp:
      "메인 페이지 '메인 스토리' 카드에 보일 글이에요. 비워두면 최신 글이 자동으로 채워져요. 모든 카테고리에서 고를 수 있어요.",
    storyTextTitle: "메인 카피 ('밥이 사랑이다')",
    storyTextHelp:
      "메인 페이지 '밥이 사랑이다' 영역의 태그·제목·부제 문구예요. 제목·부제는 엔터(줄바꿈)한 대로 줄이 나뉘어 보입니다.",
    storyTextDesc:
      "메인 페이지 '밥이 사랑이다' 영역에 보이는 문구를 직접 입력합니다.",
    storyTextTagLabel: "태그 (작은 알약)",
    storyTextTagPlaceholder: "예: 쌀 나눔 활동",
    storyTextTitleLabel: "제목 (엔터로 줄바꿈)",
    storyTextTitlePlaceholder:
      "엔터로 줄을 나눠 주세요.\n예:\n밥이 사랑입니다\n나누는 우리는 식구입니다",
    storyTextSubtitleLabel: "부제 (엔터로 줄바꿈)",
    storyTextSubtitlePlaceholder:
      "엔터로 줄을 나눠 주세요.\n예:\n온기가 필요한 이웃에게 밥 한 공기의 진심을 전하며,\n더 큰 가족을 만들어갑니다.",
  },

  // ─── 메인 스토리 관리 (랜딩 ArticleGrid 카드 큐레이션, 구 landing featured) ───
  mainStory: {
    title: "메인 스토리 관리",
    description:
      "메인(랜딩) 페이지 '메인 스토리' 카드에 어떤 글을 보여줄지 정합니다.",
  },

  // ─── 스토리 대표글 탭 (구 소식 히어로) ───
  newsHero: {
    title: "스토리 대표글",
    description: "활동 스토리(소식) 페이지 맨 위에 크게 도는 슬라이드를 정합니다.",
    titleHelp: "소식 페이지 맨 위 슬라이드에 크게 보이는 글이에요. 최대 4개까지 넣을 수 있어요.",
  },

  // ─── 관리자 계정 ───
  accounts: {
    title: "관리자 계정",
    description: "사이트를 관리하는 사람의 계정이에요.",
    roleSuper: "최고 관리자",
    roleSuperHelp: "모든 기능을 사용할 수 있는 관리자 권한이에요.",
    createNotice: "새 계정은 '최고 관리자' 권한으로 만들어져요.",
  },

  // ─── 활동 스토리 관리 (소식 운영 — 대표글 슬라이드 + 글 목록/작성/수정) ───
  news: {
    title: "활동 스토리 관리",
    description:
      "소식 페이지 상단 대표 슬라이드와 글 목록·작성·수정·발행을 탭으로 관리합니다.",
    statusHelp:
      "임시 저장은 나만 보는 초안, 예약은 정한 시각에 자동 발행, 발행은 지금 사용자에게 보이는 상태예요.",
    statsHelp:
      "각 글이 받은 조회·공감 클릭·공유 클릭 누적 수예요(분석 집계 시작 이후 기준). 아이콘 순서: 조회·공감·공유.",
    tagsHelp: "쉼표로 구분해 여러 개 넣을 수 있어요. 검색과 관련 글 추천에 쓰여요.",
  },
} as const;

// 분석 기간 필터 프리셋 — 비전문가 운영자용 (7/30/90일). 기본 30일.
export const ANALYTICS_PERIODS = [
  { days: 7, label: "최근 7일" },
  { days: 30, label: "최근 30일" },
  { days: 90, label: "최근 90일" },
] as const;

export const ANALYTICS_PERIOD_DAYS = ANALYTICS_PERIODS.map((p) => p.days);
export const DEFAULT_ANALYTICS_DAYS = 30;

// ?days= 쿼리값을 허용 프리셋으로 정규화 (벗어나면 기본 30일)
export function normalizeAnalyticsDays(raw: string | undefined): number {
  const n = Number(raw);
  return ANALYTICS_PERIOD_DAYS.includes(n as (typeof ANALYTICS_PERIOD_DAYS)[number])
    ? n
    : DEFAULT_ANALYTICS_DAYS;
}
