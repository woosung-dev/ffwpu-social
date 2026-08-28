// DB 초기 시드 — super 어드민 + 소식 14건(쌀나눔 8) + 커버 이미지 MinIO 업로드 + 랜딩 슬롯(story/featured/hero) 배정. tsx로 실행
// 커버는 /public 경로 금지 — isAllowedImagePublicUrl 이 S3 public URL prefix 만 허용 (어드민 수정 시 검증 실패 방지)
// dotenv를 다른 모듈보다 먼저 실행해야 하므로 db/schema·lib/s3는 dynamic import
import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { sql } from "drizzle-orm";

import { normalizeEmail } from "../features/accounts/schemas";
import { readImageSize } from "../features/storage/image-size";

config({ path: ".env.local" });

// 로그인 정규화(normalizeEmail)와 동일 적용 — 대문자 ADMIN_EMAIL 로 seed 시 로그인 불가 방지 (C1.6)
const adminEmail = normalizeEmail(
  process.env.ADMIN_EMAIL ?? "admin@ffwpu-social.local",
);
const adminPassword = process.env.ADMIN_PASSWORD;
if (!adminPassword) {
  console.error("[seed] ADMIN_PASSWORD 환경변수가 필요합니다.");
  console.error("       예: ADMIN_PASSWORD='your-password' pnpm db:seed");
  process.exit(1);
}

const { db } = await import("./index");
const { users, categories, news, newsTags, notices, noticeAttachments, kpiMetrics } =
  await import("./schema");
const { s3, S3_BUCKET, getPublicUrl } = await import("../lib/s3");

// ---------------------------------------------------------------------------
// 커버 이미지 자산 해석 + MinIO 업로드
// 우선순위: src/db/seed-assets/ (사회공헌국 실사진 — 수령 시 canonical 이름으로 배치)
//        → public/images/ (Figma 추출 자산 폴백 — 실사진 수령 전 임시)
// ---------------------------------------------------------------------------

const ASSET_DIRS = [
  path.join(process.cwd(), "src/db/seed-assets"),
  path.join(process.cwd(), "public/images"),
] as const;

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

function resolveAssetPath(filename: string): string | null {
  for (const dir of ASSET_DIRS) {
    const p = path.join(dir, filename);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// 업로드 결과 — publicUrl + 픽셀 치수(없으면 null). 치수는 공유 readImageSize(features/storage/image-size) 사용
type CoverMeta = { url: string; width: number | null; height: number | null };

// 결정적 키(news/seed/<파일명>) — 재시드 시 동일 키 덮어쓰기, orphan 미발생
async function uploadCover(filename: string): Promise<CoverMeta | null> {
  const filePath = resolveAssetPath(filename);
  if (!filePath) {
    console.warn(`[seed] ⚠ 커버 자산 미발견: ${filename} — 커버 없이 진행`);
    return null;
  }
  const ext = path.extname(filename).toLowerCase();
  const contentType = CONTENT_TYPE_BY_EXT[ext];
  if (!contentType) {
    console.warn(`[seed] ⚠ 미지원 확장자: ${filename} — 커버 없이 진행`);
    return null;
  }
  const buffer = fs.readFileSync(filePath);
  const size = readImageSize(buffer);
  if (!size) {
    console.warn(`[seed] ⚠ ${filename}: 치수 파싱 실패 — 마조네리 폴백 비율 사용`);
  }
  const key = `news/seed/${filename}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
  if (!filePath.includes("seed-assets")) {
    console.warn(
      `[seed] ⚠ ${filename}: Figma 추출 폴백 사용 — 실사진 수령 시 src/db/seed-assets/ 에 동일 이름으로 배치 후 재시드`,
    );
  }
  return {
    url: getPublicUrl(key),
    width: size?.width ?? null,
    height: size?.height ?? null,
  };
}

// ---------------------------------------------------------------------------
// Tiptap 본문 빌더 — 문단 2~3개 + (선택) 인라인 이미지. 렌더러 지원 노드만 사용
// ---------------------------------------------------------------------------

type TiptapNode = Record<string, unknown>;

function buildBody(paragraphs: string[], imageUrl?: string | null): TiptapNode {
  const content: TiptapNode[] = [];
  paragraphs.forEach((text, i) => {
    content.push({
      type: "paragraph",
      content: [{ type: "text", text }],
    });
    // 첫 문단 뒤 인라인 이미지 — 본문 이미지 렌더 경로(isAllowedImagePublicUrl) 검증 겸용
    if (i === 0 && imageUrl) {
      content.push({ type: "image", attrs: { src: imageUrl, alt: "" } });
    }
  });
  return { type: "doc", content };
}

// ---------------------------------------------------------------------------
// 샘플 소식 14건 — 쌀나눔 8 + 가족치유 2 + 지역봉사 2 + 환경 2
// storySlot/featuredRank/heroRank 는 명시 필드로 고정 (정수 중복 = unique index 23505 — 리뷰 가시화)
// ---------------------------------------------------------------------------

type SeedSample = {
  title: string;
  category: "family_healing" | "local_volunteer" | "environment" | "rice_sharing";
  tags: string[];
  publishedAt: Date;
  paragraphs: string[];
  coverFile?: string; // seed-assets/ 우선 → public/images/ 폴백
  storySlot?: 1 | 2; // 랜딩 StorySection 상단 — 쌀나눔+발행+커버 필수
  featuredRank?: 1 | 2 | 3 | 4 | 5 | 6; // 랜딩 ArticleGrid — 쌀나눔+발행 필수
  heroRank?: 1 | 2 | 3 | 4; // /news Hero 캐러셀
  bodyImage?: boolean; // 본문 인라인 이미지(커버 URL 재사용)
};

const samples: SeedSample[] = [
  {
    title: "한식 행사 쌀 화환 320kg으로 이웃과 함께 나누는 식구 공동체",
    category: "rice_sharing",
    tags: ["이웃관심", "쌀나눔", "자원봉사"],
    publishedAt: new Date("2026-03-11"),
    coverFile: "articlegrid-card1.png",
    featuredRank: 1,
    heroRank: 1,
    paragraphs: [
      "한식을 맞아 행사장에 놓였던 쌀 화환 320kg이 지역 이웃들의 식탁으로 전해졌습니다. 화환을 보내주신 분들의 마음이 그대로 나눔으로 이어진 자리였습니다.",
      "포장과 전달에는 자원봉사자 20여 명이 함께했습니다. 쌀 한 포대마다 손글씨 카드를 함께 담아, 받는 분들이 따뜻한 마음까지 받아가실 수 있도록 준비했습니다.",
      "쌀 화환 나눔은 행사 후 버려지기 쉬운 화환 문화를 나눔 문화로 바꾸는 작은 실천입니다. 앞으로도 지역 행사와 연계해 이어갈 예정입니다.",
    ],
  },
  {
    title: "지역 어르신 가정에 쌀 50포대 전달, 따뜻한 봄 인사",
    category: "rice_sharing",
    tags: ["쌀나눔", "어르신", "지역사회"],
    publishedAt: new Date("2026-03-05"),
    coverFile: "articlegrid-card2.png",
    featuredRank: 2,
    heroRank: 2,
    paragraphs: [
      "봄을 맞아 홀로 지내시는 어르신 50가정에 쌀 10kg 포대를 전달했습니다. 동 주민센터와 함께 대상 가정을 정하고, 봉사자들이 직접 찾아뵙는 방식으로 진행했습니다.",
      "문 앞에 쌀만 두고 오는 것이 아니라, 안부를 여쭙고 짧은 대화를 나누는 시간을 더했습니다. 한 어르신께서는 \"사람 목소리가 더 반갑다\"는 말씀을 전해주셨습니다.",
    ],
  },
  {
    title: "감사의 마음을 담은 쌀 10kg, 이웃 식탁에 오르다",
    category: "rice_sharing",
    tags: ["쌀나눔", "이웃관심", "나눔문화"],
    publishedAt: new Date("2026-03-22"),
    coverFile: "story-card1.png",
    storySlot: 1,
    featuredRank: 5,
    bodyImage: true,
    paragraphs: [
      "\"감사의 마음을 전합니다\"라는 문구가 새겨진 쌀 10kg 패키지가 이웃들의 식탁에 올랐습니다. 후원자의 정성이 포장 하나하나에 담겼습니다.",
      "이번 나눔은 후원 기관과 지역 시설이 함께한 협력 사례입니다. 전달 과정에서 받는 분의 일정과 상황을 먼저 여쭙고, 가장 편한 방식으로 전해드렸습니다.",
      "밥 한 공기의 진심이 모이면 마을의 온도가 달라집니다. 나누는 우리는 모두 식구입니다.",
    ],
  },
  {
    title: "동작구립 흑석종합사회복지관에 쌀 60kg 전달",
    category: "rice_sharing",
    tags: ["쌀나눔", "복지관", "지역사회"],
    publishedAt: new Date("2026-03-18"),
    coverFile: "story-card2.png",
    storySlot: 2,
    featuredRank: 4,
    bodyImage: true,
    paragraphs: [
      "동작구립 흑석종합사회복지관에 쌀 60kg을 전달했습니다. 복지관을 통해 도움이 필요한 지역 가정에 골고루 전해질 예정입니다.",
      "복지관 관계자분들과 함께 전달식을 갖고, 앞으로의 정기 나눔 일정도 논의했습니다. 지역 기관과의 협력은 나눔이 꾸준히 이어지게 하는 가장 든든한 통로입니다.",
    ],
  },
  {
    title: "삼태기마을에도 고소한 밥 내음이 퍼졌습니다",
    category: "rice_sharing",
    tags: ["쌀나눔", "마을공동체", "현장소식"],
    publishedAt: new Date("2026-02-25"),
    coverFile: "articlegrid-card4.png",
    featuredRank: 6,
    paragraphs: [
      "삼태기마을 경로당에서 쌀 나눔 행사가 열렸습니다. 마을 어르신들과 봉사자들이 함께 모여 쌀을 나누고, 점심 한 끼를 같이했습니다.",
      "나눔은 물건을 전하는 일이지만, 같이 밥을 먹는 일이기도 합니다. 식탁에 둘러앉은 순간만큼은 모두가 한 식구였습니다.",
    ],
  },
  {
    title: "쌀 나눔 누적 80,000가정 돌파 — 38년의 발걸음",
    category: "rice_sharing",
    tags: ["쌀나눔", "누적", "이정표"],
    publishedAt: new Date("2026-01-30"),
    coverFile: "articlegrid-card3.png",
    featuredRank: 3,
    paragraphs: [
      "쌀 나눔으로 함께한 가정이 누적 80,000가정을 넘었습니다. 1988년 첫 나눔 이후 38년 동안 한 해도 쉬지 않고 이어온 발걸음입니다.",
      "숫자보다 소중한 것은 그 안의 한 가정, 한 사람의 이야기입니다. 기록은 지나가지만 식탁의 온기는 남는다고 믿습니다.",
      "다음 10년의 나눔을 위해 후원 기관, 지역 시설과 함께 더 촘촘한 전달 체계를 준비하고 있습니다.",
    ],
  },
  {
    title: "쌀 화환 기부 릴레이 — 결혼식의 기쁨을 이웃과 나누다",
    category: "rice_sharing",
    tags: ["쌀나눔", "기부릴레이", "쌀화환"],
    publishedAt: new Date("2026-02-11"),
    coverFile: "articlegrid-card5.png",
    heroRank: 3,
    paragraphs: [
      "결혼식에 들어온 쌀 화환을 신랑·신부가 그대로 기부하는 릴레이가 이어지고 있습니다. 이번 달에만 세 쌍의 부부가 동참해 쌀 180kg이 모였습니다.",
      "기쁜 날의 마음을 이웃과 나누는 문화가 자리 잡을 수 있도록, 예식장과 연계한 안내 절차도 마련했습니다.",
    ],
  },
  {
    title: "설맞이 쌀 나눔 — 200가정에 온기를 전하다",
    category: "rice_sharing",
    tags: ["쌀나눔", "설명절", "온기나눔"],
    publishedAt: new Date("2026-01-15"),
    coverFile: "articlegrid-card6.png",
    paragraphs: [
      "설 명절을 앞두고 200가정에 쌀과 생필품 꾸러미를 전달했습니다. 명절에 더 외로울 수 있는 이웃들이 따뜻한 한 끼를 차릴 수 있기를 바라는 마음을 담았습니다.",
      "이번 나눔에는 지역 상점들도 동참해 꾸러미 품목을 함께 채웠습니다. 마을 안에서 시작된 나눔이 마을 전체로 번지고 있습니다.",
    ],
  },
  {
    title: "가족 치유 캠프 30회차 — 회복된 부모와 자녀의 이야기",
    category: "family_healing",
    tags: ["가족치유", "캠프", "회복"],
    publishedAt: new Date("2026-02-20"),
    coverFile: "featured-image50.png",
    heroRank: 4,
    paragraphs: [
      "가족 치유 캠프가 30회차를 맞았습니다. 1박 2일 동안 부모와 자녀가 서로의 이야기를 끝까지 들어보는 시간을 가졌습니다.",
      "프로그램을 마친 한 참가자는 \"같은 집에 살면서도 처음 들은 이야기가 많았다\"고 소감을 남겼습니다. 대화의 회복이 가족 회복의 시작입니다.",
    ],
  },
  {
    title: "환경의 날 맞이, 마을 하천 정화 봉사 동참",
    category: "environment",
    tags: ["환경", "하천정화", "지속가능"],
    publishedAt: new Date("2026-02-28"),
    paragraphs: [
      "환경의 날을 맞아 마을 하천 정화 봉사에 참여했습니다. 두 시간 동안 수거한 쓰레기는 마대 30자루 분량이었습니다.",
      "하천을 따라 걸으며 분리수거 캠페인 전단도 함께 나눴습니다. 깨끗해진 물길만큼 마음도 가벼워진 하루였습니다.",
    ],
  },
  {
    title: "지역 아동센터 학습 멘토링 — 100시간 누적",
    category: "local_volunteer",
    tags: ["멘토링", "지역봉사", "교육"],
    publishedAt: new Date("2026-02-14"),
    paragraphs: [
      "지역 아동센터에서 진행해 온 학습 멘토링이 누적 100시간을 넘었습니다. 매주 두 차례, 대학생 봉사자들이 아이들과 함께 책상에 앉습니다.",
      "성적보다 중요한 것은 \"끝까지 옆에 있어 주는 어른\"의 존재라고 믿습니다. 멘토링은 다음 학기에도 계속됩니다.",
    ],
  },
  {
    title: "재활용 분리수거 캠페인, 학생들과 손잡고",
    category: "environment",
    tags: ["환경", "재활용", "학생"],
    publishedAt: new Date("2026-02-08"),
    paragraphs: [
      "지역 중·고등학생들과 함께 재활용 분리수거 캠페인을 진행했습니다. 등굣길 거점 세 곳에서 올바른 분리배출 방법을 안내했습니다.",
      "학생들이 직접 만든 안내판은 캠페인이 끝난 뒤에도 거점에 남아 마을의 분리수거 길잡이가 되고 있습니다.",
    ],
  },
  {
    title: "지역 독거 어르신 가정 환경 개선 봉사",
    category: "local_volunteer",
    tags: ["어르신", "지역봉사", "환경개선"],
    publishedAt: new Date("2026-01-22"),
    paragraphs: [
      "홀로 지내시는 어르신 가정 다섯 곳의 주거 환경 개선 봉사를 진행했습니다. 도배와 장판 교체, 묵은 짐 정리를 함께했습니다.",
      "집이 바뀌면 하루가 바뀝니다. 어르신들이 더 안전하고 따뜻한 겨울을 보내실 수 있기를 바랍니다.",
    ],
  },
  {
    title: "갈등 회복 상담 프로그램, 가족 7쌍 회복기",
    category: "family_healing",
    tags: ["가족치유", "상담", "회복"],
    publishedAt: new Date("2026-01-10"),
    paragraphs: [
      "8주간 진행된 갈등 회복 상담 프로그램에 일곱 가족이 참여해 전 과정을 마쳤습니다. 전문 상담사와 함께 갈등의 뿌리를 찬찬히 들여다보는 시간이었습니다.",
      "프로그램은 분기마다 열립니다. 참여를 원하는 가정은 언제든 문의해 주시기 바랍니다.",
    ],
  },
];

// ---------------------------------------------------------------------------
// 샘플 공지 8건 — 발행 6 + 예약 1 + 임시 1, 그중 2건 첨부(PDF)
// id 고정 UUID — 첨부 키(notices/{id}/attachments/)가 재시드에도 동일해 orphan 미발생
// ---------------------------------------------------------------------------

// 최소 유효 PDF — 첨부 다운로드 경로(presigned GET 302) 검증용 더미
const MINIMAL_PDF = Buffer.from(
  "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\ntrailer<</Size 4/Root 1 0 R>>\n%%EOF\n",
);

async function uploadNoticeSeedPdf(noticeId: string, filename: string) {
  const key = `notices/${noticeId}/attachments/seed-${filename}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: MINIMAL_PDF,
      ContentType: "application/pdf",
    }),
  );
  return key;
}

type SeedNotice = {
  id: string;
  title: string;
  // null = 임시저장, 미래 Date = 예약 발행
  publishedAt: Date | null;
  paragraphs: string[];
  attachmentFiles?: string[];
};

const noticeSamples: SeedNotice[] = [
  {
    id: "0d9b2a51-6a4f-4c1e-9b3a-1f2e3d4c5b6a",
    title: "2026년 여름 쌀 나눔 자원봉사자 모집 안내",
    publishedAt: new Date("2026-06-20"),
    attachmentFiles: ["모집요강.pdf", "신청서양식.pdf"],
    paragraphs: [
      "2026년 여름 쌀 나눔 활동에 함께할 자원봉사자를 모집합니다. 포장·전달·안부 방문 등 다양한 역할이 준비되어 있습니다.",
      "자세한 일정과 신청 방법은 첨부된 모집요강을 확인해 주세요. 신청서 양식을 작성해 사무국 메일로 보내주시면 됩니다.",
    ],
  },
  {
    id: "1e8c3b62-7b5a-4d2f-8c4b-2a3f4e5d6c7b",
    title: "사회공헌단 Sow Good 홈페이지 오픈 안내",
    publishedAt: new Date("2026-06-10"),
    paragraphs: [
      "사회공헌단 Sow Good 의 공식 홈페이지가 문을 열었습니다. 쌀 나눔을 비롯한 활동 소식과 공지사항을 이곳에서 확인하실 수 있습니다.",
      "앞으로도 투명하고 따뜻한 나눔 소식으로 찾아뵙겠습니다.",
    ],
  },
  {
    id: "2f7d4c73-8c6b-4e3a-9d5c-3b4a5f6e7d8c",
    title: "[안내] 7월 정기 나눔 일정 변경",
    publishedAt: new Date("2026-07-01"),
    paragraphs: [
      "7월 정기 쌀 나눔 일정이 우천 예보로 하루 앞당겨졌습니다. 참여 예정이신 봉사자분들은 변경된 일정을 확인해 주세요.",
      "일정 변경으로 불편을 드려 죄송합니다. 문의는 사무국으로 부탁드립니다.",
    ],
  },
  {
    id: "3a6e5d84-9d7c-4f4b-8e6d-4c5b6a7f8e9d",
    title: "후원 물품 전달 절차 안내",
    publishedAt: new Date("2026-05-28"),
    attachmentFiles: ["전달절차안내.pdf"],
    paragraphs: [
      "후원 물품이 이웃에게 전달되기까지의 절차를 안내드립니다. 접수부터 전달 확인까지 모든 단계는 기록으로 남깁니다.",
      "자세한 절차는 첨부 문서를 참고해 주세요.",
    ],
  },
  {
    id: "4b5f6e95-ae8d-4a5c-9f7e-5d6c7b8a9f0e",
    title: "개인정보 처리방침 개정 안내",
    publishedAt: new Date("2026-05-15"),
    paragraphs: [
      "개인정보 처리방침이 2026년 5월 15일자로 개정되었습니다. 주요 변경 사항은 수집 항목 최소화와 보관 기간 명시입니다.",
      "궁금하신 점은 사무국으로 문의해 주시기 바랍니다.",
    ],
  },
  {
    id: "5c4a7f06-bf9e-4b6d-8a8f-6e7d8c9b0a1f",
    title: "설 연휴 사무국 운영 안내",
    publishedAt: new Date("2026-02-10"),
    paragraphs: [
      "설 연휴 기간(2026년 2월 16일~18일) 사무국 운영을 쉽니다. 연휴 중 접수된 문의는 업무 재개 후 순차적으로 답변드립니다.",
      "따뜻한 명절 보내시기 바랍니다.",
    ],
  },
  {
    id: "6d3b8a17-c0af-4c7e-9b9a-7f8e9d0c1b2a",
    title: "8월 봉사자 안전 교육 일정 안내",
    // 예약 발행 — 시드 시점 기준 미래
    publishedAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    paragraphs: [
      "8월 정기 봉사자 안전 교육 일정을 안내드립니다. 신규 봉사자는 필수 참석입니다.",
    ],
  },
  {
    id: "7e2c9b28-d1ba-4d8f-8cab-8a9f0e1d2c3b",
    title: "(작성 중) 2026 상반기 활동 보고",
    publishedAt: null,
    paragraphs: ["상반기 활동 보고 초안입니다. 발행 전 검토 중입니다."],
  },
];

async function seed() {
  console.log("[seed] truncating existing rows...");
  await db.execute(
    sql`TRUNCATE TABLE news_tags, heart_events, audit_logs, news, notice_attachments, notices, categories, users, kpi_metrics, site_settings RESTART IDENTITY CASCADE`,
  );

  console.log("[seed] inserting KPI metrics (디자이너 더미 — 사회공헌국 정확값 수령 후 어드민에서 교체)...");
  await db.insert(kpiMetrics).values([
    {
      slug: "volunteer_count",
      label: "누적 봉사자 수",
      value: 45217,
      displayValue: "45,217명+",
      unit: "명",
      sortOrder: 1,
    },
    {
      slug: "volunteer_period",
      label: "누적 봉사 기간",
      value: null, // 기간 비숫자 (38년 5개월)
      displayValue: "38년 5개월",
      unit: null,
      sortOrder: 2,
    },
    {
      slug: "helped_household_count",
      label: "행복응원 가정수",
      sublabel: "지원가정",
      value: 80257,
      displayValue: "80,257개+",
      unit: "개",
      sortOrder: 3,
    },
    {
      slug: "event_count",
      label: "봉사활동 횟수",
      value: 3614,
      displayValue: "3,614회+",
      unit: "회",
      sortOrder: 4,
    },
    // StorySection 통계 (section: story) — 숫자 우선 모델(impact 와 동일). 숫자는 쌀나눔 시트 동기화가 채우고 라벨·단위는 운영자 소유.
    // hide-when-empty: 숫자도 표시값도 없으면 메인 비노출
    // slug story_supported_orgs 는 '후원 기관' → '나눈 사랑(쌀)의 무게' 로 전환(사용자 요청). 표시값 빈값 = kg 입력 전까지 숨김
    {
      slug: "story_supported_orgs",
      section: "story" as const,
      label: "나눈 사랑(쌀)의 무게",
      value: null,
      displayValue: "",
      // 단위는 운영자 소유 — 시트 동기화가 value 만 채워도 "3,210kg" 으로 표시되게 미리 둔다 (0020)
      unit: "kg",
      sortOrder: 1,
    },
    {
      slug: "story_supported_households",
      section: "story" as const,
      label: "지원 가정",
      value: 23,
      displayValue: "",
      unit: "가정",
      sortOrder: 2,
    },
    {
      slug: "story_local_facilities",
      section: "story" as const,
      label: "지역 시설",
      value: 2,
      displayValue: "",
      unit: "개 시설",
      sortOrder: 3,
    },
  ]);

  console.log("[seed] inserting categories...");
  const categoryRows = await db
    .insert(categories)
    .values([
      { name: "가족 치유", slug: "family_healing", sortOrder: 1 },
      { name: "지역 봉사", slug: "local_volunteer", sortOrder: 2 },
      { name: "환경 캠페인", slug: "environment", sortOrder: 3 },
      { name: "쌀 나눔", slug: "rice_sharing", sortOrder: 4 },
      // 언론 속 사회공헌 (ADR-056) — 별도 게시판. slug unique 가 (board, slug) 복합이라
      // 활동 스토리와 같은 slug 를 각자 쓸 수 있다(여기서도 rice_sharing 을 중복 사용해 제약을 실증)
      { name: "쌀 나눔", slug: "rice_sharing", board: "press" as const, sortOrder: 1 },
      { name: "지역 봉사", slug: "local_volunteer", board: "press" as const, sortOrder: 2 },
    ])
    .returning();
  // 활동 스토리 카테고리만 매핑 — 아래 샘플 글은 전부 story 게시판이라 press 행이 섞이면 안 된다
  const categoryIdBySlug = new Map(
    categoryRows.filter((c) => c.board === "story").map((c) => [c.slug, c.id]),
  );

  console.log("[seed] inserting super admin...");
  const passwordHash = await bcrypt.hash(adminPassword!, 10);
  const [admin] = await db
    .insert(users)
    .values({
      email: adminEmail,
      name: "사회공헌국 운영자",
      role: "super",
      passwordHash,
    })
    .returning();

  console.log("[seed] uploading cover assets to MinIO...");
  // 파일명 → {url, width, height} 캐시 (동일 자산 중복 업로드 방지)
  const coverMetaByFile = new Map<string, CoverMeta | null>();
  for (const sample of samples) {
    if (!sample.coverFile || coverMetaByFile.has(sample.coverFile)) continue;
    try {
      coverMetaByFile.set(sample.coverFile, await uploadCover(sample.coverFile));
    } catch (err) {
      console.error(
        "[seed] MinIO 업로드 실패 — docker compose up -d 로 MinIO 가동 후 재시도하세요.",
      );
      throw err;
    }
  }

  console.log(`[seed] inserting ${samples.length} news samples...`);
  for (const sample of samples) {
    const coverMeta = sample.coverFile
      ? (coverMetaByFile.get(sample.coverFile) ?? null)
      : null;
    const coverImageUrl = coverMeta?.url ?? null;
    const [inserted] = await db
      .insert(news)
      .values({
        title: sample.title,
        body: buildBody(
          sample.paragraphs,
          sample.bodyImage ? coverImageUrl : null,
        ),
        categoryId: categoryIdBySlug.get(sample.category)!,
        coverImageUrl,
        coverImageWidth: coverMeta?.width ?? null,
        coverImageHeight: coverMeta?.height ?? null,
        publishedAt: sample.publishedAt,
        storySlot: sample.storySlot ?? null,
        featuredRank: sample.featuredRank ?? null,
        heroRank: sample.heroRank ?? null,
        createdBy: admin.id,
      })
      .returning();

    if (sample.tags.length > 0) {
      await db.insert(newsTags).values(
        sample.tags.map((tag) => ({ newsId: inserted.id, tag })),
      );
    }
  }

  console.log(`[seed] inserting ${noticeSamples.length} notice samples...`);
  let noticeAttachmentCount = 0;
  for (const notice of noticeSamples) {
    await db.insert(notices).values({
      id: notice.id,
      title: notice.title,
      body: buildBody(notice.paragraphs),
      publishedAt: notice.publishedAt,
      createdBy: admin.id,
    });
    for (const [i, filename] of (notice.attachmentFiles ?? []).entries()) {
      const key = await uploadNoticeSeedPdf(notice.id, filename);
      await db.insert(noticeAttachments).values({
        noticeId: notice.id,
        fileName: filename,
        key,
        mime: "application/pdf",
        size: MINIMAL_PDF.length,
        sortOrder: i,
      });
      noticeAttachmentCount += 1;
    }
  }

  const tagCount = samples.reduce((sum, s) => sum + s.tags.length, 0);
  const coverCount = [...coverMetaByFile.values()].filter(Boolean).length;
  console.log(
    `[seed] done. admin: ${adminEmail} / news ${samples.length}건 (커버 ${coverCount}) + 태그 ${tagCount}건 / story 슬롯 2 · featured 6 · hero 4 배정 / 공지 ${noticeSamples.length}건 (첨부 ${noticeAttachmentCount})`,
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
