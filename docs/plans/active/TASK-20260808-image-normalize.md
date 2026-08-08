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

**업로드 시 JPEG q82 / 긴 변 1200px 정규화 + `images.unoptimized: true`**

### 왜 WebP 가 아닌 JPEG 인가

ADR-046 이 WebP 통일을 의도적으로 거부했다 — 커버가 OG 썸네일로 직행하는데 카카오톡 스크래퍼의 WebP 지원이 보장되지 않는다. 이 결정은 유효하다.

측정 결과 **포맷보다 치수가 지배적**이라 JPEG 를 써도 손해가 없다:

| 설정 | 평균 | 최대 | 500KB 초과 |
|---|---|---|---|
| 원본 그대로 (현재) | 1,161 KB | 4,133 KB | 🔴 24장 |
| JPEG q82 1600px | 189 KB | 509 KB | 🔴 1장 |
| **JPEG q82 1200px** | **138 KB** | **283 KB** | ✅ **0장** |
| WebP q80 1600px | 168 KB | 589 KB | (OG 비호환) |

1200px 확정 이유: 카카오톡 상한 안전 마진 44%, `og:image` 선언값(1200×630)과 정합, 표시 최대폭(featured ≈720px) 대비 충분.

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

`src/db/backfill-cover-normalize.ts` (`db:backfill-cover-dims` 선례)

```
news.cover_image_url + popups.image_url 전수 조회
→ R2 GET
→ sharp: resize(1200, withoutEnlargement) → flatten(#fff) → jpeg(q82, mozjpeg) → EXIF strip
→ 새 키 PUT: news/<id>/<새 uuid>.jpg
→ DB URL 갱신 (트랜잭션)
```

| 결정 | 이유 |
|---|---|
| 덮어쓰기 ❌, **새 키** | CDN·카카오톡 캐시 무효화 불필요. 롤백은 DB URL 만 되돌림. ADR-049 주석의 "키 고정 → stale" 회피 |
| 기존 객체 **보존** | 롤백 안전망 + 아카이브. v1.1 orphan cleanup 대상에서 **제외** 필요 |
| **EXIF strip** | 현장 사진에 GPS·촬영기기 잔존. ADR-004 개인정보 보호 |
| `--dry-run` 기본 | 실제 쓰기는 `--apply` 명시. 멱등성(이미 jpg + ≤1200 + ≤400KB 면 skip) |

### Phase 3 · 업로드 파이프라인 (재발 방지)

- `image-policy.ts`: `COVER_MAX_EDGE_PX = 1200`, `COVER_JPEG_QUALITY = 0.82` 추가
- `image-resize.ts`: `prepareCoverForUpload()` 신규 — 크기 무관 **항상 재인코딩**, JPEG 강제, 흰 배경 flatten
- `CoverImageUploader.tsx`: 호출 함수만 교체
- 기존 `prepareImageForUpload()` 는 **본문 이미지용으로 무수정 유지** (본문은 2560px·원본 포맷이 여전히 타당)

> `[확인 필요]` 브라우저 canvas JPEG 인코더는 sharp/mozjpeg 보다 품질이 낮다. 위 138 KB 는 sharp 기준이므로 실제 업로드 1장으로 재측정 후 quality 조정 필요.

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

## 미결 — 사회공헌국 확인 필요

**활동 사진 원본을 따로 보관하고 있는가?**

- 보관 중 → A안: 신규 업로드는 정규화본 1벌만
- 미보관 → B안: `news/<id>/original/<uuid>.jpg` 로 2560px 보관본 병행 (R2 무료 10GB 의 1.2% 수준이라 저장 비용은 사실상 0. 실제 비용은 업로드 +2~3초 · 부분 실패 처리)

Phase 1·2 는 이 결정과 무관하게 진행 가능. Phase 3 전까지 확정 필요.

---

## TL;DR

- **문제**: Vercel 이미지 변환 5,000/월 초과 → 커버 36장 중 **15장(42%) 402**. 추가로 24장(67%)이 카카오톡 og:image 500KB 상한 초과.
- **원인**: `minimumCacheTTL` 4시간 기본값(기여도 95%) + 업로드 정규화 부재(`image-resize.ts:91` 이 5MB 이하를 무처리 통과) + 원본 초과 width srcset 발행.
- **채택안**: 업로드 시 **JPEG q82 / 긴 변 1200px** 정규화 + `images.unoptimized: true`. WebP 는 ADR-046(카카오톡 스크래퍼 호환)에 따라 제외 — 측정상 1200px JPEG(138KB)가 1600px WebP(168KB)보다 작아 손해 없음.
- **파일**: `next.config.ts` · `src/db/backfill-cover-normalize.ts`(신규) · `src/features/storage/image-policy.ts` · `src/features/storage/image-resize.ts` · `src/admin/components/CoverImageUploader.tsx`
- **검증**: `pnpm tsc && pnpm lint && pnpm test` · 빌드 HTML 에 `_next/image` 0건 · 배포 후 커버 36장 전수 200 · 카카오톡 공유 썸네일 실측 · 4-BP 육안
- **폴백**: `unoptimized: false` 1줄 복귀. 백필은 새 키에 쓰고 기존 객체를 보존하므로 DB URL 롤백만으로 원복.
