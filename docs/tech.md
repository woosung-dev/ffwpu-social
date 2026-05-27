<!-- 기술 스택·아키텍처·데이터 모델·API. 1차 런칭 범위 기준 -->

# Tech — 기술 스택 / 아키텍처

> 1차 런칭(v1.0) 기준. 결정 이력은 `docs/decisions.md` ADR 모음 참조.

## 스택 (확정)

| 영역 | 선택 | 이유 / ADR |
|---|---|---|
| 프레임워크 | **Next.js 16** (App Router) | ADR-001 |
| 언어 | TypeScript Strict | ADR-001 |
| 스타일링 | Tailwind v4 + shadcn/ui v4 | ADR-001 |
| ORM | **Drizzle** + drizzle-kit + drizzle-zod (`strict: true`) | ADR-001b |
| DB (로컬) | **Docker Compose Postgres 16-alpine** | ADR-020 |
| DB (배포) | Neon 또는 AWS RDS (런칭 직전 결정) | ADR-020 |
| Storage (로컬) | **MinIO Docker** (S3 호환) | ADR-020 |
| Storage (배포) | Cloudflare R2 또는 AWS S3 | ADR-020 |
| Auth | **NextAuth.js v5** (Credentials Provider, super 단일 계정) | ADR-020 |
| DB 드라이버 | `pg` (node-postgres) | 로컬·배포 양쪽 호환 |
| 어드민 (CMS) | 자체 어드민 UI (Tiptap rich text) | 5일 데드라인, 단일 super |
| 호스팅 | **1단계 Vercel + 2단계 AWS** | ADR-014, ADR-019 |
| Edge 기능 | 사용 안 함, Node Runtime (`proxy.ts`) | ADR-019 |
| Cache | `"use cache"` + cacheLife/cacheTag | Next 16 stable |
| Form | react-hook-form + zod v4 | 스타터팩 |
| 패스워드 해시 | bcryptjs | NextAuth Credentials |
| 분석 | 도입 보류 (ADR-011) | |
| Next 설정 | `output: 'standalone'` | ADR-001a |

## 도메인 아키텍처 — 옵션 2 서브도메인 (ADR-023)

| 영역 | 호스트 | 라우트 |
|---|---|---|
| 사용자 페이지 | `<main-domain>` | `/`, `/news`, `/news/[id]` |
| 어드민 | `admin.<main-domain>` | `/admin`, `/admin/news`, `/admin/login` 등 |

**구현 방안 A**: 단일 Next.js 앱 + `proxy.ts` hostname 분기. 폴더 구조 분리 없음.

- 로컬 개발: `localhost:3000`에서 양쪽 모두 접근. 또는 `/etc/hosts`에 `127.0.0.1 admin.localhost` 추가하여 서브도메인 동작 테스트.
- 도메인 확정 후 (D-1) `proxy.ts`에 host 분기 추가 + NextAuth `AUTH_URL` 어드민 호스트 + 쿠키 domain `.<main>` wildcard.
- 검색엔진 차단 — `public/robots.txt`에 `Disallow: /admin/` + `<meta name="robots" content="noindex,nofollow">` (어드민 layout).

상세 트레이드오프·업계 사례·v2 옵션 3 전환 경로는 ADR-023 참조.

## 핵심 제약 (의도서 §7 — 비기능)

- **운영 자율성**: 콘텐츠 업데이트가 개발자 개입 없이 가능 → 자체 어드민 UI
- **WCAG AA**: 색 대비, 키보드 네비, alt 텍스트, 본문 16px+
- **모바일 3G 환경 메인 3초 내**: 이미지 최적화, lazy loading, SSG/캐시
- **SEO 기본**: 시맨틱 HTML, 메타, Open Graph
- **반응형 4 브레이크포인트**: `docs/design.md` 참조
- **개인정보 보호**: 어드민 권한·audit_logs 보존
- **재정 투명성 (v2 이월)**: 1차에는 KPI 시계열 미구현, v1.1에 도입
- **2027~2028 확장 가능 구조**: enum·스키마 마이그레이션 친화

## 아키텍처 개요

```
[Visitor — 익명]
  → / (랜딩, 스크롤스파이 6 섹션 + KpiSection 정적값)
  → /news (목록, 카테고리 필터 + 페이지네이션)
  → /news/[id] (상세, 본문 + 소셜 공유 + 익명 좋아요)
  → POST /api/heart  (익명 좋아요 토글, IP+세션)

[Admin — super 단일]
  → /admin/login (NextAuth Credentials)
  → /admin (대시보드, 최근 글)
  → /admin/news (목록·필터)
  → /admin/news/new (글 작성, Tiptap + 이미지 업로드)
  → /admin/news/[id]/edit (글 수정)
  → (모든 mutation → audit_logs 자동 기록)
```

## 폴더 구조 — Route Groups + FSD Lite (fullstack.md §10 + ADR-023)

```
src/
├── app/
│   ├── layout.tsx                    # 루트 — <html lang="ko"><body> 최소
│   ├── globals.css
│   ├── not-found.tsx
│   │
│   ├── (public)/                     # Route Group — URL에 안 나옴
│   │   ├── layout.tsx                # <PublicHeader/> + main + <PublicFooter/>
│   │   ├── page.tsx                  # /  (랜딩 6 섹션)
│   │   └── news/
│   │       ├── page.tsx              # /news 목록
│   │       └── [id]/page.tsx         # /news/[id] 상세
│   │
│   ├── admin/                        # /admin 경로 — 어드민 서브도메인에도 라우팅
│   │   ├── (auth)/                   # 로그인 전 — Sidebar 없음
│   │   │   ├── layout.tsx            # 중앙 카드 단독 layout (noindex meta 포함)
│   │   │   └── login/page.tsx        # /admin/login
│   │   └── (panel)/                  # 로그인 후 — Sidebar 있음
│   │       ├── layout.tsx            # <AdminSidebar/> + content (noindex meta)
│   │       ├── page.tsx              # /admin (대시보드)
│   │       └── news/
│   │           ├── page.tsx          # /admin/news
│   │           ├── new/page.tsx
│   │           └── [id]/edit/page.tsx
│   │
│   └── api/
│       ├── auth/[...nextauth]/route.ts  # NextAuth
│       └── heart/route.ts               # 익명 좋아요 토글
│
├── auth.ts                           # NextAuth v5 config
├── proxy.ts                          # /admin 보호 + (D-1) hostname 분기
│
├── components/
│   ├── ui/                           # shadcn/ui (직접 수정 금지)
│   └── layout/                       # 앱 전역 layout 컴포넌트
│       ├── PublicHeader.tsx          # 스크롤스파이 4메뉴 + 반응형 4 BP
│       ├── PublicFooter.tsx          # 다크 카피라이트
│       ├── Banner.tsx                # 공통 Sow Good 안내 띠
│       └── AdminSidebar.tsx          # 어드민 좌측 네비
│
├── features/
│   └── news/
│       ├── actions.ts                # Server Actions
│       ├── service.ts                # 비즈니스 로직 (db ❌)
│       ├── db.ts                     # Drizzle 쿼리 전담 (DAL)
│       ├── schemas.ts                # Zod + drizzle-zod 브릿지
│       └── components/
│           ├── ArticleCard.tsx       # 공개·어드민 양쪽 사용
│           ├── FeaturedStoryCard.tsx
│           ├── StoryCard.tsx
│           ├── Heart.tsx             # Client (익명 좋아요)
│           ├── CategoryTabs.tsx
│           ├── Pagination.tsx
│           ├── KpiCard.tsx
│           └── admin/                # 어드민 전용 (Tiptap·업로더·폼)
│               ├── NewsEditor.tsx
│               ├── ImageUploader.tsx
│               └── NewsForm.tsx
│
├── db/
│   ├── index.ts                      # Drizzle 클라이언트
│   ├── schema/                       # 5 테이블 (ADR-022)
│   └── seed.ts                       # admin + 9 news 시드
│
├── lib/                              # ipHash, image url, dayjs formatters
├── hooks/                            # useScrollSpy 등 공용
└── types/                            # next-auth.d.ts 등 augmentation

drizzle/                              # 마이그레이션 SQL
drizzle.config.ts
docker-compose.yml                    # postgres + minio
public/
  robots.txt                          # Disallow: /admin/ (D-1 추가)
```

### 핵심 폴더 선택 이유

- **`app/(public)/` Route Group**: URL에 `(public)` 안 나옴. PublicHeader/Footer layout 깨끗 분리.
- **`app/admin/(auth)/` + `(panel)/`**: `/admin/login`만 Sidebar 없이, 나머지 `/admin/*`은 Sidebar. **`app/admin/layout.tsx`를 두지 않음** — 두면 login에도 Sidebar 강제 적용됨.
- **`features/news/components/` + `components/admin/` 서브폴더**: 공용(ArticleCard) vs 어드민 전용(NewsEditor) 분리. 같은 도메인 안에서 격리.
- **`components/layout/`** 글로벌: layout 컴포넌트는 도메인 무관, 여러 페이지 공유.
- **`/api/heart/route.ts`**: 익명 좋아요는 Server Action 대신 Route Handler — IP 추출 + 쿠키 세션 처리 (ADR-010).

## 데이터 모델 — 1차 런칭 5 테이블 (ADR-022)

> 의도서 §5 기반의 옛 모델(stories/kpi_snapshots/partners/regions/partnership_inquiries)은 ADR-006으로 폐기. 1차 런칭은 게시판 1개 도메인만.

### `news` — 소식

| 필드 | 타입 | 제약 | 비고 |
|---|---|---|---|
| `id` | uuid | PK, defaultRandom | |
| `title` | text | not null | |
| `body` | jsonb | not null | Tiptap doc |
| `category` | `news_category` enum | not null | 5값 고정 |
| `cover_image_url` | text | nullable | MinIO/R2 URL |
| `published_at` | timestamp | nullable | 예약 발행 |
| `created_at` / `updated_at` | timestamp | not null | |
| `created_by` | uuid | FK users.id, ON DELETE SET NULL | |

`news_category` enum: `all` / `family_healing` / `local_volunteer` / `environment` / `rice_sharing`

### `news_tags` — 자유 입력 태그(다대다)

| 필드 | 타입 | 비고 |
|---|---|---|
| `news_id` | uuid | FK news.id, ON DELETE CASCADE |
| `tag` | text | not null |

복합 PK `(news_id, tag)`. 태그 enum 없음 — 자유 입력 (ADR-007 정의 enum 없으므로 데이터 모델 도입 안 함 원칙의 *예외* — 자유 입력은 그 자체로 enum 아님).

### `heart_events` — 익명 좋아요 (ADR-010)

| 필드 | 타입 | 비고 |
|---|---|---|
| `id` | uuid | PK |
| `news_id` | uuid | FK news.id, CASCADE |
| `ip_hash` | text | not null |
| `session_id` | text | not null |
| `created_at` | timestamp | not null |
| `deleted_at` | timestamp | nullable (soft delete = 취소) |

Unique index `uniq_heart` ON `(news_id, ip_hash, session_id)` — 1회 토글. 재누름은 soft delete, 다시 누름은 `deleted_at = null` 갱신.

활성 좋아요 카운트: `count(*) WHERE deleted_at IS NULL`.

### `users` — 어드민 (ADR-012, 1차는 super 단일 — ADR-016)

| 필드 | 타입 | 비고 |
|---|---|---|
| `id` | uuid | PK |
| `email` | text | unique, not null |
| `name` | text | not null |
| `role` | text(enum: super/editor/viewer) | default 'super' |
| `password_hash` | text | bcrypt |
| `created_at` | timestamp | not null |

회원가입(self-signup) 없음. v1.1에서 super가 editor/viewer 계정 생성.

### `audit_logs` — 변경 이력 (ADR-002, 의도서 §7.3)

| 필드 | 타입 | 비고 |
|---|---|---|
| `id` | uuid | PK |
| `actor_user_id` | uuid | FK users.id, ON DELETE SET NULL |
| `entity` | text | 'news' 등 동적 |
| `entity_id` | uuid | 동적 (FK 없음) |
| `action` | text(enum: create/update/delete/publish) | |
| `diff` | jsonb | 변경 전후 |
| `created_at` | timestamp | not null |

### v2 백로그 (ADR-006으로 1차 폐기)

`stories`(임팩트 스토리 풀 모델 — 동의 워크플로우) · `kpi_snapshots`(투명성 KPI 시계열) · `partners` / `partner_cases` · `regions` · `partnership_inquiries`. v1.1 이후 단계적 재도입 검토.

## API 엔드포인트 — 1차 런칭

### 공개 (Server Component 직접 호출 우선, Route Handler 최소)

| 메서드 | 경로 | 용도 | 구현 위치 |
|---|---|---|---|
| (Server Component) | `app/(public)/page.tsx` | 랜딩 — KpiSection·ArticleGrid `service.listNews()` 직접 호출 | features/news/service.ts |
| (Server Component) | `app/(public)/news/page.tsx` | 소식 목록 | features/news/service.ts |
| (Server Component) | `app/(public)/news/[id]/page.tsx` | 소식 상세 | features/news/service.ts |
| POST | `/api/heart` | 익명 좋아요 토글 (IP hash + session cookie) | app/api/heart/route.ts |

### 어드민 (인증 필요 — `proxy.ts`가 /admin 보호)

| 메서드 | 경로 | 용도 |
|---|---|---|
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handlers |
| Server Action | `createNewsAction` | 글 생성 (Tiptap JSON + 이미지 업로드) |
| Server Action | `updateNewsAction` | 글 수정 |
| Server Action | `deleteNewsAction` | 글 삭제 (audit_logs 기록) |
| Server Action | `uploadImageAction` | 본문 이미지 → MinIO/R2 presigned upload |

> 자체 UI mutation은 모두 Server Action(`features/news/actions.ts`). Route Handler는 외부 연동(웹훅·외부 클라이언트)·파일 업로드 전용.

## 캐싱 전략 (fullstack.md §7)

- 랜딩·소식 목록·상세 → `"use cache"` + `cacheTag('news')` + `cacheTag('news:<id>')`
- 글 생성/수정/삭제 시 → `revalidateTag('news')`, 상세는 `revalidateTag('news:<id>')`
- 캐싱은 **service.ts** 레이어에서만. db.ts에서는 금지.
- 익명 좋아요는 캐시 미사용 (실시간성 우선) — 카운트는 클라이언트 fetch.

## 성능 전략

- 랜딩: Server Component + `"use cache"` (분 단위 invalidation)
- 이미지: Next.js Image + `remotePatterns`(localhost:9000, *.r2, *.s3)
- 본문 jsonb는 Tiptap doc — 직렬화/렌더 비용 작음
- Drizzle relations 쿼리(`db.query.X.findMany({ with: {...} })`) — N+1 방지

## 배포·호스팅 전략

- 환경: local(Docker) → staging(Vercel preview) → production(Vercel)
- 도메인: TBD (사회공헌국 회신 대기)
- CI: GitHub Actions (lint + tsc + build) — D-1 셋업
- 시크릿: Vercel Dashboard (배포 시 import)
- 백업: 1단계는 Neon/RDS 자동 백업 + audit_logs 시계열 보존
- 2단계 AWS 이전(ADR-019): `output: 'standalone'` Docker 이미지 → ECS Fargate 또는 EC2
