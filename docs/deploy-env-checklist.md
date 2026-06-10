<!-- 배포(Neon/R2) 전 환경변수·설정 체크리스트 — 로컬 Docker/MinIO → 배포 Neon/R2 전환 가이드 -->

# 배포 환경변수 체크리스트 (Neon · R2)

> 코드는 전부 `process.env` 로만 동작(하드코딩 localhost 없음, 감사 완료). 배포 시 아래 값만 플랫폼(Vercel/AWS) 환경변수에 채우면 됨.
> SSoT: `.env.example`. 로컬은 `.env.local`(gitignore).

## 1. 변수 매핑 (로컬 → 배포)

| 변수 | 로컬 | 배포 |
|---|---|---|
| `DATABASE_URL` | Docker Postgres(5432) | **Neon** connection string(`...?sslmode=require`). pg 드라이버 그대로 |
| `AUTH_SECRET` | `openssl rand -base64 32` | 동일 방식 새 값(노출 금지) |
| `AUTH_URL` | 구동 포트와 일치(로컬 `http://localhost:3100`) | **실제 도메인**(`https://...`). 불일치 시 로그인 리다이렉트 깨짐 |
| `S3_ENDPOINT` | `http://localhost:9000`(MinIO) | **R2** `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| `S3_REGION` | `us-east-1` | `auto`(R2) |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | minio | R2 API 토큰 |
| `S3_BUCKET` | `ffwpu-social` | R2 버킷명 |
| `S3_FORCE_PATH_STYLE` | `true` | `true`(R2 권장) |
| `NEXT_PUBLIC_S3_PUBLIC_URL` | `http://localhost:9000/ffwpu-social` | **R2 공개 도메인**(`https://<id>.r2.dev` 또는 커스텀, 끝 슬래시 없이) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3100` | **실제 도메인**(OG·sitemap·canonical 기준, 끝 슬래시 없이) |
| `NEXT_PUBLIC_GA_ID` | 비움 | GA4 `G-XXXXXXXXXX`(없으면 비워두면 미로드) |

## 2. ⚠️ 코드 설정 동반 확인 (env 외)

- **next/image 도메인 화이트리스트** — `next.config.ts` `images.remotePatterns` 에 R2 공개 도메인이 있어야 커버 이미지가 렌더됨. `*.r2.dev` 는 추가됨. **커스텀 도메인 연결 시 그 호스트를 직접 추가**(미등록 시 이미지 400 차단).
- **R2 버킷 공개 설정** — 버킷을 public access(r2.dev) 또는 커스텀 도메인 연결. presigned PUT 업로드는 토큰으로, 공개 GET 은 공개 도메인으로.
- **Neon** — `sslmode=require` 포함. 풀링 필요 시 Neon pooled connection string 사용.

## 3. SEO/OG/분석 (이번 PR 반영)

- `NEXT_PUBLIC_SITE_URL` 만 실제 도메인으로 채우면 OG 절대 URL·sitemap·canonical 자동 동작.
- 공유 미리보기: 소식 글은 **커버 이미지**가 OG 썸네일, 커버 없으면 `/api/og?title=…` 동적 생성(글 제목). 랜딩·목록은 `/api/og` 기본.
- `robots.txt`(`/sitemap.xml` 안내, `/admin` 차단)·`sitemap.xml`(발행글 자동 포함) 자동 생성.
- GA4: `NEXT_PUBLIC_GA_ID` 설정 시에만 로드. (개인정보 기조상 동의 배너/IP 익명화는 후속 검토.)

## 4. 배포 전 최종 점검

- [ ] Neon DB 생성 + 마이그레이션 적용(`pnpm drizzle-kit migrate`)
- [ ] R2 버킷 생성 + 공개 도메인 + API 토큰
- [ ] 위 변수 전부 플랫폼 환경변수 입력(시크릿은 대시보드만, 코드 금지)
- [ ] `NEXT_PUBLIC_SITE_URL` = 실제 도메인
- [ ] `next.config` remotePatterns 에 R2 공개 도메인 포함 확인
- [ ] 공유 미리보기 점검: `https://<도메인>/news/<id>` 를 카톡/페북 공유 디버거로 확인
- [ ] `https://<도메인>/sitemap.xml` · `/robots.txt` 응답 확인
- [ ] GA4 실시간 보고서에 트래픽 잡히는지 확인
