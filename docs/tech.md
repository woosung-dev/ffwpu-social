<!-- 기술 스택·아키텍처·데이터 모델·API. 스택 확정 후 본격 채움 -->

# Tech — 기술 스택 / 아키텍처

> 스택 확정 전까지는 *후보와 제약*만 기록한다. 확정되면 `docs/decisions.md` ADR-001과 동기화한다.

## 스택 (확정 후 채움)

| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | **Next.js 16** (App Router) | ADR-001, 스타터팩 |
| 언어 | TypeScript Strict | ADR-001 |
| 스타일링 | Tailwind v4 + shadcn/ui v4 | ADR-001 |
| ORM | **Drizzle** + drizzle-kit + drizzle-zod | ADR-001 |
| DB | **PostgreSQL on Neon** | ADR-001 |
| Auth | **Clerk** (`@clerk/nextjs`) | ADR-001 |
| 어드민 (CMS) | **자체 어드민 UI** (Tiptap rich text) | 5일 데드라인, 단일 super 계정만 |
| Storage | **Cloudflare R2** (S3 호환) | ADR-001, egress 무료 |
| 호스팅 | **1단계 Vercel + 2단계 AWS** | ADR-014 |
| Edge 기능 | 사용 안 함, Node Runtime | ADR-019 |
| Cache | `"use cache"` + cacheLife/cacheTag | 스타터팩 (Next 16) |
| Middleware | `proxy.ts` (Node 전용) | 스타터팩 |
| Form | react-hook-form + zod v4 | 스타터팩 |
| 분석 | 도입 보류 (ADR-011) | |
| Next 설정 | `output: 'standalone'` | ADR-001a |

## 핵심 제약 (의도서 §7 — 비기능)

- **운영 자율성**: 콘텐츠·KPI 업데이트가 개발자 개입 없이 가능 → CMS·관리자 UI 우선
- **WCAG AA**: 색 대비, 키보드 네비, alt 텍스트, 본문 16px+
- **모바일 3G 환경 메인 3초 내**: 이미지 최적화, lazy loading, SSG/CDN 활용
- **SEO 기본**: 시맨틱 HTML, 메타, Open Graph
- **반응형 4 브레이크포인트** (`docs/design.md`)
- **개인정보 보호**: 동의 워크플로우 + 모자이크/가명 옵션 + 권한 관리
- **재정 투명성**: 과거 KPI 데이터 *삭제 금지*, 시계열 보존
- **2027~2028 확장 가능 구조**

## 아키텍처 개요

```
(스택 확정 후 다이어그램 보강)

[Visitor]
  → [Web] (정적 페이지 + 동적 콘텐츠 + 차트)
      → [공개 API] (스토리·리포트·파트너 조회)
      → [폼 처리] (파트너십 문의 → 이메일/저장)

[Admin]
  → [Auth] (운영자/관리자 권한 분리)
  → [Admin UI]
      → 임팩트 스토리 CRUD (rich text + 이미지 + 동의 워크플로우)
      → 투명성 KPI 입력 (분기별, 시계열 누적)
      → 파트너 CRUD
      → 권역·태그 마스터 관리
```

## 폴더 구조 컨벤션 (확정 후 채움)

```
(예시 — 스택 확정 시 교체)
src/
  app/         # 라우트
  components/  # 재사용 UI
  features/    # 도메인별 (stories, reports, partners, regions, contact)
  lib/         # 유틸 (a11y 헬퍼, 차트 래퍼 등)
content/       # (Headless CMS 채택 시) 콘텐츠 스키마
```

## 데이터 모델 (초안)

> 모든 모델은 `created_at` / `updated_at` 기본 보유 가정. 모든 외부 노출은 *분기 단위* 또는 *시점 단위*로 변경 이력 보존.

### `stories` — 임팩트 스토리

| 필드 | 타입 | 제약 | 비고 |
|---|---|---|---|
| `id` | uuid | PK | |
| `title` | string(200) | not null | |
| `body` | jsonb (rich text 블록) | not null | 텍스트/이미지/변화전후/인용 블록 |
| `cover_image_url` | string | nullable | |
| `published_at` | timestamp | nullable | 예약 발행 지원 여부 TBD |
| `region` | string / FK to `regions` | nullable | 권역·지역 |
| `participants_count` | int | nullable | |
| `satisfaction_score` | int | nullable | |
| `consent_status` | enum | not null | `consented` / `pending` / `anonymized` |
| `privacy_options` | jsonb | nullable | `{face_mosaic: bool, pseudonym: bool}` |
| `created_by` | FK users | | 어드민 사용자 |

### `story_categories` — 임팩트 스토리 다대다 카테고리

스토리 1개가 카테고리 복수 보유 가능.

| 필드 | 타입 | 비고 |
|---|---|---|
| `story_id` | FK | |
| `category` | enum | `family_healing` / `local_volunteer` / `environment` |

### `kpi_snapshots` — 투명성 리포트 KPI

분기별 스냅샷 누적. **삭제 금지**(과거 데이터 아카이브 — 의도서 §7.4).

| 필드 | 타입 | 비고 |
|---|---|---|
| `id` | uuid | PK |
| `period_year` | int | |
| `period_quarter` | int (1~4) | |
| `metric` | enum | `volunteer_sessions` / `volunteer_participants` / `regional_activity` / `budget_execution` / `counseling_programs` |
| `dimension` | jsonb | 권역·분야 등 추가 차원 |
| `value` | numeric | |
| `unit` | string | "회", "명", "원", "%" 등 |
| `last_updated_at` | timestamp | UI에 노출 |
| `note` | text | 출처·메모 |

### `partners` — 파트너 기관/기업

| 필드 | 타입 | 비고 |
|---|---|---|
| `id` | uuid | PK |
| `name` | string | |
| `logo_url` | string | |
| `category` | enum | 비영리 / 외교기관 / 교육재단 / 사회복지법인 / 지역재단 / 기업CSR ... (확장 가능) |
| `summary` | text | |
| `joined_at` | date | |

### `partner_cases` — 파트너 협업 사례

| 필드 | 타입 | 비고 |
|---|---|---|
| `id` | uuid | PK |
| `partner_id` | FK | |
| `title` | string | |
| `body` | jsonb | |
| `published_at` | timestamp | |

### `regions` — 권역·지역 마스터

| 필드 | 타입 | 비고 |
|---|---|---|
| `id` | uuid | PK |
| `name` | string | "서울", "경기" 등 |
| `parent_id` | FK | 권역 → 지역 계층 |

### `partnership_inquiries` — 파트너십 문의

| 필드 | 타입 | 제약 | 비고 |
|---|---|---|---|
| `id` | uuid | PK | |
| `organization` | string | not null | |
| `contact_name` | string | not null | |
| `email` | string | not null | |
| `proposal_area` | string | nullable | |
| `message` | text | not null | |
| `consent_at` | timestamp | not null | 개인정보 동의 시각 |

### `users` — 어드민 사용자 (ADR-012 — 3단계 권한)

| 필드 | 타입 | 비고 |
|---|---|---|
| `id` | uuid | PK |
| `email` | string | |
| `name` | string | |
| `role` | enum | `super` / `editor` / `viewer` |
| `org_unit` | string | "사회공헌국" / "문화홍보국" 등 |
| `created_by` | FK users | 슈퍼만 계정 생성 가능 |

회원가입(self-signup) 없음. super가 계정 직접 생성.

### `audit_logs` — 변경 이력

개인정보 민감 영역 대응.

| 필드 | 타입 | 비고 |
|---|---|---|
| `id` | uuid | PK |
| `actor_user_id` | FK | |
| `entity` | string | `stories`, `kpi_snapshots` 등 |
| `entity_id` | uuid | |
| `action` | enum | `create` / `update` / `delete` / `publish` |
| `diff` | jsonb | |
| `created_at` | timestamp | |

## API 엔드포인트 (초안)

### 공개 API

| 메서드 | 경로 | 용도 |
|---|---|---|
| GET | `/api/stories` | 목록 (카테고리·권역 필터, 페이징) |
| GET | `/api/stories/:id` | 단건 |
| GET | `/api/reports/kpi` | 최신 분기 KPI (다양한 metric) |
| GET | `/api/reports/kpi/series?metric=&from=&to=` | 시계열 |
| GET | `/api/reports/download.csv` | 원본 다운로드 (제공 시) |
| GET | `/api/partners` | 목록 |
| GET | `/api/partners/:id` | 단건 (사례 포함) |
| GET | `/api/regions` | 권역·지역 마스터 |
| POST | `/api/inquiries/partnership` | 파트너십 문의 (rate limit) |

### 어드민 API (인증 필요)

| 메서드 | 경로 | 용도 |
|---|---|---|
| POST/PATCH/DELETE | `/admin/api/stories[/...]` | 스토리 CRUD + 동의 워크플로우 |
| POST | `/admin/api/stories/:id/anonymize` | 모자이크/가명 일괄 적용 |
| POST/PATCH | `/admin/api/kpi-snapshots[/...]` | KPI 입력 (DELETE는 금지 또는 audit log 동반) |
| POST | `/admin/api/kpi-snapshots/import` | CSV 일괄 업로드 |
| POST/PATCH/DELETE | `/admin/api/partners[/...]` | 파트너 CRUD |
| POST | `/admin/api/auth/login` | 로그인 |
| GET | `/admin/api/audit-logs` | 감사 로그 |

## 성능 전략 (확정 후 보강)

- 정적 페이지(소개·메인 정적 부분)는 SSG/ISR
- 임팩트 스토리·파트너 카드 목록은 ISR 또는 캐시된 SSR
- 이미지: 적절한 포맷 변환·반응형 srcset, CDN
- 차트: 가능하면 서버에서 데이터 사전 가공, 클라이언트 번들 가볍게

## 배포·호스팅 전략 (확정 후 채움)

- 환경: dev / staging / production
- 도메인: TBD (`docs/current.md`)
- CI: TBD
- 시크릿 관리: TBD
- 백업: TBD (KPI 시계열 — 분기 단위 스냅샷도 별도 백업 권장)
