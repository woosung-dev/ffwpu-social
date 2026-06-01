<!-- ADR(Architecture Decision Records)을 한 파일에 시간 순으로 누적 -->

# Decisions — ADR 모음

큰 결정의 *왜*를 시간 순으로 기록한다. ADR 번호는 단조 증가. 한번 작성한 ADR은 수정하지 않고, 변경되면 새 ADR로 대체(Supersedes)한다.

## 템플릿

```markdown
## ADR-NNN: (제목)

- **Status**: Proposed / Accepted / Superseded by ADR-MMM
- **Date**: YYYY-MM-DD

### Context
(왜 이 결정을 해야 하는가. 어떤 제약·요구가 있는가)

### Decision
(무엇을 결정했는가)

### Consequences
(이 결정으로 얻는 것, 잃는 것, 향후 영향)
```

---

## ADR-000: 문서 골격 및 진실 공급원 정책

- **Status**: Accepted
- **Date**: 2026-05-26

### Context

사회공헌국 요청사항이 회차별로 변동되어 왔고, Figma는 완성도가 높음. 자료가 산발적이라 코드 작업이 옛 요청에 끌려갈 위험이 크다.

### Decision

- `docs/current.md`를 코드 결정의 단일 근거로 삼는다.
- `docs/source/`는 받은 원본 그대로 보존, 절대 수정 금지. 코드 결정의 근거로 쓰지 않는다.
- 디자인의 SSOT는 Figma. `docs/design.md`는 그 인덱스이자 추출본 역할.
- ADR은 폴더로 분산하지 않고 이 파일 한 곳에 시간 순으로 누적.

### Consequences

- 회차 변경이 와도 `current.md` 업데이트만 하면 코드 작업의 기준이 명확하다.
- 옛 요청을 근거로 코드를 짤 위험이 줄어든다.
- 단일 파일 ADR은 검색에 빠르지만, 파일이 길어지면 분할 필요 — 그 시점에 ADR을 추가해 분할한다.

---

## ADR-002: 운영 자율성은 1급 요구

- **Status**: Accepted
- **Date**: 2026-05-26

### Context

의도서 v1(2026-04-14) §7.6에 명시: **"콘텐츠 등록·수정·KPI 업데이트가 개발자 개입 없이 가능해야 한다. 2027·2028년에도 사회공헌국 인력이 스스로 운영할 수 있는 구조여야 한다."** 이전 가정("읽기 위주 + 간단 문의")은 무효.

### Decision

- 자체 어드민 UI 또는 Headless CMS를 도입하여 사회공헌국 운영자가 임팩트 스토리·KPI·파트너를 직접 등록·수정한다.
- 권한 최소 2단계(편집자/관리자)로 분리. 변경 이력(`audit_logs`) 보존.
- 어드민 UX 사용성 점검이 시범 운영(2단계)의 가장 중요한 검증 포인트.

### Consequences

- 단순 정적 사이트 + 폼 1개 가정보다 상당히 큰 시스템이 된다.
- 헤드리스 CMS 채택 시 자체 개발량 감소·운영 도구 풍부 vs 학습/커스터마이즈 비용.
- 자체 어드민 채택 시 일관성·통합 강함 vs 개발량 큼.
- 스택 결정(ADR-001)과 강하게 연동된다.

---

## ADR-003: KPI 시계열 데이터는 삭제 금지

- **Status**: Accepted
- **Date**: 2026-05-26

### Context

의도서 §7.4: "예산의 출처와 사용을 공개하는 것이 신뢰의 기반. 과거 데이터는 *삭제되지 않고 아카이브*되어야 한다." 또한 §10.2 성공 기준에 "언론·공직자가 1차 출처로 인용"이 명시됨 — 인용된 수치를 사후에 바꾸면 신뢰 훼손.

### Decision

- 투명성 KPI는 `kpi_snapshots` 테이블에 분기·지표·차원별 스냅샷으로 누적 저장.
- DELETE API 미제공. 수정 시 새 row 발행 + audit log 기록.
- 화면에 *마지막 업데이트 일자* 노출 의무.
- CSV/PDF 다운로드 제공 여부는 TBD이나 데이터 모델은 제공을 전제로 설계.

### Consequences

- 신뢰성 확보. 사후 데이터 위조 위험 차단.
- 어드민 UX에서 "삭제" 대신 "정정" 워크플로우 필요.
- 시계열 누적으로 DB 크기 증가 가능 — 분기 단위라 실질적으로는 미미.

---

## ADR-004: 정치 중립 / 포교 금지 / 개인정보 보호는 디자인·콘텐츠·코드 전반의 절대 제약

- **Status**: Accepted
- **Date**: 2026-05-26

### Context

의도서 §7.1~§7.3에 "필수(반드시 지켜야 함)"로 명시됨. 종교·정치·개인정보는 사회공헌단 사이트의 가장 큰 정성적 리스크 영역.

### Decision

- **정치 중립**: 카피·이미지·태그·향후 도입할 댓글 기능 모두 정치 뉘앙스 금지. PR 단위로 점검 항목 포함.
- **포교 금지**: 종교 상징 절제, 신앙 어휘는 일반 표현으로 번역. 메인·소개 페이지의 카피 검수 필수.
- **개인정보 보호**: 임팩트 스토리 콘텐츠 업로드 플로우에 ① 당사자 동의 확인 단계, ② 얼굴 모자이크 옵션, ③ 가명 처리 옵션이 *기본 옵션*으로 제공. 어드민 권한 분리, audit log 보존.

### Consequences

- 어드민 워크플로우가 더 복잡해진다 (동의 확인·익명화 단계 추가).
- 카피 작성 가이드 문서가 필요 (사회공헌국·문화홍보국과 합의).
- 정치·종교 뉘앙스는 자동 검출이 어렵기 때문에 *런칭 전 별도 카피 검수 라운드*가 필수.

---

## ADR-005: 의도서 정의와 Figma 가용 디자인의 차이는 Figma를 따른다

- **Status**: Accepted
- **Date**: 2026-05-26

### Context

의도서(2026-04-14)는 7개 페이지(메인/소개/임팩트/투명성/권역/파트너/참여)를 정의했으나, 2026-05-26 Figma 캔버스 확인 결과 실제 디자인된 페이지는 **2개**(홈, 소식)에 그침. 사회공헌국 답변: "Figma가 최종, 나머지 5개는 없는 것으로 추정(통합되었을 수도)". Figma 파일에 추가 페이지가 더 있을 가능성도 있음 — 사용자가 추가 공유 예정.

### Decision

- **Figma가 SSOT이라는 ADR-000 원칙을 재확인**. 의도서와 차이가 나면 Figma를 따른다.
- `docs/current.md` 사이트맵에 "디자인 상태" 컬럼을 도입하여 의도서 정의와 Figma 가용 사이의 갭을 가시화한다.
- 미디자인 5개 페이지는 코드 작업의 근거가 없으므로 *그대로 구현하지 않는다*. 처리 방침(추가 발주/메인 통합/범위 축소)은 `current.md` TBD로 분리해 사회공헌국과 합의 후 결정.
- 홈 페이지의 시안 2안 공존 상태는 사용자가 Figma에서 확정 후 노드 ID로 알려줄 때까지 양안 모두 design.md에 기록.

### Consequences

- 의도서를 근거로 5개 페이지를 "추측 구현"할 위험을 차단.
- 코드 범위가 의도서 가정(7개 페이지)보다 훨씬 작아질 수 있음. 또는 미디자인 페이지가 추가 디자인되면서 범위가 다시 커질 수 있음 — 둘 다 사회공헌국 결정.
- `current.md`·`design.md`에 "디자인 상태"가 명시되어 협업 시 혼동 감소.

---

## ADR-006: 의도서 IA 폐기, Figma 헤더 4메뉴를 IA 진실로 채택

- **Status**: Accepted (Supersedes 의도서 §5 콘텐츠 구조 정의 부분, ADR-005 일부 확장)
- **Date**: 2026-05-26

### Context

ADR-000으로 Figma를 SSOT로 정한 상태에서 Header 컴포넌트(`97:9431`) 추출 결과, 헤더 메뉴는 4개로 의도서 7페이지(메인/소개/임팩트 스토리/투명성 리포트/권역별 현황/파트너 스토리/참여하기)와 *완전히 다른 IA*임을 확인.

Figma 헤더 4메뉴:
1. 임팩트 데이터
2. 활동 스토리
3. 쌀 나눔 소식
4. 쌀나눔 프로젝트

또한 ArticleCard에 `쌀나눔`·`보도자료` 카테고리 태그가 있어, 사이트가 *"쌀 나눔" 캠페인 중심으로 재설계*된 것으로 보임. 사용자 확인: "의도서 무관하게 Figma가 완전히 새롭게 설계된 것".

### Decision

- 의도서 §5 "콘텐츠 구조" 정의(메인/소개/임팩트/투명성/권역/파트너/참여)는 **폐기**. 코드·데이터 모델·라우트 결정 근거로 사용하지 않음.
- 의도서 §6 톤앤매너·§7 절대 제약(정치 중립/포교 금지/개인정보/운영 자율성) **유지** — 이 부분은 IA와 무관한 운영 원칙.
- `docs/current.md` 사이트맵을 Figma 4메뉴 기준(+홈)으로 완전 교체.
- 의도서의 *임팩트 스토리, 투명성 KPI, 파트너 스토리* 데이터 모델(ADR-002·003 일부)은 **v2 백로그**로 분리. 현재는 게시판형 `news` 모델 우선.
- 의도서와 Figma의 메뉴 대응 관계를 추측하여 라벨을 매핑하지 **않는다** — 두 IA는 별개.

### Consequences

- 의도서 기반으로 추측한 코드(임팩트 스토리 카테고리·KPI 시계열·파트너 스키마 등)는 즉시 제거 또는 v2 백로그로 이관.
- `docs/tech.md` 데이터 모델 재정렬 필요 — `notices/articles` (게시판), `heart_counts` (좋아요) 우선. `kpi_snapshots`·`partners`·`stories`는 v2 보류.
- 1차 런칭 범위가 *훨씬 좁아짐* — "쌀 나눔" 캠페인 중심 사이트. 다만 4개 메뉴 중 3개가 미디자인이므로 현재 가용 디자인만으로는 "홈 + 쌀 나눔 소식"만 구현 가능.
- 의도서 §6·§7 원칙(톤앤매너·절대 제약)은 그대로 유효.

---

## ADR-007: Figma에 정의되지 않은 라벨·필드는 데이터 모델에 도입하지 않는다

- **Status**: Accepted
- **Date**: 2026-05-26

### Context

소식 상세 페이지의 "더 많은 소식 살펴보기" 관련 글 카드(`93:8868~70`)에서 `알려드립니다` 라벨이 보였음. 카테고리 탭(`125:9131`)의 5개(전체/가족치유/지역봉사/환경캠페인/쌀나눔)에는 없는 텍스트. 이를 6번째 카테고리로 추가하거나 별도 badge/label 필드로 처리할지 고민했음.

### Decision

- **Figma의 정의된 enum(카테고리 탭 5개)에 없는 라벨은 디자이너의 임시 더미로 간주**하고, 데이터 모델에 도입하지 않는다.
- 카테고리 enum은 5개 고정: `전체` / `가족 치유` / `지역 봉사` / `환경 캠페인` / `쌀 나눔`.
- 카드에 표시되는 라벨은 *카테고리 enum 값 중 하나만*. 별도 badge·label·secondary tag 필드 만들지 않는다.

### Consequences

- 시안의 더미 텍스트("알려드립니다", "보도자료" 등)에 끌려가 데이터 모델이 부풀려지는 위험 차단.
- ADR-000(Figma SSOT)·ADR-006(Figma IA 정답)을 *데이터 필드 수준*까지 일관 적용.
- 향후 디자이너가 새 enum 값을 추가하면(예: 카테고리 탭에 6번째 추가) 그때 데이터 모델에도 추가. *Figma 정의 변경 → 데이터 모델 변경* 순서 엄수.
- 동일 원칙으로 다른 더미 라벨(있다면 향후 발견)도 같은 방식으로 처리.

---

## ADR-008: 폰트 시스템 — SUIT 단일 (Pretendard는 디자인 실수)

- **Status**: Accepted
- **Date**: 2026-05-26

### Context

소식 목록의 페이지네이션 번호에 Pretendard Medium/Regular가 사용됨. 다른 모든 컴포넌트는 SUIT 6 weight + 히어로 슬로건만 Gmarket Sans Medium.

### Decision

- 코드에서는 **SUIT를 단일 본문 시스템**으로 사용. 페이지네이션도 SUIT로 통일.
- Gmarket Sans Medium은 *히어로 슬로건 60px만* 유지 (브랜드 표현).
- Pretendard는 사용하지 않음.

### Consequences

- 폰트 로딩 비용 감소 (SUIT + Gmarket Sans 2종만).
- 페이지네이션 시각 차이가 미미해 사용자 영향 최소.

---

## ADR-009: 헤더 메뉴 인터랙션 정책

- **Status**: Accepted
- **Date**: 2026-05-26

### Context

HeroBanner Header(`98:7101`) 인터랙션 어노테이션: "스크롤 위치에 따라 탭이 이동하는 인터렉션". 사용자 확인: 랜딩에선 스크롤하면서 active 메뉴가 바뀌고, 다른 페이지에선 *활동 스토리*가 고정.

### Decision

- **랜딩/메인**: 스크롤스파이 — 페이지 스크롤 위치에 따라 4개 메뉴 중 해당 섹션 메뉴가 active로 자동 변경. 메뉴 클릭 시 해당 섹션 앵커 스크롤.
- **소식 페이지 (목록·상세) 및 향후 다른 페이지**: "활동 스토리" 메뉴가 active로 *고정* (현재 위치 표시).
- 랜딩의 4개 메뉴는 각 섹션의 앵커: 임팩트 데이터→KpiSection, 활동 스토리→ArticleGrid, 쌀 나눔 소식→피처드 영역, 쌀나눔 프로젝트→StorySection (추정, 추후 확정).

### Consequences

- 메뉴 4개가 별도 페이지가 아니라 *랜딩의 섹션 앵커*임을 1차 런칭에 확정 — 미디자인 3 페이지 부담 해소.
- 소식 페이지 진입 시 어떤 메뉴를 active로 둘지가 명확 (활동 스토리).
- 스크롤스파이 구현 시 사이트 헤더가 sticky로 동작해야 함.

---

## ADR-010: 좋아요(Heart) — 익명 토글

- **Status**: Accepted
- **Date**: 2026-05-26

### Context

회원·로그인 없음. ArticleCard·상세 페이지에 Heart 카운터 노출.

### Decision

- 익명 좋아요. IP + 세션(쿠키/localStorage) 조합으로 1회 토글 (다시 누르면 -1).
- 어뷰징 방지: 같은 IP+세션은 같은 글에 1회만. 단순 rate limit (1초 1회 이상 못 누름).
- DB에 `heart_events(article_id, ip_hash, session_id, created_at, deleted_at)` 형식으로 저장 (취소 추적 위해 soft delete).

### Consequences

- 회원 시스템 없이 좋아요 운영 가능.
- IP가 NAT 공유될 경우 같은 IP에서 1회만 카운트되는 한계 → 1차 런칭 수용.
- 추후 회원 시스템 도입 시 user_id 기반으로 재설계.

---

## ADR-011: 1차 런칭 범위 — 읽기 + 좋아요 + 어드민만

- **Status**: Accepted
- **Date**: 2026-05-26

### Context

데드라인 2026-05-31 (5일 남음). 사용자 답변: 검색·문의 폼·회원·이용약관·다국어·애널리틱스 모두 1차 런칭에 *없음*.

### Decision

1차 런칭 범위:
- ✅ 홈/랜딩 (스크롤스파이 메뉴 + 6개 섹션)
- ✅ 쌀 나눔 소식 — 목록 + 상세 + 카테고리 필터 + 페이지네이션 + 익명 좋아요 + 소셜 공유(카카오톡/페이스북/링크복사)
- ✅ 어드민 CMS — 게시글 CRUD + 카테고리 + 태그(자유) + 이미지 업로드
- ❌ 회원가입·로그인 (방문자용)
- ❌ 이용약관·개인정보처리방침 페이지
- ❌ 다국어 (한국어만)
- ❌ 문의/연락 폼
- ❌ 검색 기능 (헤더에 아이콘만 표시, 클릭 시 노출만)
- ❌ 애널리틱스
- ❌ 임팩트 데이터·활동 스토리·쌀나눔 프로젝트 별도 페이지 (랜딩 섹션 앵커로만 작동, ADR-009)

### Consequences

- 5일 데드라인 내 실현 가능성 ↑.
- 단순한 시스템 — 게시판 + 어드민이 핵심.
- 추후 확장 시: 회원·검색·다국어·애널리틱스를 v2로 누적.

---

## ADR-012: 어드민 권한 — 3단계 (Super/Editor/Viewer)

- **Status**: Accepted
- **Date**: 2026-05-26

### Context

사회공헌국·문화홍보국 등 여러 운영자. 콘텐츠 권한 분리 필요.

### Decision

- **`super`**: 모든 권한 + *계정 생성/삭제/권한 변경*
- **`editor`**: 콘텐츠 CRUD + 카테고리·태그 관리. 계정 관리 불가.
- **`viewer`**: 어드민 화면 *읽기 전용*. 통계 확인 등.
- 회원가입(self-signup) 없음. **super가 계정 직접 생성**.
- 모든 변경은 audit log에 기록.

### Consequences

- ADR-002(운영 자율성) 충족.
- 보안: 외부에서 계정 생성 불가, 슈퍼 관리자 책임 가중.
- 어드민 UI에 사용자 관리 화면 필요 (slim).

---

## ADR-013: 관련 글 알고리즘 — 카테고리·태그·최신 조합 점수

- **Status**: Accepted
- **Date**: 2026-05-26

### Context

소식 상세 페이지 "더 많은 소식 살펴보기" 3개 카드 추천 로직.

### Decision

후보 글에 대해 점수 계산:
- 같은 카테고리: +3점
- 겹치는 태그 개수당: +1점
- 발행일 최신순: +(1~2점 가중치, 30일 이내 큰 가중)
- 자기 자신 제외, 발행된 글만, 점수 내림차순 상위 3개.

알고리즘 단순화 우선. 추후 클릭률·체류 시간 등 추가 가능.

### Consequences

- 단순한 SQL/ORM 쿼리로 구현 가능.
- "카테고리 같지만 오래된 글" vs "카테고리 다르지만 태그 겹치는 최신 글" 사이 균형 잡힘.

---

## ADR-014: 호스팅 — Vercel (1단계) + AWS (2단계 이전 예정)

- **Status**: Accepted
- **Date**: 2026-05-26 (개정 2026-05-26 — AWS 이전 명시)

### Context

데드라인 2026-05-31 (5일 남음). 사용자 확인: *Vercel로 일단 런칭하다가, 추후 실서버 배포 시 AWS로 옮길 예정*.

### Decision

- **1단계 (v1.0 런칭)**: Vercel Hosting + 외부 DB·Storage(Supabase 등)
- **2단계 (실서버 운영)**: AWS — Amplify Hosting 또는 OpenNext + SST + Lambda + CloudFront + RDS

### Consequences

- Next.js와 자연스럽게 결합.
- *Vercel 종속 기능을 처음부터 피해야* 마이그레이션이 부드러움 → ADR-019 신설.
- 도메인은 1단계에 Vercel, 2단계에 AWS Route 53로 DNS 이전.

---

## ADR-019: 마이그레이션 친화 설계 — Vercel 종속 기능 회피

- **Status**: Accepted
- **Date**: 2026-05-26

### Context

ADR-014에 따라 1단계는 Vercel, 2단계는 AWS로 이전 예정. Next.js의 일부 기능(Vercel Postgres·Blob·Edge Functions 등)은 Vercel에 강하게 종속되어 있어 AWS 이전 시 재작성 부담이 크다.

### Decision

**처음부터 다음을 회피하거나 외부 솔루션 사용**:

| 영역 | Vercel 종속 ❌ | 채택 ✅ |
|---|---|---|
| DB | Vercel Postgres | **Supabase** (외부 Postgres) — 1단계 무료 티어, 2단계 RDS로 dump 이전 |
| 이미지·파일 저장 | Vercel Blob | **Supabase Storage** (S3 호환) — 2단계 AWS S3 sync 이전 |
| Image Optimization | (자동) | `next/image` 표준 + remotePatterns에 외부 도메인 화이트리스트 |
| Edge / Middleware | Edge Runtime | **Node Runtime만**. Edge·Middleware 사용 최소화 |
| Auth | (외부 의존) | **NextAuth.js** (또는 Supabase Auth) — Vercel/AWS 양쪽 동일 작동 |
| 환경변수 | Vercel UI 전용 | `.env` 표준 — 동일 키로 양쪽 운영 |

### Next.js 기능 × AWS 옵션 호환성 매트릭스

| 옵션 | SSG | SSR | ISR | Middleware | Image Opt | 추천도 |
|---|---|---|---|---|---|---|
| **AWS Amplify Hosting** | ✅ | ✅ | ✅ 네이티브 | ✅ | ✅ | ★★★★★ |
| **OpenNext + SST + Lambda** | ✅ | ✅ | ✅ (DynamoDB+S3) | ✅ | ✅ | ★★★★★ |
| **ECS Fargate + ALB** | ✅ | ✅ | ⚠️ 단일 OK·멀티는 외부 캐시 | ✅ | ⚠️ CloudFront 권장 | ★★★★ |
| **EC2 + Docker + ALB** | ✅ | ✅ | ⚠️ 동일 | ✅ | ⚠️ 동일 | ★★★★ (팀 익숙도 가산) |
| **AWS App Runner** | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ★★ (비쌈) |
| **S3 + CloudFront (export)** | ✅ | ❌ | ❌ | ❌ | ❌ | ★ (어드민 불가) |
| **EKS** | — | — | — | — | — | ★ (오버킬) |

### 기능별 특이사항

- **ISR 캐시**: Vercel·Amplify·OpenNext는 자동 동기화 (DynamoDB·자체 캐시). 컨테이너 기반(Fargate/EC2)에서 멀티 인스턴스 운영 시 ElastiCache Redis 등 외부 캐시 필수.
- **Image Optimization**: Vercel·Amplify·OpenNext는 자체 처리. 컨테이너 기반은 sharp가 컨테이너 CPU 사용 → CloudFront 앞단 캐싱 필수.
- **Middleware**: 모든 옵션에서 Node Runtime이면 작동. Edge Runtime은 Amplify·OpenNext·Lambda@Edge에서만.

### 2단계 AWS 아키텍처 옵션 (팀 익숙도·운영 부담 고려)

| 옵션 | 적합한 경우 | 비용 (소규모) | 운영 부담 |
|---|---|---|---|
| **A. AWS Amplify Hosting** | Vercel 경험만 있고 학습 최소화 원함 | 트래픽당 ~$5~30/월 | 낮음 |
| **B. OpenNext + SST + Lambda + CloudFront + RDS** | 비용 통제·서버리스 선호, IaC 관심 | ~$20~30/월 | 중간 (학습 곡선) |
| **C. ECS Fargate + ALB + RDS** | Docker 익숙, 컨테이너 운영 안정 원함 | ~$50/월 | 중간 |
| **D. EC2 + Docker + ALB + RDS** | **팀이 EC2·Linux 운영 익숙**, DevOps 시니어 있음, 다른 서비스와 같은 서버 운영 | ~$50/월 (고정) | 높음 |

**우리 팀 컨텍스트 (2026-05-26 사용자 확인)**: *팀이 EC2 자주 사용, Docker로 말아서 배포 가능성 있음*. → **갈래 D(EC2+Docker) 또는 C(Fargate) 유력**.

### EC2 + Docker 운영 시 주의점

Next.js의 Vercel 자동 기능이 EC2에서는 *직접 처리* 필요:

1. **Image Optimization**: 매 요청마다 sharp로 처리 → CPU 부담. *CloudFront 앞단 캐싱* 또는 사전 변환 + S3.
2. **ISR**: 캐시가 인스턴스 파일시스템에 저장 → 재시작·멀티 인스턴스 시 불일치. 외부 캐시(Redis) 사용 또는 단일 인스턴스 유지.
3. **운영 자동화**: SSL 갱신·OS 패치·로그 수집·모니터링·알람·Zero-downtime 배포 *모두 직접 셋업*.

→ Next.js `next.config.js`에 `output: 'standalone'` 켜서 Docker 이미지 크기 최소화.

### EC2 vs ECS Fargate 권고

| | EC2 + Docker | ECS Fargate |
|---|---|---|
| OS 패치 | 직접 | AWS 자동 |
| SSH 접근 | 가능 | 제한적 |
| 가격 | 고정 (예측 쉬움) | 사용량 |
| 학습 부담 | Linux 운영까지 | Docker만 |

**팀에 풀타임 DevOps가 없으면 ECS Fargate 권장**. EC2의 통제력은 *DevOps 담당자가 있을 때 효율*. 팀 익숙도가 EC2라면 EC2로 가되 *함정 3가지 사전 인지*.

### 구체적 AWS 인스턴스 추천 (1차 트래픽 기준)

**서버리스 (Lambda/Fargate)**:
| 자원 | 스펙 | 월 비용 |
|---|---|---|
| Compute | Lambda (요청당) 또는 ECS Fargate | ~$0~10 |
| CDN | CloudFront | ~$1~3 |
| DB | RDS Postgres `db.t4g.micro` (2 vCPU, 1GB) | ~$15 |
| Storage | S3 (10GB) | ~$0.25 |
| 도메인 | Route 53 | $0.5 |
| **합계** | | **~$20~30/월** |

**EC2 + Docker (고정 비용 선호)**:
| 자원 | 스펙 | 월 비용 |
|---|---|---|
| EC2 | `t3.small` (2 vCPU, 2GB RAM) | ~$15 |
| ALB | Application Load Balancer (SSL 종단) | ~$16 |
| RDS | Postgres `db.t4g.micro` | ~$15 |
| CloudFront | 이미지·정적 자원 캐싱 (필수) | ~$1~5 |
| S3 | 이미지 저장 | ~$1 |
| Route 53 | 도메인 | $0.5 |
| **합계** | | **~$50/월** |

트래픽 증가 시: EC2 `t3.medium`($30) 또는 ECS로 전환.

### CI/CD 흐름 (EC2 + Docker 케이스)

```
1. 코드 push (main 브랜치)
2. GitHub Actions
   - docker build → ECR push (이미지 태그 = git SHA)
3. EC2에 배포
   - SSM Run Command 또는 deploy 스크립트
   - docker pull + docker run (blue-green 또는 rolling)
4. ALB가 헬스체크 통과한 컨테이너로 트래픽
```

GitHub Actions YAML 한 번 짜두면 이후 코드 push만으로 자동 배포.

### Consequences

- 1단계 약간의 비용·복잡도 증가 (Vercel Postgres 대신 Supabase 셋업).
- 2단계 마이그레이션이 *DB dump+restore + Storage sync + DNS 변경*으로 1~2시간 작업으로 축소.
- Vercel의 *고급 Edge 기능*을 못 쓰지만, 우리 사이트는 SSR/ISR만으로 충분.

### Next.js Docker 빌드 트릭

`next.config.js`에 다음을 *처음부터* 설정:
```js
module.exports = {
  output: 'standalone',  // .next/standalone에 최소 필요 파일만 빌드 → Docker 이미지 ~150MB
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      // 추후 AWS S3 도메인 추가
    ],
  },
}
```
공식 [Next.js Dockerfile 예제](https://github.com/vercel/next.js/tree/canary/examples/with-docker) 기반. 2단계 EC2/Fargate 이전 시 *Dockerfile 그대로 사용 가능*.

---

## ADR-001: 기술 스택 (TBD)

---

## ADR-015: 콘텐츠 운영 — 사회공헌국 단독 (의도서 §9.1 폐기)

- **Status**: Accepted (Supersedes 의도서 §9.1)
- **Date**: 2026-05-26

### Context

의도서 v1(2026-04-14) §9.1 "운영 책임 분담"에 사회공헌국(페이지 운영) + 문화홍보국(콘텐츠 제작 협조) + 개발 업체(IT) 3자 분담이 명시됨. 사용자 확인: **현재는 사회공헌국 단독 운영**.

### Decision

- 어드민 시스템은 **사회공헌국만** 사용한다고 가정해 설계.
- 문화홍보국의 콘텐츠 제작 협조는 *오프라인 조직 간 협조*일 뿐 시스템에 반영 안 함 — 별도 권한·계정·워크플로우 없음.
- 의도서 §9.1의 3자 분담 표는 폐기. ADR-006(§5 IA 폐기)과 같은 맥락의 확장.
- 단, 1차에서 권한 단계도 *Super 1단계만* 운영 (ADR-016 참조).

### Consequences

- 어드민 UX 단순화 — 부서 간 콘텐츠 인수인계 없음.
- 사회공헌국 직원이 *모든 콘텐츠 등록·수정·KPI 입력*을 직접.
- 향후 부서 분담 필요 시 v1.1로 권한 추가 (ADR-016).

---

## ADR-016: 어드민 권한·CSV는 v1.1로 — 1차에는 단일 슈퍼 계정만

- **Status**: Accepted (Supersedes ADR-012 적용 시점)
- **Date**: 2026-05-26

### Context

데드라인 5일 임박. ADR-012는 3단계 권한(super/editor/viewer) + 슈퍼 계정 생성 + CSV 내보내기를 정했지만, 1차 런칭에 모두 포함하면 5일 안에 어드민 UI 비대화.

### Decision

- **1차 런칭(v1.0)**: 단일 super 계정만. 사회공헌국이 그 계정으로 모든 작업. 권한 분리·계정 관리 UI·CSV 내보내기 *모두 빠짐*.
- **v1.1**: ADR-012의 3단계 권한 + ADR-015 검토(필요 시) + CSV 내보내기 추가.
- v1.0 DB 모델은 ADR-012의 `users.role` enum 그대로 만들되, super만 사용. 이후 enum 추가 시 마이그레이션 불필요.

### Consequences

- 5일 데드라인 내 어드민 구현 가능.
- 보안: 단일 계정이라 비밀번호 관리 중요 → 강력한 비밀번호 정책 + 2FA(가능하면).
- 추후 v1.1에서 권한 추가 시 *데이터 마이그레이션 없음* (role 컬럼은 이미 있음).

---

## ADR-017: 어드민 첨부 — 이미지만 (1차)

- **Status**: Accepted
- **Date**: 2026-05-26

### Context

게시글 본문 작성 시 첨부 파일 종류. 사용자 확인: 이미지만.

### Decision

- 1차 런칭: 이미지(JPG/PNG/WEBP) 업로드만 허용. PDF·Word·동영상 등 *불가*.
- 용량: 단일 이미지 5MB 이내, 글당 총 20MB 이내 (보수적, 조정 가능).
- 운영자 친화 UI: 드래그앤드롭·붙여넣기·미리보기.

### Consequences

- 스토리지 비용 예측 쉬움.
- 본문 rich text 에디터에서 이미지만 인라인 삽입.
- PDF가 필요한 보고서 등은 *이미지로 변환*하거나 v1.1에서 별도 첨부 지원.

---

## ADR-018: 해석 원칙 — "왜·정체성·톤" 영역은 추론으로 채우되 명시한다

- **Status**: Accepted (Supersedes 일부, 보강 of ADR-000)
- **Date**: 2026-05-26

### Context

기존 문서(의도서 v1·기획안 v5·BI PPT) ↔ 현재 Figma 사이에 *중간 회의·결정의 기록이 비어있고 점프된 흔적*이 있음을 사용자가 확인. 의도서·기획안의 일부 가정이 폐기되었고(ADR-006·015), BI 시안 A/B 검토 결과도 *기록 없이 Figma에 반영*된 상태.

ADR-000(Figma SSOT)은 *사실 차원*의 원칙이지만, **왜·정체성·목적·톤앤매너 같은 정성 영역**은 Figma만으로 충분히 설명되지 않는 경우가 있다. 이 갭을 어떻게 다룰지가 필요.

### Decision

1. **기존 문서**(의도서 v1·기획안 v5·BI PPT)는 *과거 회차 기록물 + 정성 영역의 영감 출발점*. `docs/source/`에 보존하되 사실의 근거로 쓰지 않는다.
2. **Figma + 사용자 결정**은 *현재 진실*. 정성 영역의 *최종 표현*도 Figma 결과에서 역추적.
3. **갭은 추론으로 채운다.** 단, *추론임을 docs에 명시* — 예: "_이 페이지의 핵심 메시지는 Figma의 카피와 톤에서 ___로 추론_". 사실과 추론은 시각적으로 구분(이탤릭, "추론"·"추측"·"가정" 단어 사용).
4. **추론은 정기적으로 사회공헌국에 확인**. PR 단위로 추론 항목을 모아 한 번씩 검증.

### 적용 예

- ✅ Figma 명시 사실: "헤더 메뉴 4개 = 임팩트 데이터/활동 스토리/쌀 나눔 소식/쌀나눔 프로젝트" — 그대로 docs에 반영
- ✅ 추론(명시): "*추론*: 쌀나눔 프로젝트 메뉴 → StorySection 앵커 (StorySection이 '쌀 나눔 활동' 태그 + '밥이 사랑입니다' 메시지를 담고 있어 가장 잘 맞음)"
- ❌ 추측을 사실처럼 적기: "쌀나눔 프로젝트 → StorySection으로 매핑됨" (확정처럼 보여 위험)

### Consequences

- 의도서·BI PPT에 끌려가지 않으면서도, *정성 영역의 빈자리를 포기하지 않음*. 톤앤매너·서브카피·메뉴 매핑 추론을 *명시적으로* 진행.
- 모든 추론은 *언제든 사회공헌국이 정정할 수 있는 가설*. docs에서 사실과 분리되어 *교체하기 쉬움*.
- 새 페이지 카피 작성 시: 의도서 §6 톤앤매너 5키워드(진정성·따뜻함·투명성·공공성·지속성)를 *참고*하되, Figma에 박힌 카피("밥이 사랑입니다", "가치를 삶으로...", "Sow Good")가 *결정적 기준*.

---

## ADR-001: 기술 스택 — Next.js 16 + Drizzle + Neon + Clerk + shadcn/ui v4 (스타터팩 기반)

- **Status**: Accepted
- **Date**: 2026-05-26

### Context

사용자 보유 스타터팩(`.ai/stacks/nextjs-fullstack/fullstack.md`) 평가 결과 매우 시니어급 셋업 확인. 데드라인 5일 + 스타터팩 활용 = 코드 작업 즉시 시작 가능.

### Decision — 확정 스택

| 항목 | 채택 | 출처 |
|---|---|---|
| Framework | **Next.js 16** (App Router) | 스타터팩 |
| Language | TypeScript Strict | 스타터팩 |
| DB | **PostgreSQL on Neon** (`@neondatabase/serverless`) | 스타터팩 |
| ORM | **Drizzle ORM** + drizzle-kit + drizzle-zod | 스타터팩 |
| Auth | **Clerk** (`@clerk/nextjs`) | 스타터팩 |
| Styling | **Tailwind CSS v4** + **shadcn/ui v4** | 스타터팩 |
| Form | react-hook-form + zod v4 | 스타터팩 |
| Cache | Next 16 `"use cache"` + `cacheLife` / `cacheTag` | 스타터팩 |
| Middleware | `proxy.ts` (Node Runtime 전용) | 스타터팩 |
| Package Manager | pnpm | 스타터팩 |
| 배포 | Vercel (1단계) → AWS (2단계, ADR-014) | ADR-014 |
| **Storage** | **Cloudflare R2 (S3 호환)** | 보강 (ADR-019) |
| **Next 설정** | `output: 'standalone'` | 보강 (ADR-019) |

### 추가 의존성 (스타터팩 외)

| 기능 | 채택 |
|---|---|
| Rich text 에디터 (어드민 본문) | **Tiptap** (Drizzle JSON·shadcn 친화) |
| 이미지 업로드 | shadcn `<Input type="file">` + R2 presigned URL |
| 날짜 처리 | dayjs |
| 차트 (KPI) | 단순 숫자라 불필요 |

### 시니어 패턴 채택 (스타터팩 기여)

- **3-Layer 아키텍처**: `features/[domain]/actions.ts` / `service.ts` / `db.ts` 분리. Entry는 Zod 검증 + Service 위임, Service는 비즈니스 로직(db import ❌), DB Layer만 Drizzle 직접 사용.
- **Server Component 기본** + Client Component는 leaf만 + 데이터는 props로.
- **Server Actions** 정의 위치 = `features/[domain]/actions.ts` + ActionResult 표준 타입 + `revalidatePath()` 필수.
- **`useActionState` vs RHF** 폼 성격별 분리 기준 매트릭스 그대로 사용.
- **공통 안전망**: Golden Rules + dangerous-cmd-guard hook + secret-scan hook.

### Storage 결정 — Cloudflare R2

후보 비교:

| 옵션 | 장점 | 단점 |
|---|---|---|
| **Cloudflare R2** | S3 호환 API + *egress 무료* + 가격 저렴 | 추가 SaaS 계정 |
| Supabase Storage | Auth와 같은 베더 | Clerk과 Auth 중복 |
| Vercel Blob | Vercel 통합 | ADR-019 종속 회피 대상 |
| AWS S3 직접 | 2단계 그대로 사용 | 초기 셋업 비용 |

→ **Cloudflare R2 채택**. egress 무료라 트래픽 비용 예측 쉬움. S3 호환이라 2단계 AWS S3로 *URL만 바꿔* 이전 가능.

### Consequences

- 5일 안에 코드 작업 시작 가능.
- 스타터팩의 시니어 패턴(3-Layer·Server Component 기본·캐싱 정책)을 자연 흡수.
- Drizzle ORM 학습 필요 (Prisma 사용 경험 있으면 1~2시간).
- Clerk 무료 티어로 시작, 단일 super 계정만 사용(ADR-016) — 비용 0원.
- 2단계 AWS 이전 시: Neon → RDS Postgres dump, R2 → S3 sync, Clerk은 그대로 유지.

---

## ADR-001b: Drizzle ORM 채택의 시장·시니어 합의 근거 (2026-05-26 심도 조사)

- **Status**: Accepted (보강 of ADR-001)
- **Date**: 2026-05-26

### Context

ADR-001에서 스타터팩의 Drizzle 채택을 그대로 따랐으나, 사용자가 *2026년 트렌드·공식 문서·시니어 의견*에 대한 심도 조사를 요청. 결과를 ADR로 박아 *향후 ORM 재논의 시 근거*로 사용.

### 조사 결과 종합

- **시장 통계**: Prisma 10.6M DL/주 · Drizzle 9.6M DL/주 (격차 1M, 2024년 대비 Drizzle 3배 성장). GitHub: Prisma 46K · Drizzle 34.5K stars.
- **Next.js 공식 문서**: ORM 전용 가이드 없음 — *중립*. Server Components + Actions 활용만 권장.
- **Vercel·Turso·PlanetScale**: *Drizzle 적극 추천* 진영. 2026년 Drizzle이 PlanetScale 합류 (자금·지속성 확보).
- **create-t3-app**: 2026년 *Drizzle이 Prisma 추월* (신규 프로젝트 선택 기준). Prisma는 default 유지 (기존 코드베이스 호환).
- **Reddit r/nextjs (61 댓글)**: 합의된 결론 없음. *팀 친숙도가 가장 큰 변수*. Drizzle 지지 추세.
- **시니어 합의 (2026)**:
  - Edge/Serverless → **Drizzle 압도**
  - 전통 Node + DX 우수 → Prisma
  - SQL 마스터 시니어 팀 → Kysely 또는 Drizzle

### Decision (재확인)

**Drizzle 유지**. 우리 케이스(Next.js 16 + Vercel → AWS Lambda/Fargate 친화 + 시니어 패턴 + 스타터팩 기반)에 *모든 면에서 최적*.

### ⚠️ 시니어 필수 설정 (놓치면 데이터 손실 위험)

`drizzle.config.ts`에 **`strict: true`** 필수:

```ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
  strict: true,    // ★ 컬럼 rename 시 DROP+ADD가 아닌 RENAME으로 처리
  verbose: true,
} satisfies Config;
```

`strict: false` 또는 미설정 시 컬럼 이름 변경이 *DROP + ADD*로 자동 인식되어 **데이터 손실**. Reddit·HN에서 가장 자주 보고되는 Drizzle 사고.

### 시장 데이터로 본 ORM 순위 (Next.js 16 + Vercel + AWS 시나리오)

| 순위 | ORM | 점수 |
|---|---|---|
| 🥇 1 | **Drizzle** | ★★★★★ |
| 🥈 2 | Prisma | ★★★★☆ |
| 🥉 3 | Kysely | ★★★★ |
| 4 | ZenStack v3 (베타) | ★★★ |
| 5 | postgres.js (No ORM) | ★★★ |
| 6 | TypeORM | ★★ |
| 7 | Sequelize | ★ |

### Consequences

- Drizzle 유지 + `strict: true` 설정으로 가장 흔한 사고 차단.
- 2027년 ZenStack v3 정식 출시 시 재평가 후보.
- Prisma는 *전통 Node 마이그레이션* 시점에 재고려 가능 (그러나 우리 시나리오에선 변경 비용 > 이득).

---

## ADR-020: Auth 변경 — Clerk → NextAuth.js v5 + 로컬 스택 전면 채택

- **Status**: Accepted (Supersedes ADR-001의 Auth 부분, ADR-014의 외부 SaaS 부분)
- **Date**: 2026-05-27

### Context

사용자 결정 (2026-05-26 세션 말): 외부 SaaS 가입 부담 회피 + 로컬 개발 최대화 + AWS 이전 시 락인 ↓ 위해 *전면 셀프호스팅 스택*으로 전환.

### Decision

| 영역 | 변경 전 (ADR-001) | 변경 후 |
|---|---|---|
| **Auth** | Clerk (`@clerk/nextjs`) | **NextAuth.js v5** (Credentials Provider, super 단일 계정) |
| **DB (로컬)** | Neon Serverless Postgres | **Docker Compose Postgres 16-alpine** |
| **DB (배포)** | Neon | Neon 유지 또는 Vercel Postgres·AWS RDS (1단계엔 Neon 무료 티어로 시작) |
| **Storage (로컬)** | Cloudflare R2 | **MinIO Docker** (S3 호환) |
| **Storage (배포)** | R2 그대로 | R2 또는 AWS S3 |

NextAuth.js v5 패턴 (스타터팩의 Clerk 패턴을 *재작성*):
- `proxy.ts` — `auth()` 미들웨어 (NextAuth)
- Server Action에서 `await auth()` → `session.user.id` 사용
- 로그인: 단일 super 비밀번호 (env `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` bcrypt)
- 회원가입 없음

### Consequences

- **외부 SaaS 가입 0건**으로 로컬에서 즉시 시작 가능. 데드라인 5일 안 셋업 부담 ↓.
- 스타터팩의 `.ai/rules/fullstack.md` §8 Auth(Clerk) 부분은 *NextAuth로 재작성*되어 코드에 적용. 스타터팩 본문은 폐기 안 함(공통 가이드).
- AWS 이전 시 NextAuth는 *어디서나 작동* (DB만 있으면 됨). 락인 ↓.
- 단점: Clerk의 폴리시드 UI(SignIn 컴포넌트·MFA·OAuth)를 직접 만들어야 함. 단 *단일 super 계정*이라 *로그인 폼 한 화면*으로 끝.
- `docs/tech.md` 스택 표·`.env.example`·`AGENTS.md "현재 컨텍스트"` Auth 부분 업데이트 필요.

---

## ADR-021: 1차 Sprint 작업 순서 — 평행 (공통 토대 → 어드민·사용자 동시)

- **Status**: Accepted
- **Date**: 2026-05-27

### Context

사용자 결정 (소크라테스 논증 후 시안 C 선택): "공통 토대 먼저 → 어드민·사용자 페이지 평행".

### Decision

5일 데드라인을 *공통 토대 1.5일 + 양쪽 평행 3일 + QA·배포 0.5일*로 분배.

```
D-5 (5/27): 셋업 + 공통 토대
  - Docker Compose (Postgres + MinIO) up
  - NextAuth.js v5 셋업 (super 단일 계정)
  - Drizzle 스키마: news / news_tags / heart_events / users / audit_logs
  - 첫 마이그레이션 + seed 데이터
  - features/news/{actions,service,db,schemas}.ts (3-Layer)
  - features/auth/ (NextAuth)

D-4 (5/28): 공통 컴포넌트
  - Header (스크롤스파이 + 반응형 4 BP)
  - Footer / Banner
  - ArticleCard 12 variants / StoryCard / Heart
  - PrimaryButton / TagChip / CategoryTab / Pagination

D-3 (5/29): 사용자 페이지 (평행 A) + 어드민 셸 (평행 B)
  - A: 랜딩 (HeroBanner + KpiSection + StorySection)
  - B: /admin 레이아웃 + 로그인 + 글 목록

D-2 (5/30): 사용자 페이지 (평행 A) + 어드민 글 작성 (평행 B)
  - A: 랜딩 (ArticleGrid + Section5 + Footer) + 소식 목록 + 상세
  - B: 어드민 글 생성/수정 (Tiptap + 이미지 업로드 to MinIO)

D-1 (5/31): QA + 배포 + 폴리시
  - Playwright E2E smoke
  - 반응형 4 BP 시각 검증
  - Vercel 배포 (도메인 연결)
```

### Consequences

- *공통 토대*에서 시간 절약 → 양쪽 페이지의 *모델·서비스 충돌 없음*.
- 평행 작업의 *컨텍스트 스위칭*은 AI(나)가 처리. 인간(사용자)은 *검증·결정 시점*만 개입.
- 데이터 모델·서비스 변경 시 양쪽 영향 → *공통 토대 안정화 후*에만 변경.

---

## ADR-022: 데이터 모델 — Figma 기반 재정렬 (ADR-006 후속)

- **Status**: Accepted (Supersedes `docs/tech.md` §데이터 모델 옛 정의)
- **Date**: 2026-05-27

### Context

`docs/tech.md` 데이터 모델이 의도서 §5 기반(`stories`, `kpi_snapshots`, `partners`, `partnership_inquiries` 등)으로 남아있음. ADR-006으로 의도서 §5 폐기됐는데 tech.md는 미반영 상태.

### Decision

**1차 런칭(v1.0)에 사용할 모델 5개만**:

```typescript
// src/db/schema/news.ts
export const newsCategory = pgEnum('news_category', [
  'all', 'family_healing', 'local_volunteer', 'environment', 'rice_sharing',
]);

export const news = pgTable('news', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  body: jsonb('body').$type<TiptapDoc>().notNull(),
  category: newsCategory('category').notNull(),
  coverImageUrl: text('cover_image_url'),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
});

// src/db/schema/news-tags.ts (자유 입력 태그, 다대다)
export const newsTags = pgTable('news_tags', {
  newsId: uuid('news_id').references(() => news.id, { onDelete: 'cascade' }).notNull(),
  tag: text('tag').notNull(),  // 자유 입력
}, (t) => ({ pk: primaryKey({ columns: [t.newsId, t.tag] }) }));

// src/db/schema/heart-events.ts (익명 좋아요, ADR-010)
export const heartEvents = pgTable('heart_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  newsId: uuid('news_id').references(() => news.id, { onDelete: 'cascade' }).notNull(),
  ipHash: text('ip_hash').notNull(),
  sessionId: text('session_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),  // soft delete (취소 추적)
}, (t) => ({
  uniq: uniqueIndex('uniq_heart').on(t.newsId, t.ipHash, t.sessionId),
}));

// src/db/schema/users.ts (super 단일 계정, ADR-012/016)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role', { enum: ['super', 'editor', 'viewer'] }).notNull().default('super'),
  passwordHash: text('password_hash').notNull(),  // bcrypt
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// src/db/schema/audit-logs.ts
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorUserId: uuid('actor_user_id').references(() => users.id),
  entity: text('entity').notNull(),  // 'news' 등
  entityId: uuid('entity_id').notNull(),
  action: text('action', { enum: ['create', 'update', 'delete', 'publish'] }).notNull(),
  diff: jsonb('diff'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**v2 백로그** (ADR-006으로 폐기되어 1차 미사용): `stories`(임팩트 스토리 풀 모델 — 동의 워크플로우), `kpi_snapshots`(투명성 KPI), `partners`/`partner_cases`, `regions`, `partnership_inquiries`.

### Consequences

- Drizzle 스키마 5개로 *최소 가용 시스템* 구성. 5일 내 구현 가능.
- `docs/tech.md` 데이터 모델 섹션 갱신 필요 (다음 세션 D-5에).
- `news` 한 테이블 + 좋아요·태그·로그 보조 → 게시판 1차 완성.

---

## ADR-001a: ADR-019 보강 — 스타터팩에 추가할 2가지

- **Status**: Accepted
- **Date**: 2026-05-26

### Decision

스타터팩에 없거나 명시되지 않은 2가지를 *프로젝트 초기 셋업에 반드시 포함*:

1. **`next.config.ts`에 `output: 'standalone'`**:
   ```ts
   import type { NextConfig } from 'next';
   const config: NextConfig = {
     output: 'standalone',
     images: {
       remotePatterns: [
         { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
         // 추후 AWS S3 도메인 추가
       ],
     },
   };
   export default config;
   ```

2. **Cloudflare R2 환경변수** 추가:
   ```bash
   # .env.local
   R2_ACCOUNT_ID=...
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   R2_BUCKET=ffwpu-social
   NEXT_PUBLIC_R2_PUBLIC_URL=https://...
   ```

### Consequences

- Docker 이미지 ~150MB로 빌드 가능 (2단계 AWS 이전 친화).
- 이미지 저장이 Vercel/AWS 양쪽에서 동일 작동.

---

## ADR-023: 도메인 아키텍처 — 옵션 2 서브도메인 + 단일 Next.js 앱 (host 분기)

- **Status**: Accepted
- **Date**: 2026-05-27

### Context

D-5 후반 사용자 결정 — 어드민과 사용자 페이지의 URL/도메인 분리 전략 잠금. 3안 비교 후 옵션 2 선택.

| 옵션 | 패턴 | 비고 |
|---|---|---|
| 1. 동일 도메인 + 경로 | `xxx.org/` + `xxx.org/admin` | 가장 단순. 워드프레스·Notion 류 |
| 2. **서브도메인** ★ 채택 | `xxx.org/` + `admin.xxx.org/` | B2B SaaS 표준 (Stripe·Slack·Shopify) |
| 3. 완전 별도 도메인 | `xxx-a.org` + `xxx-b.org` | 정부·금융 등 강력 격리. 우리 규모 오버킬 |

### Decision

- **사용자 페이지**: `<main-domain>` (도메인 미정, 사회공헌국 회신 대기)
- **어드민**: `admin.<main-domain>` (서브도메인 분리)
- **구현 방안 A**: 단일 Next.js 앱 + `src/proxy.ts`에서 hostname 분기. monorepo 분리 없음.
- **NextAuth**: `AUTH_URL`은 어드민 호스트 기준. 쿠키 domain `.<main-domain>` wildcard (cross-subdomain 인증 호환).
- **DNS**: `<main>` + `admin.<main>` CNAME 추가 (사회공헌국 도메인 회신 시).

### Implementation 일정

- **D-4~D-3**: 폴더 구조는 옵션 1과 *동일* — `app/(public)/` + `app/admin/(auth)/` + `app/admin/(panel)/`. 도메인 코드 무관.
- **D-1 (도메인 확정 후)**: `proxy.ts`에 host 분기 5-10줄 추가:

```ts
// 의사 코드 (D-1에 정식 작성)
const host = req.headers.get("host") ?? "";
const isAdminHost = host.startsWith("admin.") || host === "localhost:3000";

if (isAdminHost) {
  // admin.xxx.org → /admin/* 만 노출, 미인증 시 /admin/login 으로
} else {
  // xxx.org → /admin 접근 시 404
}
```

- 로컬 개발은 `localhost:3000`에서 양쪽 모두 접근 (호스트 분기 우회).
- 또는 로컬에 `127.0.0.1 admin.localhost` `/etc/hosts` 추가하여 서브도메인 동작 테스트.

### Consequences

- ✅ **검색엔진 색인 자연 분리** — 구글은 서브도메인을 별개 사이트로 인식. `robots.txt` 보강 가능.
- ✅ **인증 호환** — NextAuth가 cross-subdomain 쿠키 wildcard 지원. 별도 SSO 패턴 불필요.
- ✅ **확장**: v1.1·v2에 어드민을 별도 인프라(ECS Fargate)로 분리 시 코드 거의 무수정.
- ✅ **5일 데드라인 OK** — 폴더 구조는 영향 없고, host 분기 코드는 D-1 단계 5-10줄.
- ✅ **비용 0** — 서브도메인은 무료 (메인 도메인 1개만).
- ⚠️ 도메인이 미정인 동안은 hostname 분기 미적용. 도메인 확정 직전 D-1 단계에 정식 적용.
- ⚠️ 어드민 절대 URL을 NextAuth 콜백·이메일에 쓸 때 `process.env.AUTH_URL` 일관 사용 (하드코딩 금지).

### v2 안 — 옵션 3 전환 시점

옵션 2로 운영 중 *강력 보안 격리*가 필요해지면 (예: 결제 시스템 도입, 개인정보 대량 처리) → 옵션 3으로 마이그레이션. 코드 변경: monorepo 분리 (`apps/web` + `apps/admin`) + DB connection pool 분리. 비용·복잡도 증가. 현재 시점에는 불필요.

---

## ADR-024: 폴더 구조 잠금 — F3 (src/client + src/admin + src/features)

- **Status**: Accepted (Supersedes ADR-023의 폴더 구조 부분 — 도메인 아키텍처(서브도메인)는 ADR-023 유지)
- **Date**: 2026-05-27

### Context

ADR-023에서 *도메인 분리(서브도메인)*는 결정했으나 *폴더 구조*는 A안(`app/(public)` + Route Groups + `features/<도메인>/components/admin/`)으로 가던 중. 사용자가 "더 분리된 형태"를 원해 5개 폴더 패턴(A·D·F1·F2·F3) 점수표 + 업계 사례 + 스타트업 단계 매핑 검토 후 **F3 채택**.

### 5개 옵션 점수 (가중치 균등 ~ 분리 ×2 시나리오 모두 검토)

| 옵션 | 균등 | 분리 ×2 | 바이브/에이전틱 ×2 | 비고 |
|---|---|---|---|---|
| A Route Groups + Features | 60 | 66 | 79 | 분리감 약함 |
| D Bulletproof-React | 56 | 61 | 71 | client/admin 평면 |
| F1 client+admin+shared | 60 | 70 | 76 | 데이터 모델 shared 가면 F3 수렴 |
| F2 Monorepo | 44 | 54 | 53 | 5일 데드라인 부담 + 시리즈 A+ 표준 |
| **F3 client+admin+features** ★ | **61** | **69** | **79** | **균형 + 사용자 분리 의도 충족** |

업계 매핑: 1인·1도메인·시드 이전 단계 → F3 또는 A 표준. F2(Monorepo)는 시리즈 A+ 마이그레이션 시점.

### Decision

**F3 폴더 구조 채택**:

```
src/
├── app/                      ← 라우팅만 (Route Groups 유지: (public) + admin/(auth)/(panel))
├── client/                   ← ★ 사용자 전용 UI (layouts/sections/hooks)
├── admin/                    ← ★ 어드민 전용 UI (layouts/components/hooks)
├── features/                 ← ★ 도메인 로직 SSOT (actions/service/db/schemas + 양쪽 공유 components)
│   └── news/{actions,service,db,schemas,components/,index.ts}
├── components/ui/            ← shadcn primitive (양쪽 공유)
├── db/, lib/, hooks/, types/ ← 양쪽 공유 인프라
├── auth.ts, proxy.ts
```

**F3 결정 규칙 (AI/사람 동일 적용)**:

1. **라우트/페이지** → `app/(public)/` 또는 `app/admin/(panel)/`
2. **사용자에게만 보이는 UI** → `src/client/` (PublicHeader, 랜딩 sections, useScrollSpy)
3. **어드민에게만 보이는 UI** → `src/admin/` (AdminSidebar, NewsEditor, ImageUploader, NewsForm)
4. **양쪽이 모두 쓰는 도메인 UI** → `src/features/<도메인>/components/` (ArticleCard, Heart, CategoryTabs)
5. **도메인 로직(서버)** → `src/features/<도메인>/{actions,service,db,schemas}.ts` (3-Layer 그대로)
6. **도메인 무관 UI primitive** → `src/components/ui/` (shadcn)
7. **순수 함수 유틸** → `src/lib/`
8. **공용 React 훅** → `src/hooks/` (도메인 종속이면 client/admin/hooks 또는 features/X/hooks)

**features/<domain>/index.ts public API** (D 패턴 흡수): `db.ts`는 export 안 함. 외부에서 직접 호출 금지. `actions`·`service`·types만 노출.

### Consequences

- ✅ **사용자 분리 요구 충족** — `src/client/` ↔ `src/admin/` 최상위 분기. 트리만 봐도 명확.
- ✅ **데이터 SSOT** — Drizzle·Zod·3-Layer는 `features/` 한 곳. DRY 위반 0.
- ✅ **5일 데드라인 안전** — D-5 셋업 src/features/news/는 그대로 유지. D-4 진입 시 src/client/ + src/admin/ 신규 폴더만 생성.
- ✅ **에이전틱 코딩 친화** — AI가 "어드민 UI" / "도메인 로직" / "공용 컴포넌트" 3분기로 위치 즉결.
- ✅ **v1.1+ F2 마이그레이션 친화** — `src/client/`와 `src/admin/`이 이미 분리되어 있어 `apps/web` + `apps/admin`으로 split 시 비용 낮음.
- ⚠️ **결정 비용 (작음)** — "이 컴포넌트는 client 전용? 양쪽 공유?" 판단 1회 필요. 규칙: 양쪽 사용 가능성이 있으면 처음부터 `features/<도메인>/components/`에 (보수적).
- ⚠️ **현재 src/db, src/lib 등은 변경 없음** — F3 적용은 *UI 분리*에만. 데이터 레이어 폴더는 그대로.

### Implementation 일정

- **지금**: docs(tech.md/checklist.md/context-notes.md) F3 반영. 현재 src/ 코드 이동 0.
- **D-4 진입 시**: `src/client/layouts/`(PublicHeader/Footer/Banner) + `src/client/sections/`(랜딩 6 섹션) + `src/admin/layouts/`(AdminSidebar) + `src/admin/components/`(NewsEditor 등) 신규 생성.
- **D-2**: `src/features/news/components/admin/` 서브폴더는 *만들지 않음* — 어드민 전용 UI는 모두 `src/admin/`으로 통합. 단, ArticleCard처럼 양쪽 공유 UI는 `src/features/news/components/`에 유지.
- **v1.1+ 단계 진입 시**: F2 Monorepo 마이그레이션 검토 (도메인 3+ 또는 어드민 인프라 분리 결정 시).

### Open Issue

- `src/admin/components/admin/...` 같은 *중복 nesting*은 회피. `src/admin/components/NewsEditor.tsx` 직접 위치.
- 어드민 전용 컴포넌트가 도메인 모델 import는 자유 (`src/admin/components/NewsEditor.tsx`가 `features/news/schemas`에서 News 타입 import).

---

## ADR-025: 카테고리 — pgEnum 5 고정 → categories 테이블 (운영 자율성)

- **Status**: Accepted (Supersedes ADR-007 카테고리 enum 부분)
- **Date**: 2026-05-27

### Context

ADR-007에서 카테고리를 `pgEnum` 5개 고정 (all/family_healing/local_volunteer/environment/rice_sharing)으로 잠갔으나, 사용자가 "카테고리를 고정하지 말고 어드민이 선택·추가 가능한 자유 구조"를 요구. ADR-002 운영 자율성 절대 제약 (콘텐츠·분류 업데이트가 개발자 개입 없이 가능)과 정합. codex consult로 트레이드오프 검토 후 전환.

### Decision

- `pgEnum news_category` 제거 → `categories` 테이블 신규 (`id`, `name`, `slug` unique, `sort_order`, `is_active`, timestamps).
- `news.category` enum 컬럼 → `news.category_id` uuid FK (`onDelete: restrict` — 카테고리에 글 있으면 삭제 불가).
- `slug`는 URL·필터용 **immutable** (변경 시 URL 깨짐). 삭제 대신 `is_active=false` 비활성화 (hard delete 금지, codex 권고).
- **`all`은 DB 카테고리가 아니라 UI 필터 전용 slug** (`ALL_CATEGORY_SLUG`, `features/news/constants.ts`). 글 작성 시 `all` 입력 불가 (categoryId FK라 구조적 차단).
- 카테고리 vs 태그 역할 분리: 카테고리 = 1개 선택·공개 탭·URL·내비 / 태그(`news_tags`) = 다중 자유 키워드·검색 보조.
- 초기 seed 4개: 가족 치유 / 지역 봉사 / 환경 캠페인 / 쌀 나눔 (Figma 디자인 기준, sortOrder 1~4).

### Consequences

- ✅ **운영 자율성** — 어드민이 카테고리 추가·수정·비활성화·정렬 가능 (D-2 어드민 UI).
- ✅ **데이터 무결성** — categoryId FK restrict로 글 있는 카테고리 삭제 차단.
- ✅ **`all` 오염 차단** — codex 지적 (newsInputSchema가 enum 기반이라 `all` 입력 가능했던 문제) 구조적 해소.
- ⚠️ **CategoryTabs 가변 대응** — enum 5 하드코딩 → categories props 기반. 탭 개수 2~N개 UI 대응 필요 (D-3 모바일 가로 스크롤/드롭다운 결정).
- ⚠️ **Figma 5 고정 디자인과 정합** — D-3 시안은 4 카테고리 + 전체 탭 기준. 어드민이 카테고리 추가 시 탭 UI 자동 확장.
- ⚠️ **마이그레이션 0001** — 개발 단계 destructive (기존 enum 컬럼 drop + categoryId 추가). prod 데이터 없어 truncate 후 재시드. 배포 후 전환은 비용 큼 (codex 경고) → 지금 전환이 정답.

---

## ADR-026: 익명 좋아요 — IP+세션 → sessionId(localStorage) 단순화

- **Status**: Accepted (Supersedes ADR-010 ip_hash 부분)
- **Date**: 2026-05-27

### Context

ADR-010에서 익명 좋아요를 `(news_id, ip_hash, session_id)` 조합 unique로 설계. codex consult 검토 결과: (1) 세션이 localStorage라 시크릿창·쿠키삭제로 쉽게 우회 → "보안 아니라 중복 클릭 완화" 수준, (2) 공유 IP(NAT)에서 sessionId 다르면 안 막혀 IP는 사실상 보조 신호, (3) HMAC·rate limit 등 강한 방어는 익명 좋아요에 과한 스펙. 사용자가 "최대한 심플"을 요구.

### Decision

- `heart_events.ip_hash` 컬럼 **제거**. unique를 `(news_id, session_id)`로 단순화.
- `session_id` = 클라이언트 localStorage UUID. 좋아요 토글 = 기존 row의 `deleted_at` 토글 (soft delete, 현재 상태 복원 모델).
- **개인정보 미수집** — ip_hash 제거로 IP 관련 개인정보 보존·HMAC secret·보존 기간 결정 불필요 (개인정보 보호 절대 제약 정합).
- 좋아요는 "1인 1회 보장"이 아니라 **"동일 브라우저 중복 완화"**로 문서화. KPI·랭킹·보상 대상 아님.

### Consequences

- ✅ **스펙 단순화** — ip_hash·HMAC·IP 추출·보존 기간 결정 전부 제거. 개인정보 0 수집.
- ✅ **개인정보 보호 강화** — IP 관련 데이터 미저장 (ADR-004 개인정보 보호 절대 제약).
- ⚠️ **어뷰징 가능** — localStorage 클리어·시크릿창으로 우회 가능. 단 좋아요가 가벼운 반응이라 허용 범위 (codex 동의).
- ⚠️ **D-2 toggleHeart 구현 시** — Heart 컴포넌트가 클라 localStorage UUID 생성 → toggleHeart action 인자로 전달. unique 충돌 시 기존 row deleted_at 토글 (insert 재시도 아님).

---

## ADR-027: 쌀나눔 통계(StorySection) — kpi_metrics.section 판별 컬럼 재사용

- **Status**: Accepted
- **Date**: 2026-06-01

### Context

StorySection의 후원기관·지원가정·지역시설 통계(16개·23가정·2시설)가 `constants/story.ts` + `StorySection.tsx`에 코드 상수로 중복 박혀 있었음. 사용자가 운영자 숫자 입력 + hide-when-empty(0/빈값 시 숨김)를 요구. 별도 `story_stats` 테이블 vs `kpi_metrics` 재사용을 검토.

### Decision

- 별도 테이블 대신 `kpi_metrics`에 `section`('impact'|'story', default 'impact') 판별 컬럼 추가. shape(slug/label/value/displayValue/unit/sortOrder/isActive)가 KPI와 100% 동일 → 근접-중복 모듈 회피 (anti-slop §추상화·중복).
- `updateKpisAction`은 slug 키 기반이라 section-agnostic → **신규 mutation 0**. 통계 입력은 `/admin/landing` StoryStatsEditor에서 동일 액션 재사용.
- `listActiveKpiMetrics`에 `section='impact'` 필터 추가(필수 — 없으면 KpiSection이 7행으로 깨짐). 신규 `listStoryStats(section='story')`.
- StorySection은 propless→`StorySectionWithData` Suspense 래퍼로 DB 연결. render-time `value>0` 필터로 hide-when-empty (useEffect 금지).
- 마이그레이션 0003(section 컬럼 + story 3행 시드) + 0004(section CHECK 제약, codex 권고 — TS enum DB 강제).

### Consequences

- ✅ DRY — KPI 인프라(테이블·액션·검증) 전부 재사용. 신규 코드 최소.
- ✅ 운영 자율성 — 운영자가 통계 숫자 직접 입력, 0이면 자동 숨김.
- ⚠️ `kpi_metrics` 테이블이 KPI 아닌 행도 보유 — `section` 컬럼 + 주석으로 명시. 통계가 향후 분기(이름 목록 등)하면 별도 테이블로 승격 (ADR 트리거).

---

## ADR-028: 소식 히어로 — news.heroRank 컬럼 + advisory lock 동시성

- **Status**: Accepted
- **Date**: 2026-06-01

### Context

`/news` 소식 페이지 상단에 운영자가 최대 4개 글을 드래그로 정렬해 우선 노출하는 히어로 요구. 기존 `news.storySlot`(랜딩 1~2)·`featuredRank`(랜딩 1~7)와 별개 surface. 컬럼 추가 vs 통합 curation 테이블 검토.

### Decision

- `news.heroRank`(1~4, nullable, partial unique index where not null) 신규 컬럼 — 기존 storySlot/featuredRank 컬럼 패턴 일관. curation 통합 테이블은 기존 동작 코드 대거 재작성 필요 → 보류(4번째 surface 등장 시 ADR 트리거). 마이그레이션 0005(additive).
- `/news` 히어로는 전 카테고리 발행 글 대상(랜딩 featured의 rice_sharing 제한 없음). pin 없으면 비노출(자동 fallback 없음 — "수동 우선 노출" 의도).
- `setHeroOrder` 2-phase(전체 null 해제 → 순서대로 1..N): setLandingSlot(1개씩 release)은 swap 시 partial unique index 충돌하므로 재사용 불가.
- **동시성(codex Slice3 C3.6)**: 2-phase는 READ COMMITTED에서 직렬화 미보장(Tx B의 Phase1 WHERE가 Tx A 미커밋 행을 안 잡음) → `pg_advisory_xact_lock`으로 setHeroOrder 전체 직렬화. Phase2에 `publishedAt IS NOT NULL` 가드(TOCTOU). 발행 해제 시 `clearHeroRank` 동반(고아 슬롯 방지).
- 어드민 UI: @dnd-kit/sortable(Pointer 8px·Touch 200ms·Keyboard 센서 + 한국어 aria-live + reduced-motion), dirty 기반 명시 Save. `/news`는 기존 FeaturedStoryCard(탭 슬라이더) 재사용 + extractExcerpt(body).

### Consequences

- ✅ 기존 큐레이션 패턴 일관, 마이그레이션 additive.
- ✅ 동시 저장·draft pin·발행해제 고아 슬롯 race 전부 봉합 (cross-check 검증).
- ⚠️ advisory lock은 협력적 — `db.setHeroOrder` 우회 호출 시 미보호. service 경유만 허용(현 코드 준수).

---

## ADR-029: 멀티 super 관리자 계정 — ADR-020 "super 단일 계정" supersede

- **Status**: Accepted (Supersedes ADR-020 super 단일 계정 부분)
- **Date**: 2026-06-01

### Context

ADR-020에서 v1.0 어드민을 super 단일 계정으로 잠갔으나, 사용자가 운영자가 추가 관리자 계정을 만들 수 있어야 한다고 요구. 역할 차등(editor/viewer 권한 게이팅)은 v1.1 보류 — 추가 계정은 모두 super.

### Decision

- 마이그레이션 0 — 기존 `users`(role enum 보유) 재사용. 신규 `features/accounts` 모듈. 모든 신규 계정 `role:"super"` **서버 고정**(input에서 role 미수용 = 권한 상승 차단).
- 가드: 본인 삭제 차단(actor=세션 한정), 마지막 super 삭제 차단(`lockAndCountSupers` SELECT FOR UPDATE 행잠금으로 동시 삭제 TOCTOU 직렬화 — codex Slice2 C1.4).
- 이메일 정규화 단일출처 `normalizeEmail`(trim+lowercase) → 생성 스키마 transform + `auth.ts` authorize() + seed.ts 일관 적용(대소문자 불일치 로그인 실패 방지).
- 보안: passwordHash select 제외(직렬화 누출 차단), 중복이메일 사전체크+23505 백스톱(500 금지), 비번 72바이트(TextEncoder) 검증, toActionError 내부정보 미노출.

### Consequences

- ✅ 운영 자율성 — 사회공헌국이 추가 운영자 계정 직접 관리.
- ✅ 보안 — 권한 상승·계정 lockout·정보 누출 cross-check 검증 통과.
- ⚠️ 역할 차등 게이팅(editor/viewer 권한 분리)은 v1.1 — 현재 모든 계정 동일 super 권한.

---

## ADR-030: 메인 노출 슬롯 eligibility 서버 강제 + 상태전이 고아 슬롯 정리

- **Status**: Accepted
- **Date**: 2026-06-01 (어드민 ship-전 하드닝, codex v2 교정)

### Context

랜딩 슬롯 지정 `setLandingSlot`이 서버에서 published·쌀나눔 카테고리를 강제하지 않아, Server Action 직접 호출(클라 우회) 시 draft·타카테고리 글이 슬롯을 점유 → 공개 쿼리에서 필터링돼 "보이지 않는 빈 슬롯"이 발생(운영 자율성 절대제약 저해). 또한 발행된 슬롯 점유 글을 편집으로 임시저장 전환하거나 카테고리를 쌀나눔 밖으로 바꾸면 슬롯이 잔존(히어로도 동일 잠재버그 — `publishNewsAction` 경로만 정리). codex 지적: "설정 시점" 검증만으론 TOCTOU 잔존.

### Decision

- **eligibility를 최종 검증/UPDATE에 박는다(TOCTOU 차단)**: `setLandingSlot`은 대상 row를 `FOR UPDATE`로 잠근 뒤 `publishedAt IS NOT NULL` + 쌀나눔 카테고리 확인, 충족 시에만 기존 점유자 해제 후 set. `slot=null` 해제는 ineligible 글도 허용(고아 정리 경로). 결과는 discriminated union `{kind: ok|ineligible|not_found}`.
- **동시성**: 별도 `LANDING_SLOT_LOCK_KEY`(=740032, 히어로 740031과 분리) advisory lock 으로 동시 저장 직렬화 — 점유자 선해제→set 2-step의 23505 unique violation 차단.
- **상태전이 정리(A1b)**: `updateNews`·`setPublishedAt`에서 발행 해제 시 hero+landing 슬롯, 쌀나눔 외 카테고리 변경 시 landing 슬롯 동반 clear. 정리 판정은 순수 모듈 `slot-rules.ts`(`slotsToClearOnTransition`)로 추출 — 단위 테스트(9 케이스).
- 재사용: 히어로 `setHeroOrder`(WHERE에 `isNotNull(publishedAt)`) + `acquireHeroOrderLock` + `clearHeroRank` 패턴 이식.

### Consequences

- ✅ 공개 빈 슬롯·draft 노출 차단(운영 자율성). 동시 저장 안전. 마이그레이션 0.
- ✅ story 슬롯(2) 공개 연결 완료(R7) — 사용자 확인("관리자 변경이 반영돼야 함") 후 `StorySection`이 지정 글 대표 이미지 노출(클릭 시 소식 이동), 미지정 시 기본 사진 폴백. `StorySectionWithData`가 `listStorySlots` 연결. 4-2 완전 FULLY.

---

## ADR-031: JWT 세션 무효화 — 계정 삭제·role 변경 즉시 반영

- **Status**: Accepted
- **Date**: 2026-06-01

### Context

NextAuth v5 JWT 전략에서 계정 삭제·강등 후에도 기존 토큰의 `role=super`가 남아 `/admin` 접근·Server Action 호출이 지속 → 계정관리(ADR-029) 삭제의 실효성 공백. codex: JWT 전략은 세션 접근마다 `jwt` 콜백 실행, `proxy.ts`의 `auth()`가 `/admin/:path*`마다 태우므로 DB 재조회 위치로 적합. 단 빈 객체(`{}`) 반환은 오답 — Auth.js는 `null` 반환 시에만 쿠키 정리, `{}`는 비-super 세션으로 남아 forbidden 루프.

### Decision

- `auth.ts` `jwt` 콜백: 최초 로그인(user 존재) 외 모든 호출에서 `token.id`로 users 재조회. 없으면(삭제) **`return null`**(쿠키 정리), 존재하면 `token.role`을 DB 값으로 갱신(강등 즉시 반영). `session` 콜백은 token 필드 부재 방어.
- 트레이드오프: `/admin` 요청마다 DB 1~2회 조회(proxy `auth()` + RSC `requireSuperAdmin`). 단일 super·저빈도라 허용 — 성공기준은 부하가 아니라 "삭제·강등 즉시 차단".

### Consequences

- ✅ 계정 삭제·강등이 기존 세션에 즉시 적용. 토큰 위조 외 권한 잔존 제거.
- ⚠️ 요청당 DB 조회 증가(저빈도 수용). 고빈도화 시 단기 캐시 검토 — v1.1.

---

## ADR-032: Server Action 결과/에러 통합 — `lib/action-result.ts` + DomainError 분리

- **Status**: Accepted
- **Date**: 2026-06-01 (아키텍처 옵션1)

### Context

`ActionResult<T,Input>` 타입이 news·categories·kpi·accounts 4개 actions에 중복 정의(kpi는 단일 제네릭으로 미세 불일치), 에러 변환도 accounts의 `toActionError`(가드 예외만 메시지, 그 외 generic — 보안 우수)와 나머지의 `authError`/`err.message`(DB 제약명·SQL 등 내부정보 노출)로 갈림. codex: 일괄 generic화 시 categories의 사용자 친화 메시지(slug 중복·수정 필드 없음)가 묻힘.

### Decision

- `src/lib/action-result.ts` — `ActionResult` 타입 + `toActionError(e, context)` 단일화. 가드(Unauthorized/Forbidden)·`DomainError`만 메시지 노출, 그 외 `console.error` 후 generic.
- `src/lib/errors.ts` — 의존성 없는 `DomainError`(service가 import해도 NextAuth/DB 미유입). categories service가 도메인 검증 실패에 `throw new DomainError(...)` → 메시지 보존.
- mutation id를 액션 진입점에서 `z.uuid()` 검증(잘못된 UUID의 DB 도달·원문 메시지 반환 차단).
- 어드민 landing page의 인라인 Drizzle 2건을 `landing/db.ts`로 이관(3계층 경계 정합), 어드민 슬롯 상태는 공개용 `listFeaturedGrid`(fallback 포함)와 분리해 pinned-only(fallback 글 no-op 해제 제거).

### Consequences

- ✅ 중복 제거 + 내부정보 노출 표면 축소 + 도메인 메시지 보존. 기능 변화 0.
- 손대지 않음: revalidate 헬퍼(무효화 경로 도메인별 상이)·kpi_metrics section 겸용(shape 동일)·src/client 분할·서브도메인 — 억지 추상화 회피(옵션2·3은 v1.1).
