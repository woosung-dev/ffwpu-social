---
status: active
opened: 2026-08-08
branch: fix/image-normalize
slice_id: TASK-20260808-image-normalize
spec_status: confirmed
brainstorming_done: 2026-08-08
related_adr:
---

# 커버 이미지 업로드 시 정규화 + next/image 최적화 이탈

Vercel 이미지 변환 한도(5,000/월) 초과로 **커버 36장 중 15장이 402** 상태. 런타임 변환 의존을 끊고 업로드 시점 1회 정규화로 전환한다.

## 배경 — 실측 진단

### 현재 장애

라이브 사이트 커버 36장을 `w=828` 로 전수 요청한 결과 **15장(42%) 이 402** 반환. Hobby 한도 초과 시 신규 변환이 실패하고 `alt` 텍스트만 노출된다. 이미 캐시된 21장만 살아 있다.

### 5,000건이 소진된 경로 (검산 완료)

```
고유 캐시 키 = 36장 × 10 width = 약 290~360개
관측 5,000 transformations ÷ 290 ≈ 17 사이클/월
관측 62,000 cache write units ÷ (85 units/장 × 29장) ≈ 25 사이클/월
→ minimumCacheTTL 기본값 4시간(하루 최대 6사이클)과 일치
```

**기여도: TTL 4시간 기본값 약 95%.** ADR-049(7일, 2026-08-06 머지)로 이미 완화됐으나 근본 구조는 남아 있다.

### 구조적 낭비 4건

| # | 내용 | 근거 |
|---|---|---|
| ① | 원본보다 큰 width 까지 srcset 발행 → **바이트 동일한 결과물을 별도 과금** | 1162px 원본에서 `w=1200/1920/3840` 이 모두 97,058 B 동일 |
| ② | `src` fallback 이 항상 `w=3840` | 홈 12개 `<img src>` 전부 `w=3840`. 크롤러·SNS 스크래퍼는 이것만 받음 |
| ③ | 업로드 정규화 부재 — 사진을 PNG 로 저장 | 1162×863 사진이 **1,799 KB PNG**, 최대 **4,133 KB** |
| ④ | `sizes` 가 실제 열 수와 불일치 | `ArticleCard` 는 `100vw` 선언, 실제 640~1023 구간은 2열(≈50vw) |

루트 코즈는 `image-resize.ts:91` — `file.size <= 5MB && withinEdge` 이면 **아무 처리도 하지 않는다**. 1.8MB PNG 가 그대로 통과한 이유.

### 카카오톡 OG 상한 위반 (별개 발견)

`news/[id]/page.tsx:36-38,52` 가 `coverImageUrl` 을 `og:image` 로 직접 사용한다. 카카오톡 `og:image` 는 **용량 500KB 상한**이 있고 초과 시 이미지 없는 카드로 표시된다.

**현재 36장 중 24장(67%)이 500KB 초과** → 카카오톡 공유 썸네일이 누락되고 있을 가능성이 높다. `[확인 필요]` 500KB 는 2차 출처 기준, 카카오 공식 확정값 미검증.

## 채택안

**업로드 시 JPEG q75 / 긴 변 1440px 정규화 + `images.unoptimized: true` + 원본 별도 보관**

### 왜 WebP 가 아닌 JPEG 인가

ADR-046 이 WebP 통일을 의도적으로 거부했다 — 커버가 OG 썸네일로 직행하는데 카카오톡 스크래퍼의 WebP 지원이 보장되지 않는다. 이 결정은 유효하다. 측정상 **포맷보다 치수·품질이 지배적**이라 JPEG 를 써도 손해가 없다.

### 왜 1440px q75 인가 — 업계 조사 + 자체 실측

업계 기본값은 82 가 아니라 **75 근방**이고, 이미지가 본업인 서비스는 더 낮다:

| 서비스 | 기본 quality | 출처 |
|---|---|---|
| imgix | **75** (`auto=compress` 시 **45**) | 공식 문서 |
| Unsplash | **60** | 라이브 `srcset` 실측 |
| Next.js | **75** | 프레임워크 기본값 |
| WordPress | 82 | WP 4.5(2016), **고정 폭 파생본 전제** |

WordPress 의 82 는 `표시 폭 = 파일 폭` 인 구조에서 나온 값이라 우리처럼 표시보다 크거나 작은 폭을 주는 구조에는 맞지 않는다.

**Compressive Images 원리**(Daan Jobsis 2012 / Filament Group 검증) — *"JPEG 크기는 치수보다 압축률이 더 지배한다. 표시보다 크게 뽑고 강하게 압축한 쪽이 더 작으면서 더 선명할 수 있다."* 원문 실측: 400×300 q90 = 95KB vs 1024×768 q0 = 44KB.

**커버 36장으로 검증** (표시 1440px 기준, RMSE 낮을수록 원본에 가까움):

| 폭 | q | 평균 | 최대 | 500KB 초과 | RMSE |
|---|---|---|---|---|---|
| 원본 그대로 (현재) | — | 1,161 KB | 4,133 KB | 🔴 24장 | — |
| 1200 | 82 | 138 KB | 283 KB | ✅ 0장 | 9.97 |
| 1200 | 75 | 111 KB | 226 KB | ✅ 0장 | **10.20** |
| **1440** | **75** | **136 KB** | **329 KB** | ✅ **0장** | **5.37** |
| 1440 | 82 | 169 KB | 410 KB | ✅ 0장 | 4.56 |
| 1600 | 60 | 111 KB | 294 KB | ✅ 0장 | 6.15 |
| 1920 | 45 | 106 KB | 330 KB | ✅ 0장 | 6.30 |

두 가지가 드러났다:

1. **1200px 에는 품질의 벽이 있다** — q82(9.97)와 q75(10.20)의 왜곡이 사실상 같다. 1440 표시로 업스케일하는 손실이 지배적이라 품질을 올려도 개선되지 않는다. **1200px 에 q82 를 쓰는 것은 27KB(20%)를 버리는 것.**
2. **1440 q75(136KB/RMSE 5.37)가 1200 q82(138KB/RMSE 9.97)를 이긴다** — 더 작으면서 왜곡 46% 감소. 1920 이상은 표시가 1440 이라 다시 나빠진다(6.30).

→ **1440px q75 확정.** featured 카드가 wide(1440)에서 50vw ≈ 720px CSS → DPR 2 에서 정확히 1440px 이 필요하다.

> `[확인 필요]` RMSE 는 거친 지각 근사치다. SSIM/Butteraugli 가 정확하지만 9.97 대 5.37 격차는 방향을 뒤집을 수준이 아니다.

### 왜 원본을 보관하는가

조사 결과 **주요 플랫폼에 예외가 없다** — Cloudinary·imgix·Shopify 는 원본 영구 보관 + 파생본 온디맨드, WordPress 는 원본 보관 + 파생본 사전 생성. 표시 스펙은 반드시 바뀌기 때문이다(디자인 개편·새 디바이스·AVIF·인쇄 요청).

현재 파이프라인은 브라우저에서 2560px 로 깎아 **원본을 업로드 전에 버린다** — 업계 기준에서 이례적이다. R2 저장이 무료 10GB 의 1% 수준이라 보관하지 않을 이유가 없다.

### 왜 next/image 최적화를 버리는가

런타임 변환이 값어치를 하는 3조건 중 **해당하는 것이 0개**:

| 조건 | 이 프로젝트 |
|---|---|
| 원본 크기·포맷 통제 불가 | ❌ 어드민 단독 업로드 |
| 이미지 수천~수만 장 | ❌ 36장, 연 증가 100장 미만 |
| 대역폭이 비용 병목 | ❌ Fast Data 6.2 / 100 GB |

추가 이득:
- ADR-004 **긴급 내리기가 R2 삭제만으로 완결** (현재는 Vercel purge 병행 필요 — `next.config.ts` 주석)
- EC2 이전(E3안) 후 무수정 동작, 벤더 종속 제거

트레이드오프: 모바일 전송량 66 KB → 138 KB (장당 +72 KB). Fast Data 6.2 GB → 약 10 GB / 100 GB 로 여유.

## 실행 계획

### Phase 1 · 긴급 복구

- `next.config.ts` 에 `images.unoptimized: true`
- `minimumCacheTTL` / `remotePatterns` 는 **존치** (롤백 대비)
- 검증: `pnpm tsc` / `pnpm lint` / `pnpm test` / 빌드 산출 HTML 에 `_next/image` 0건 / 배포 후 36장 전수 200

> `unoptimized` 에서는 ADR-050 `remotePatterns` 화이트리스트가 작동하지 않는다. 다만 `news/actions.ts:18` 의 서버측 S3 prefix 검증이 이미 같은 역할을 하므로 보호 공백 없음.

### Phase 2 · 기존 36장 백필

`src/db/backfill-cover-normalize.ts` (`db:backfill-cover-dims` 선례) · `pnpm db:backfill-cover-normalize`

```
news.cover_image_url + popups.image_url 전수 조회
→ R2 GET
→ 원본을 <dir>/original/<파일명> 으로 복사 (이미 있으면 보존)
→ sharp: resize(1440, withoutEnlargement) → flatten(#fff) → jpeg(q75, mozjpeg) → 메타데이터 제거
→ 새 키 PUT: news/<id>/<새 uuid>.jpg
→ DB URL + 치수 갱신
```

| 결정 | 이유 |
|---|---|
| 덮어쓰기 ❌, **새 키** | CDN·카카오톡 스크래퍼 캐시 무효화 불필요. 롤백은 DB URL 만 되돌림. ADR-049 주석의 "키 고정 → stale" 회피 |
| **원본 `original/` 보관** | 업계 예외 없는 관행. 표시 스펙은 반드시 바뀐다 |
| 기존 객체 **미삭제** | 롤백 안전망. v1.1 orphan cleanup 대상에서 **제외** 필요 |
| **메타데이터 제거** | 현장 사진에 GPS·촬영기기 EXIF 잔존. ADR-004 개인정보 보호 |
| **치수도 갱신** | `cover_image_width/height` 를 안 바꾸면 마조네리·CLS 계산이 옛 비율로 어긋난다 |
| `--dry-run` 기본 | 실제 쓰기는 `--apply` 명시. 멱등성(이미 jpeg + ≤1440px + ≤450KB 면 skip) |
| 품질 사다리 75→68→60 | `COVER_TARGET_BYTES`(450KB) 초과 시에만 하강. 실측 최대 329KB 라 통상 1회 |

**프로덕션 적용 완료 (2026-08-08)** — 36건 · **41,474 KB → 4,792 KB (-88%)**, 평균 1,185 → 137 KB, 최대 328 KB.

검증:
- 멱등성 재실행 → 처리 0 / 스킵 36 ✅
- 라이브 커버 36건 전수 200 응답 ✅
- 카카오톡 500KB 초과 **0건** (최대 328KB, 마진 34%) ✅
- 원본 `original/` 보존 및 공개 접근 확인 ✅

> 멱등성 판정을 "규격 안에 든다"에서 **"재인코딩해도 이득이 없다(≥85%)"** 로 바꿨다. 초기 판정으로는 `jpeg 1440×1081 432KB` 같은 과품질 파일(q85~90 저장)이 규격 통과로 스킵돼 카카오톡 상한 코앞에 방치됐다. 바꾼 뒤 36건 전부 처리됐고, 2회차는 전건 스킵된다.
>
> `.env.prod.local` 은 Vercel 환경변수가 전부 `Sensitive`(non-readable) 라 `vercel env pull` 로 채울 수 없어 원천 대시보드(Neon·Cloudflare) 값으로 수동 작성했다. 백필 종료 후 삭제 대상.

### Phase 3 · 업로드 파이프라인 (재발 방지)

**루트 코즈**: `image-resize.ts:91` 이 `file.size <= 5MB && withinEdge` 면 **아무 처리도 하지 않는다.** 1.8MB PNG 가 그대로 올라간 이유.

✅ 완료

- `image-policy.ts`: `COVER_MAX_EDGE_PX = 1440` · `COVER_JPEG_QUALITY = 75` · `COVER_TARGET_BYTES = 450KB` · `COVER_QUALITY_LADDER` 추가. 사다리는 클라(canvas, /100)와 백필(sharp, 1~100)이 공유한다
- `image-resize.ts`: `prepareCoverForUpload()` 신규 — 크기 무관 **항상 재인코딩**, JPEG 강제, 흰 배경 flatten. `drawToCanvas` 에 `background` 선택 인자 추가(JPEG 는 알파가 없어 투명 영역이 검게 나온다)
- `CoverImageUploader.tsx`: 호출 함수만 교체
- 기존 `prepareImageForUpload()` 는 **본문 이미지용으로 무수정 유지** (본문은 2560px·원본 포맷이 여전히 타당)

**브라우저 실측으로 `[확인 필요]` 해소** — Chromium 에서 동일 파이프라인을 돌려 비교했다:

| 인코더 | 4080×3060 → 1440×1080 q75 |
|---|---|
| sharp (mozjpeg) | 221 KB |
| **Chromium canvas** | **260 KB (+18%)** |

canvas 가 18% 크지만 `COVER_TARGET_BYTES`(450KB)·카카오톡 상한(500KB) 대비 여유가 충분해 **quality 조정 불필요**. 환산하면 평균 약 160 KB / 최대 약 390 KB.

투명 PNG 업로드 시 결과물 모서리 픽셀이 `rgb(255,255,255)` 로 확인돼 흰 배경 합성도 정상 동작한다(검정 배경 회귀 없음).

> 단위 테스트는 두지 않았다 — `canvas.toBlob` 은 vitest jsdom 에 없어 재현이 불가능하고, 의미 없는 mock 어서션이 된다. 검증 앵커는 위 브라우저 하네스다.

### Phase 4 · 검증 + 문서

- 4-BP 육안 (375 / 768 / 1025 / 1440)
- **카카오톡 공유 미리보기 실측** — 새 커버 URL 썸네일 표시 확인
- Lighthouse LCP 전/후
- ADR-051 작성 (ADR-046·049·050 관계 명시), `next.config.ts` 주석 갱신
- `docs/TODO.md` 에 원본 아카이브 여부 escalation 등록

## 범위 제외 (의도적)

| 항목 | 이유 |
|---|---|
| 본문 인라인 이미지 | 이미 `<img>` raw 서빙이라 402 무관. 다만 5MB 게이트를 동일하게 통과 → **별도 후속** |
| `deviceSizes` / `sizes` 교정 (①②④) | `unoptimized` 에서 무의미 |
| 2단 srcset (800/1200 2벌) | 컴포넌트 3개가 `fill` 사용 → 4-BP 재검증 필요. 무중단 후속 추가 가능 |

## 리스크 & 롤백

| 리스크 | 대응 |
|---|---|
| 클라 canvas JPEG 품질 저하 | Phase 3 에서 실측 후 quality 조정. 최악 시 서버 경유 리사이즈 |
| PNG 투명 → JPEG 검정 배경 | `flatten({ background: '#fff' })` — Phase 2·3 양쪽 필수 |
| 백필 중 DB 갱신 실패 | dry-run → 1장 → 전체. 새 키라 기존 객체 무손상 |
| Fast Data Transfer 증가 | 6.2 → 약 10 GB / 100 GB |
| 되돌리고 싶어짐 | `unoptimized: false` 1줄. 정규화본은 next/image 입력으로도 더 좋음 (변환 입력 1.16MB → 138KB) |

## 미결

**프로덕션 백필 실행에 필요한 자격증명** — Neon `DATABASE_URL` + R2 `S3_*` + `NEXT_PUBLIC_S3_PUBLIC_URL`. `.vercel` 링크가 없어 `vercel env pull` 이 바로 되지 않는다. `vercel link` 후 pull 하거나 `.env.prod.local` 을 수동 작성한다(gitignore `.env*` 로 커밋 위험 없음).

**신규 업로드도 원본을 보관할 것인가** — 백필(Phase 2)은 기존 원본을 `original/` 로 보관하도록 확정했다. Phase 3 에서 신규 업로드도 같게 하려면 브라우저가 2벌(원본 2560px + 표시본 1440px)을 올려야 해 업로드 +2~3초 · presign 2회 · 부분 실패 처리가 붙는다. 업계 관행은 보관이지만, 사회공헌국이 촬영 원본을 자체 보관 중이면 불필요하다.

---

## TL;DR

- **문제**: Vercel 이미지 변환 5,000/월 초과 → 커버 36장 중 **15장(42%) 402**. 추가로 24장(67%)이 카카오톡 og:image 500KB 상한 초과.
- **원인**: `minimumCacheTTL` 4시간 기본값(기여도 95%) + 업로드 정규화 부재(`image-resize.ts:91` 이 5MB 이하를 무처리 통과) + 원본 초과 width srcset 발행.
- **채택안**: 업로드 시 **JPEG q75 / 긴 변 1440px** 정규화 + `images.unoptimized: true` + 원본 `original/` 보관. WebP 는 ADR-046(카카오톡 스크래퍼 호환)에 따라 제외. 1440 q75(136KB/RMSE 5.37)가 1200 q82(138KB/RMSE 9.97)보다 **작으면서 46% 선명** — 표시보다 작은 폭은 업스케일 손실이 지배해 품질을 올려도 개선되지 않는다(compressive images). imgix·Next.js 기본값도 75.
- **파일**: `next.config.ts` · `src/db/backfill-cover-normalize.ts`(신규) · `src/features/storage/image-policy.ts` · `src/features/storage/image-resize.ts` · `src/admin/components/CoverImageUploader.tsx`
- **검증**: `pnpm tsc && pnpm lint && pnpm test` · 빌드 HTML 에 `_next/image` 0건 · 배포 후 커버 36장 전수 200 · 카카오톡 공유 썸네일 실측 · 4-BP 육안
- **폴백**: `unoptimized: false` 1줄 복귀. 백필은 새 키에 쓰고 기존 객체를 보존하므로 DB URL 롤백만으로 원복.
