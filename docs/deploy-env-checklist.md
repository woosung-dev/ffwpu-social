<!-- 배포(Neon/R2) 전 환경변수·설정 체크리스트 — 로컬 Docker/MinIO → 배포 Neon/R2 전환 가이드 -->

# 배포 환경변수 체크리스트 (Neon · R2)

> 코드는 전부 `process.env` 로만 동작(하드코딩 localhost 없음, 감사 완료). 배포 시 아래 값만 플랫폼(Vercel/AWS) 환경변수에 채우면 됨.
> SSoT: `.env.example`. 로컬은 `.env.local`(gitignore).

## 1. 변수 매핑 (로컬 → 배포)

> **"어디에 넣나" 열을 먼저 보라.** 이 프로젝트는 값이 사는 곳이 **두 군데**다 — 앱이 읽는 값은 **Vercel**, GitHub Actions 워크플로가 읽는 값은 **GitHub Secrets**. 둘은 역할이 달라서 목록도 다르다. 겹치는 건 `CRON_SECRET` 하나뿐이고, 그건 **의도된 중복**(§6 참조).

| 변수 | 어디에 넣나 | 로컬 | 배포 |
|---|---|---|---|
| `DATABASE_URL` | Vercel | Docker Postgres(**5433**) | **Neon** connection string(`...?sslmode=require`). pg 드라이버 그대로 |
| `AUTH_SECRET` | Vercel | `openssl rand -base64 32` | 동일 방식 새 값(노출 금지) |
| `AUTH_URL` | Vercel | 구동 포트와 일치(로컬 `http://localhost:3100`) | **실제 도메인**(`https://...`). 불일치 시 로그인 리다이렉트 깨짐 |
| `S3_ENDPOINT` | Vercel | `http://localhost:9000`(MinIO) | **R2** `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| `S3_REGION` | Vercel | `us-east-1` | `auto`(R2) |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Vercel | minio | R2 API 토큰 |
| `S3_BUCKET` | Vercel | `ffwpu-social` | R2 버킷명 |
| `S3_FORCE_PATH_STYLE` | Vercel | `true` | `true`(R2 권장) |
| `NEXT_PUBLIC_S3_PUBLIC_URL` | Vercel | `http://localhost:9000/ffwpu-social` | **R2 공개 도메인**(`https://<id>.r2.dev` 또는 커스텀, 끝 슬래시 없이) |
| `NEXT_PUBLIC_SITE_URL` | Vercel | `http://localhost:3100` | **실제 도메인**(OG·sitemap·canonical 기준, 끝 슬래시 없이) |
| `NEXT_PUBLIC_GA_ID` | Vercel | 비움 | GA4 `G-XXXXXXXXXX`(없으면 비워두면 미로드) |
| `KPI_SHEET_CSV_URL` | Vercel | 배포와 동일 값 사용 | **Apps Script 웹앱 URL** `https://script.google.com/macros/s/<배포ID>/exec?token=<TOKEN>` (§6) |
| `RICE_SHEET_CSV_URL` | Vercel | 배포와 동일 값 사용 | **쌀 나눔 대장 CSV export** `https://docs.google.com/spreadsheets/d/<시트ID>/export?format=csv&gid=0` (§6.1) |
| `CRON_SECRET` | **Vercel + GitHub 양쪽** | `local-dev-cron-secret-123` 등 아무 값 | `openssl rand -hex 32`. **양쪽 값이 같아야 함** — 다르면 403 |
| `KPI_SYNC_ENDPOINT` | **GitHub Secrets 만** | (불필요) | `https://<도메인>/api/cron/sync-kpi` — Action 이 부를 주소 |
| `PROD_DATABASE_URL_DIRECT` | **GitHub Secrets 만** | (불필요) | Neon **direct**(`-pooler` 제거) — migrate 워크플로 전용 (§5) |

### ⚠️ Vercel 환경변수는 저장만으론 반영 안 됨

값을 바꾸고 **Save** 해도 **기존 배포는 옛 값 그대로**다. Deployments → 최신 배포 → `···` → **Redeploy** 를 해야 새 값이 붙는다. "분명 바꿨는데 왜 그대로지?"의 99%가 이것.

## 2. ⚠️ 코드 설정 동반 확인 (env 외)

- **next/image 도메인 화이트리스트 (ADR-050)** — `next.config.ts` `images.remotePatterns` 에 **실제 쓰는 호스트만** 나열돼 있어야 커버가 렌더된다. **와일드카드(`*.r2.dev` 등) 금지** — `*.r2.dev` 는 Cloudflare 전역 네임스페이스라 제3자가 우리 이미지 변환 쿼터를 태울 수 있다. **R2 공개 도메인을 바꿀 때는 새 호스트를 목록에 *추가*하고 옛 줄은 남길 것** — 커버 URL 은 DB 에 절대 경로로 저장돼 있어, 옛 호스트를 지우면 그 이전 발행 글의 커버가 전부 400 이 된다.
- **R2 버킷 공개 설정** — 버킷을 public access(r2.dev) 또는 커스텀 도메인 연결. presigned PUT 업로드는 토큰으로, 공개 GET 은 공개 도메인으로.
- **Neon** — `sslmode=require` 포함. 풀링 필요 시 Neon pooled connection string 사용.

## 3. SEO/OG/분석 (이번 PR 반영)

- `NEXT_PUBLIC_SITE_URL` 만 실제 도메인으로 채우면 OG 절대 URL·sitemap·canonical 자동 동작.
- 공유 미리보기: 소식 글은 **커버 이미지**가 OG 썸네일, 커버 없으면 `/api/og?title=…` 동적 생성(글 제목). 랜딩·목록은 `/api/og` 기본.
- `robots.txt`(`/sitemap.xml` 안내, `/admin` 차단)·`sitemap.xml`(발행글 자동 포함) 자동 생성.
- GA4: `NEXT_PUBLIC_GA_ID` 설정 시에만 로드. (개인정보 기조상 동의 배너/IP 익명화는 후속 검토.)

## 4. 배포 전 최종 점검

- [ ] Neon DB 생성 + **최초 1회** 마이그레이션 적용(`DATABASE_URL=<prod direct> pnpm db:migrate:deploy`). 이후는 §5 자동화가 main push마다 적용
- [ ] R2 버킷 생성 + 공개 도메인 + API 토큰
- [ ] 위 변수 전부 플랫폼 환경변수 입력(시크릿은 대시보드만, 코드 금지)
- [ ] `NEXT_PUBLIC_SITE_URL` = 실제 도메인
- [ ] `NEXT_PUBLIC_S3_PUBLIC_URL` 의 호스트가 `next.config.ts` `images.remotePatterns` 에 있는지 확인 (ADR-050 — 없으면 커버 400)
- [ ] 공유 미리보기 점검: `https://<도메인>/news/<id>` 를 카톡/페북 공유 디버거로 확인
- [ ] `https://<도메인>/sitemap.xml` · `/robots.txt` 응답 확인
- [ ] GA4 실시간 보고서에 트래픽 잡히는지 확인

## 5. 마이그레이션 자동화 (ADR-039 — Vercel 자동배포 유지)

배포 주체는 **Vercel git 자동배포 그대로**. 마이그레이션만 GitHub Actions로 분리해 main push마다 자동 적용. `next build`에 넣지 않음(Build≠Release).

- `.github/workflows/migrate.yml` — main push → `db:migrate:deploy`(Neon **direct**). Vercel은 별개로 자동 빌드·배포. migrate(수 초)가 빌드(수 분)보다 먼저 끝나 새 스키마가 새 코드보다 앞섬 → 가산형 안전.
- `.github/workflows/migrate-preview.yml` — PR에서 ephemeral Postgres에 from-scratch 적용해 깨진 마이그레이션을 머지 전 차단 + 새 SQL을 Job Summary로 노출.
- 러너 `src/db/migrate.ts` — advisory lock 으로 동시 실행 1개 보장(호스팅 무관, EC2 이전 시 재사용).

**1회 셋업 (단 1개):**
- [ ] GitHub → Settings → Secrets and variables → Actions → `PROD_DATABASE_URL_DIRECT` = Neon **direct**(`-pooler` 제거) 커넥션 스트링
- [ ] (Vercel 설정 변경 없음 — 자동배포 그대로)

**동작:** main 진입(머지/직접 push) → Actions `migrate` 잡 자동 실행(승인 게이트 없음) → migrate 적용. **금지: 자동 파이프라인에서 `db:seed`/`db:backfill-*` 실행**(seed는 TRUNCATE 포함).

**선택(옵트인) 승인 게이트:** prod 스키마 변경 전 사람 확인을 원하면 `migrate.yml`의 `migrate` 잡에 `environment: production` 한 줄 추가 + GitHub → Settings → Environments → `production`(Required reviewers) 생성. 그러면 migrate 직전 수동 승인에서 멈춤.

> **AWS(2단계) 이전 시:** Vercel 자동배포가 사라지므로 `migrate.yml`에 `deploy` 잡(standalone Dockerfile build→ECR→EC2, `needs: migrate`)을 추가해 "migrate → deploy" 게이트 구조로 수렴. `migrate.ts`·secret·advisory lock 그대로 재사용.

## 6. KPI 시트 동기화 — Apps Script 웹앱(getKpi)

### 왜 이렇게 됐나 (건드리기 전에 읽을 것)

원본 시트(`현장 활동 보고`)에는 **개인정보가 들어 있어 "제한됨"으로 잠겨 있다.** 그래서 `docs.google.com/.../export?format=csv` 방식은 **401** 이라 못 쓴다. 시트를 공개로 바꾸는 것은 개인정보 제약(ADR-004) 위반이라 **선택지가 아니다.**

대신 시트에 붙은 **Apps Script 웹앱(`getKpi.gs`)** 이 소유자 권한으로 시트를 읽고 **누적 지표 3개만** CSV 로 돌려준다. 시트는 계속 비공개고, 개인정보는 이 경로로 나올 수 없다(스크립트가 지정 라벨 3개만 꺼냄). 서비스 계정(GCP)은 Next.js 단일 스택 유지를 위해 기각했다.

```
[GitHub Action 매주 월]  --Bearer CRON_SECRET-->  [앱 /api/cron/sync-kpi]  --token-->  [getKpi 웹앱]  -->  [비공개 시트]
[어드민 "시트에서 불러오기" 클릭] ------------->  [앱 fetchSheetMetrics]   --token-->  ↑ 같은 URL
```

주간 자동·어드민 버튼이 **같은 URL 하나**(`KPI_SHEET_CSV_URL`)를 쓴다. 그래서 이 URL 이 죽으면 **둘 다** 죽는다.

> **시트는 2개다** — 협회 누적 지표(`KPI_SHEET_CSV_URL` → 랜딩 KpiSection)와 쌀 나눔 대장
> (`RICE_SHEET_CSV_URL` → 랜딩 StorySection). 한 번의 `/api/cron/sync-kpi` 호출이 둘을 각각 돌리고,
> **한쪽 실패가 다른 쪽을 막지 않는다**. 응답의 `reports[]` 에 시트별 성공/실패가 따로 찍힌다. 자세한 건 §6.1.

### 구성 요소

| 위치 | 내용 |
|---|---|
| 시트 → 확장 프로그램 → Apps Script | `getKpi.gs` — `doGet` + `testGetKpi`(편집기 검증용) |
| 〃 ⚙️ 프로젝트 설정 → 스크립트 속성 | `ACCESS_TOKEN` — URL `?token=` 값과 동일해야 함 |
| 〃 배포 설정 | **실행: 나(소유자)** · **액세스: 모든 사용자** — 둘 다 필수 |
| 대상 탭 | `SUMMARY_GID = 2067258207` ('총 누적 지표') |
| 라벨 3개 | `총 누적 봉사참여자수` · `연인원봉사시간 누계` · `총 누적 활동건수` — 앱의 `src/features/kpi/sync/mapping.ts` 와 **문자열이 일치해야 함** |

`실행: 나` 가 아니면 두 가지가 동시에 깨진다 — 액세스 목록에서 "모든 사용자"가 **사라지고**, 스크립트가 비공개 시트를 **못 읽는다**.

### 검증

```bash
curl -sSL "$KPI_SHEET_CSV_URL"          # → 2줄 CSV (라벨 행 + 숫자 행)
curl -sSL "<웹앱 URL>/exec"              # token 없이 → forbidden
```

시트 쪽만 따로 보려면 Apps Script 편집기에서 함수 드롭다운을 **`testGetKpi`** 로 바꿔 실행 → 실행 로그에 결과가 찍힌다. (`doGet` 을 직접 실행하면 요청 정보 `e` 가 없어 `forbidden` 을 반환하고, 반환값은 로그에 안 찍혀 "아무 일도 안 난 것"처럼 보인다 — 정상이다.)

### 자가 진단

| 증상 | 원인 | 조치 |
|---|---|---|
| `forbidden` | 토큰 불일치 | 스크립트 속성 `ACCESS_TOKEN` ↔ URL `?token=` 대조 |
| 구글 로그인 HTML | 배포 액세스가 "모든 사용자"가 아님 | 배포 설정 재확인 |
| `sheet not found` | `SUMMARY_GID` 불일치 | 탭 열고 주소창 `#gid=` 확인 후 스크립트 수정 |
| `라벨을 찾지 못했습니다` | 시트 라벨 변경 | 시트 라벨 ↔ `mapping.ts` ↔ `TARGET_LABELS` 3자 대조 |
| Action 은 500 인데 원인 불명 | `sync-kpi.yml` 이 `curl -fsS` 라 **응답 본문을 버림** | 위 curl 로 직접 호출해 진짜 메시지 확인 |

> ⚠️ **스크립트를 고치면 자동 반영되지 않는다.** 배포 → **배포 관리 → ✏️ 편집 → 버전 "새 버전" → 배포**. 여기서 **"새 배포"를 누르면 URL 이 바뀌어** `KPI_SHEET_CSV_URL` 을 같이 갈아야 한다.

### EC2 이전 시

`KPI_SHEET_CSV_URL`·`RICE_SHEET_CSV_URL`·`CRON_SECRET` 을 EC2 env 로 옮기고, GitHub Secret **`KPI_SYNC_ENDPOINT` 주소만** 새 도메인으로 교체하면 끝. GitHub 은 사이트를 주소로만 부르므로 **Apps Script 는 손댈 필요 없다.**

---

## 6.1 쌀 나눔 대장 시트 (ADR-058)

랜딩 StorySection 통계 3개(`나눔 쌀 kg` · `나눔 가정` · `나눔 시설`)를 채운다.

| 항목 | 값 |
|---|---|
| 변수 | `RICE_SHEET_CSV_URL` |
| 현재 방식 | 시트가 '링크가 있는 모든 사용자' 공유라 **CSV export URL 을 그대로** 쓴다 (Apps Script 불필요) |
| URL 형식 | `https://docs.google.com/spreadsheets/d/<시트ID>/export?format=csv&gid=0` |
| 읽는 것 | 행 0 의 라벨(`쌀 나눔 포대 무게(kg)` · `나눔가정 수` · `나눔 단체 수`) ↔ 행 1 의 총계 |
| 갱신되는 것 | `kpi_metrics.value` (숫자)만. 제목·단위는 `/admin/landing` 에서 운영자가 소유 |

```bash
# 검증 — 라벨 행 + 총계 행이 나와야 한다
curl -sSL "$RICE_SHEET_CSV_URL" | head -2
```

### 🔴 배포 후 1회 할 일

1. Vercel 에 `RICE_SHEET_CSV_URL` 입력 → **Redeploy**
2. 마이그레이션 `0020_story_stats_unit_backfill` 적용 (migrate 워크플로, §5)
3. GitHub Actions **`Sync KPI + 쌀나눔 from Sheets (weekly)` → Run workflow** 수동 1회
   — 안 돌리면 다음 월요일까지 낡은 값(`2,370kg`)이 그대로 노출된다
4. 랜딩에서 세 통계 표기 육안 확인. 단위가 어긋나면 `/admin/landing` 에서 **단위 칸만** 수정

### 시트가 '제한됨' 으로 바뀌면

CSV export 는 401 이 된다. 코드는 그대로 두고 `RICE_SHEET_CSV_URL` 을 **Apps Script 웹앱 URL**
(§6 의 `getKpi` 와 동일 방식)로 교체하면 된다. 읽는 쪽 인터페이스가 같아서 재배포 외 작업은 없다.

> ⚠️ 이 시트에는 실명·수혜 기관명이 들어 있다(ADR-004). 공유 범위 결정은 사회공헌국 몫 —
> `docs/TODO.md` escalation 참조.
