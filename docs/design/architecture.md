<!-- 공개 프레젠테이션 레이어 컴포넌트 아키텍처 (Phase 2) — 5-레이어 분류·중복제거·컴포넌트 API·Server/Client 경계 -->

# Component Architecture (Phase 2)

> 작성 2026-06-04 · 그린필드 재구현 대상 = **프레젠테이션 레이어**. 데이터/서버/라우팅/인증은 보존(audit-report §PRESERVE).
> 원칙: ① 토큰 우선(raw hex 0) ② shadcn `Button`/`Card` 를 base 로 ③ 적은 수의 파라미터화 컴포넌트(near-dup 금지) ④ RSC 기본, client 는 인터랙티브 리프만 ⑤ ADR-024 배치 준수.

## 1. 5-레이어 분류

범례: **S/C** = Server/Client · ★NEW = 신규/추출 · =유지 · →이동/리네임.

### L1 Primitive (shadcn + 토큰)
| 컴포넌트 | 경로 | S/C | 역할 |
|---|---|---|---|
| Design tokens | `src/app/globals.css` `@theme inline` | — | 색·radius·폰트·`--breakpoint-wide` SSoT |
| `Button`+`buttonVariants` | `components/ui/button.tsx` | S | 모든 CTA base (brandDark/brandVivid variant 추가) |
| `Card`,`Carousel`,`DropdownMenu`,`Dialog`,`Input`,`Select`,`Form`,`Label`,`Switch`,`Separator`,`Sonner` | `components/ui/*` | mixed | shadcn 12 — 직접수정 금지, 래핑 확장 |

### L2 Shared (도메인 무관 재사용)
| 컴포넌트 | 경로 | S/C | 역할 |
|---|---|---|---|
| `SectionContainer` =유지 | `client/components/layout/` | S | 1200 콘텐츠 + BP gutter |
| `Section` ★NEW(선택) | `client/components/layout/` | S | bg+수직리듬+`id` 앵커 래퍼 |
| `SectionHeading` ★NEW | `client/components/layout/` | S | eyebrow+title+desc(구조만, px 는 override) |
| `CtaButton` ★NEW | `client/components/ui/` | S | shadcn Button 래핑, brand variant+화살표 |
| `Tag` ★NEW | `client/components/ui/` | S | `variant=solid\|hashtag` |
| `MediaCard` ★(StoryCard 리네임) | `client/components/media/` | S | 이미지 fill+그라디언트 오버레이 카드 |
| `StatList` ★NEW | `client/components/` | S | Result 통계 가로 N열+세로 구분선 |
| `ScrollTopButton` →이동 | `client/components/` | C | floating 위로가기(크로스 페이지) |
| `SowGoodFooterLogo` =유지 | `client/components/icons/` | S | Footer BI 로고 |

### L3 Feature (도메인 종속)
| 컴포넌트 | 경로 | S/C | 역할 |
|---|---|---|---|
| `HeroBanner`·`KpiSection`·`StorySection`·`ArticleGridSection`·`PartnersSection` =유지 | `client/sections/` | S | 랜딩 5섹션 |
| `KpiCard` ★추출 | `client/sections/kpi/` | S | KPI 단일 타일 |
| `SubBanner` →이동 | `client/sections/news/` | S | 소식 인트로 배너(목록·상세 공통) |
| `ArticleCard` =유지(슬림) | `features/news/components/` | S | 정보카드(관련글 흡수, `state` 제거) |
| `MediaCard` ← StoryCard | (L2 로 승격) | S | (위) |
| `NewsFeaturedSlider` ←FeaturedStoryCard | `features/news/components/` | C | 피처드 탭 슬라이더 |
| `Heart` =유지 | `features/news/components/` | C | 익명 좋아요(optimistic) |
| `CategoryTabs` =유지 | `features/news/components/` | C | 카테고리 필터(≤767 가로스크롤) |
| `Pagination` =유지 | `features/news/components/` | C | 페이지 네비 |
| `ShareRow` →이동 | `features/news/components/` | C | 공유(native share+copy) |
| `DetailHeader` ★추출 | `features/news/components/` | S | 카테고리칩+제목+날짜+Heart |
| `PrevNextNav` ★추출 | `features/news/components/` | S | 목록/이전/다음 |
| `NewsBodyRenderer` =유지 | `features/news/render/` | S | Tiptap JSON→React(sanitized) |

### L4 Layout
| 컴포넌트 | 경로 | S/C | 역할 |
|---|---|---|---|
| `PublicHeader`(+`HeaderNav`/`MobileSectionMenu` ★추출) | `client/layouts/` | C | sticky·scrollspy·드롭다운 |
| `PublicFooter` =유지 | `client/layouts/` | S | 로고+카피라이트 |
| `PublicLayout` =유지 | `app/(public)/layout.tsx` | S | Header+main+Footer+QueryProvider |

### L5 Page (라우트 진입 — `app/` 고정)
| 컴포넌트 | 경로 | S/C | 역할 |
|---|---|---|---|
| 랜딩 | `app/(public)/page.tsx` | S | 5섹션 + `*WithData` fetcher |
| 소식 목록 | `app/(public)/news/page.tsx` (+`news-list-client` C·`news-filters` C·`news-hero` S) | S/C | prefetch+HydrationBoundary |
| 소식 상세 | `app/(public)/news/[id]/page.tsx` (+`detail-heart` C) | S/C | 상세 조합 |

## 2. 중복 제거 맵

| 결정 | 내용 |
|---|---|
| **카드 = 2개** | `ArticleCard`(정보카드, `[id]` 인라인 관련글 흡수·`state` 제거) + `MediaCard`(오버레이, =StoryCard). 둘은 레이아웃 근본 상이 → 통합 안 함 |
| **CtaButton 1개** | Hero(`brandDark`)·Featured(`brandVivid`)·ArticleGrid(text) → `buttonVariants` 확장 + `withArrow`. 화살표 에셋 1개 |
| **Tag 1개** | solid/hashtag 2 variant, `--color-tag-*` 토큰 |
| **SectionHeading** | 5 섹션 h2 구조 정규화(px 는 `titleClassName`) |
| **KpiCard 추출** | KpiSection 인라인 ~8 → 1 컴포넌트 |
| **이미 정합** | Banner=SubBanner 1개, Header/Footer instance 1개 |

## 3. 핵심 공유 컴포넌트 API

```ts
// CtaButton (L2·S) — shadcn Button 래핑
type CtaButtonProps = { href: string; children: ReactNode;
  variant?: "brandDark" | "brandVivid"; size?: "md" | "lg";
  withArrow?: boolean; className?: string };

// ArticleCard (L3·S) — heartCount 없으면 Heart 미렌더(관련글 재사용 무료)
type ArticleLite = { id: string; title: string; categoryName: string;
  coverImageUrl: string | null; publishedAt: Date | string | null; heartCount?: number };
type ArticleCardProps = { size?: 1|2|3|4; article: ArticleLite; className?: string };
//  ※ state prop 제거. SIZE_CONFIG(max-w+aspect) 유지. coverImageUrl==null → placeholder 내부.

// MediaCard (L2·S) — StoryCard 리네임. aspect 는 caller className 주입(마조네리)
type MediaCardProps = { href?: string; imageUrl?: string | null;
  title: string; subtitle?: string; className?: string };

// Tag (L2·S)
type TagProps = { variant?: "solid" | "hashtag"; tone?: "dark" | "vivid";
  children: string; className?: string };

// SectionHeading (L2·S)
type SectionHeadingProps = { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode;
  align?: "start"|"center"|"end"; as?: "h1"|"h2"; titleClassName?: string; className?: string };

// Heart (L3·C) — 계약 동결(optimistic 상태머신 보존, 스타일만 재작성)
type HeartProps = { count: number; initialActive?: boolean;
  onToggleAction?: (next: boolean) => Promise<{ liked: boolean; count: number } | void> | void;
  compact?: boolean; interactive?: boolean };

// Pagination (L3·C) — 계약 동결
type PaginationProps = { page: number; totalPages: number;
  hrefForAction?: (page: number) => string; onPageChangeAction?: (page: number) => void };
```

> **shadcn base 판단**: `CtaButton`→Button(O). `ArticleCard`/`MediaCard`→Card(X, 기본 border/shadow/py 가 미디어카드와 충돌). Card 는 admin 유지.

## 4. 폴더·배럴 (ADR-024)

```
app/(public)/            # L5 routes only
  layout.tsx, page.tsx, news/{page,news-list-client,news-filters,news-hero}.tsx, news/[id]/{page,detail-heart}.tsx
client/
  layouts/{PublicHeader,PublicFooter}.tsx + header/{HeaderNav,MobileSectionMenu}.tsx + index.ts
  sections/{HeroBanner,KpiSection,StorySection,ArticleGridSection,PartnersSection}.tsx
          + kpi/KpiCard.tsx + news/SubBanner.tsx + index.ts
  components/ layout/{SectionContainer,Section,SectionHeading} · ui/{CtaButton,Tag}
             · media/MediaCard · StatList · ScrollTopButton · icons/ (+ 폴더별 index.ts)
  hooks/useScrollSpy.ts · providers/QueryProvider.tsx(보존) · lib/anon-session.ts(보존)
features/news/
  components/{ArticleCard,Media(X→client/media),NewsFeaturedSlider,Heart,CategoryTabs,Pagination,ShareRow,DetailHeader,PrevNextNav}.tsx + index.ts(client-safe)
  render/news-body-renderer.tsx · {actions,service,db,schemas,api,constants}.ts(보존) · index.ts(server-only)
components/ui/   # shadcn — button.tsx 만 brand variant 추가
```

**배럴 규칙(핵심·보존)** — `features/news/index.ts`=`server-only`(actions/service/schemas), `features/news/components/index.ts`=client-safe(컴포넌트+타입 `ArticleLite`/`FeaturedStory`/`CategoryTabItem`). **두 배럴 분리 유지**(client 번들에 server-only 유입 차단). client 컴포넌트는 `components`/`constants`/`api.ts` 만 import.

## 5. Server/Client 경계

**`"use client"` (인터랙티브 리프만, 8개)** — `Heart`(+`detail-heart` 래퍼)·`NewsFeaturedSlider`·`PublicHeader`(+`HeaderNav`/`MobileSectionMenu`)·`CategoryTabs`/`news-filters`·`ScrollTopButton`·`ShareRow`·`news-list-client`·`Pagination`.

**Server (나머지 전부)** — 5 랜딩 섹션·`KpiCard`·`StatList`·`ArticleCard`·`MediaCard`·`SubBanner`·`PublicFooter`·`SectionContainer`/`Section`/`SectionHeading`·`CtaButton`·`Tag`·`NewsBodyRenderer`·`DetailHeader`·`PrevNextNav`·전 `page.tsx`+`*WithData`.

**불변 규칙** — ① Server→Client import 가능, 역방향 금지. ② `ArticleCard`(S)가 `Heart`(C) 자식 품는 캐노니컬 패턴 유지. ③ `PublicHeader` 는 `layout.tsx` 에서 `<Suspense>` 래핑(`usePathname` dynamic·cacheComponents) 보존. ④ client 는 `data` 만 prop(부모 Suspense/ErrorBoundary 위임, `isLoading` 금지 — fullstack §4).

## 6. 구현 순서 (Phase 3)
S1 토큰 → S2 Primitive/Shared/카드(계약 동결) → S3 Layout → S4 랜딩 → S5 소식목록 → S6 소식상세+하트 → S7 검증/Difference Report. 각 Stage atomic commit + 게이트(`tsc`/`lint`/`test`/`build`).
