---
status: active
opened: 2026-08-08
branch: feat/body-image-normalize
slice_id: TASK-20260808-body-image-normalize
spec_status: confirmed
brainstorming_done: 2026-08-08
related_adr:
---

# 본문 인라인 이미지 정규화 (ADR-051 후속)

커버는 ADR-051 로 정리했지만 **본문 인라인 이미지는 손대지 않았다.** 실측 결과 커버보다 22배 큰 문제다.

## 배경 — 실측

| | 커버 (완료) | **본문 (이번 범위)** |
|---|---|---|
| 이미지 수 | 36개 | **151개** (news 143 + notices 8) |
| 총 용량 | 41.5 MB → 4.8 MB | **110.8 MB** |
| 평균 | 137 KB | **763 KB** |
| 최대 | 328 KB | **3,442 KB** |

가장 무거운 글(`8d09db9f`)을 모바일 375 에서 끝까지 스크롤한 실제 네트워크 기록:

```
본문 이미지 5장    9,744 KB
관련글 커버 3장       686 KB   (ADR-051 로 이미 정규화됨)
────────────────────────────
합계             10,431 KB   ← LTE 20Mbps 기준 약 4초
```

`loading="lazy"` 는 **읽는 사람에게는 도움이 안 된다.** 초기엔 4장만 받지만 문서 높이가 6,948px(모바일 8~9화면)이라 끝까지 읽으면 전부 내려받는다. 이탈하는 사람만 절약된다.

**루트 코즈는 커버와 동일하다** — `image-resize.ts:91` 의 `file.size <= MAX_IMAGE_BYTES && withinEdge` 게이트가 5MB 이하를 무처리 통과시킨다. 커버는 `prepareCoverForUpload()` 로 우회했지만 본문은 여전히 `prepareImageForUpload()` 를 쓴다.

## 채택안

**JPEG q75 / 긴 변 1810px + 투명도 기반 스킵**

### 왜 1810px 인가

본문 컨테이너 폭 (`news/[id]/page.tsx:111`):

```
모바일  full-width - px-4
md      648px
lg+     905px   ← 최대
```

이미지 표시 폭 분포(프로덕션 실측):

```
width 속성 있음  38개 : 최소 71 / 중앙 461 / 상위10% 666 / 최대 762
width 속성 없음 105개 (73%) : max-w-full → 컨테이너 폭(905px)까지 확장
```

73% 가 컨테이너 폭까지 늘어나므로 **905 × DPR 2 = 1810px** 이 retina 정확값이다. 커버(1440px)와 같은 논리 — 표시에 필요한 픽셀에 정확히 맞춘다.

### 왜 WebP 가 아닌가

초기에 "투명 이미지가 52% 라 WebP(알파 보존)가 필수" 라고 판단했으나 **오판이었다.** 알파 채널 존재 여부만 봤고, 실제 투명 픽셀 비율을 재지 않았다.

전수 재측정:

| 투명 픽셀 비율 | 개수 | 합계 용량 |
|---|---|---|
| 0% (불투명) | 122개 | 110,792 KB |
| 0~1% (가장자리 잡음) | 1개 | — |
| **10% 이상 (진짜 투명 배경)** | **17개** | **229 KB (전체의 0.2%)** |

투명 이미지는 전부 로고·아이콘류(9~26 KB)로 이미 충분히 작다. **WebP 로 얻는 이득이 전체의 0.2% 범위** 안에 있어, 그것 때문에 커버(JPEG)와 파이프라인을 둘로 나눌 이유가 없다.

### 스킵 규칙 2가지

```
① 투명 픽셀 10% 이상  → 스킵 (흰 배경 합성 시 라벤더 그라데이션 위에 흰 박스)
② 재인코딩 이득 15% 미만 → 스킵 (커버에서 이미 쓰는 멱등성 룰)
```

①이 별도로 필요한 이유: 11 KB 투명 PNG 를 JPEG 로 바꾸면 3 KB(이득 78%)라 ②만으로는 안 걸린다. 상세 페이지 배경에 `bg-gradient-to-b from-white to-[#F9F4FF]/80` (`page.tsx:109`)이 있어 흰색 합성이 보인다.

**전수 실측 효과: 111 MB → 16.7 MB (-85%)**

## 실행 계획

### Phase 1 · 업로드 파이프라인 (재발 방지)

`prepareImageForUpload()` 는 커버 분리 후 **본문 전용**이고 호출처가 1곳이다.

```
editor-image-upload.ts:36  ← 유일한 호출처
  └ simple-editor.tsx        (기본 드롭존)
  └ image-row-button.tsx     (나란히 2장 넣기)
```

- `image-policy.ts`: `BODY_MAX_EDGE_PX = 1810` · `BODY_JPEG_QUALITY = 75` · `TRANSPARENT_PIXEL_SKIP_RATIO = 0.1`
- `image-resize.ts`: `prepareImageForUpload()` 를 크기 무관 항상 재인코딩으로 변경 + 투명도 스킵
- 브라우저 투명도 판정 — sharp 를 못 쓰므로 canvas `getImageData` 샘플링

### Phase 2 · 기존 151개 백필

`src/db/backfill-body-images.ts`

```
news.body + notices.body 재귀 순회 (Tiptap JSON)
→ 이미지 src 수집 → R2 GET
→ 스킵 판정(투명 10%+ / 이득 15% 미만)
→ 원본 <dir>/original/ 보존
→ sharp 1810px JPEG q75 → 새 키 PUT
→ body JSONB 재작성 (글 단위 트랜잭션)
```

**되돌리기 설계 — 커버와 다른 핵심**

커버는 URL 컬럼 하나라 롤백이 쉬웠지만 본문은 문서 전체를 다시 쓴다. 완전 복구를 위해:

| 장치 | 내용 |
|---|---|
| **body 백업 파일** | `--apply` 시 건드릴 모든 행의 원본 `body` 를 `backup/body-backup-<ISO>.json` 에 먼저 기록 |
| **`--rollback <file>`** | 백업 파일로 `body` 를 그대로 복원 |
| 새 키 write | 기존 객체 미삭제 |
| `original/` 보존 | 원본 영구 보관 |
| 글 단위 트랜잭션 | 한 글의 이미지 일부만 성공하는 상태 방지 |

### Phase 3 · 검증

- `pnpm tsc` / `lint` / `test`
- 브라우저 하네스로 canvas 투명도 판정 + 인코딩 결과 확인
- dry-run → `--limit 1` → 육안 → 전체
- 본문 렌더 4-BP + 에디터 재편집 정상 동작
- 나란히 2장 배치 유지 확인

## 범위 제외

| 항목 | 이유 |
|---|---|
| 커버 이미지 | ADR-051 로 완료 |
| 응답·디코드 실패 11개 | 백필 이전부터 존재하던 별건. 스킵하고 `docs/TODO.md` 에 등록 |
| 외부 호스트 URL 10개 | 우리 스토리지가 아님 |

## 리스크

| 리스크 | 대응 |
|---|---|
| **body JSONB 재작성 실패 → 본문 손상** | 백업 파일 + `--rollback` + 글 단위 트랜잭션 + dry-run |
| 투명 로고가 흰 박스로 | 투명 10%+ 스킵 (17개 대상) |
| 브라우저 canvas 인코딩 품질 | 커버에서 sharp 대비 +18% 확인됨. 상한 여유 있어 무영향 |
| 에디터 재편집 충돌 | 없음 — `src` 만 바뀌고 `attrs.width`·문서 구조 그대로 |

---

## TL;DR

- **문제**: 본문 인라인 이미지 151개 = **110.8 MB**(평균 763 KB, 최대 3,442 KB). 가장 무거운 글은 모바일에서 **10.4 MB** 다운로드. `loading="lazy"` 는 끝까지 읽는 사람에겐 무효.
- **원인**: 커버와 동일 — `image-resize.ts:91` 이 5MB 이하를 무처리 통과.
- **채택안**: **JPEG q75 / 긴 변 1810px**(컨테이너 905 × DPR 2) + **투명 10%+ 스킵** + 이득 15% 미만 스킵. WebP 는 이득이 전체의 0.2% 라 제외 — 커버와 같은 파이프라인 유지.
- **효과**: 111 MB → **16.7 MB (-85%)**. 최악 글 10.4 MB → 약 1.6 MB.
- **파일**: `src/features/storage/image-policy.ts` · `image-resize.ts` · `src/db/backfill-body-images.ts`(신규)
- **검증**: `pnpm tsc && lint && test` · 브라우저 하네스 · dry-run → 1건 → 전체 · 본문 4-BP 렌더 · 에디터 재편집
- **폴백**: `backup/body-backup-<ISO>.json` + `--rollback <file>` 로 `body` 완전 복원. 이미지는 새 키에 쓰고 원본을 `original/` 에 보존하므로 파일도 무손실.
