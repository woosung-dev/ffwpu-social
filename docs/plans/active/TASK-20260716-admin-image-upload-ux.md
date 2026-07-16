---
status: active
opened: 2026-07-16
branch: feat/admin-image-upload-ux
slice_id: TASK-20260716-admin-image-upload-ux
spec_status: confirmed
brainstorming_done: 2026-07-16
related_adr: 0046-image-upload-source-ceiling-and-client-resize
---

# 어드민 이미지 업로드 UX — 실패 노출(①) + 업로드 전 자동 리사이즈(②)

## 문제

운영자가 어드민 에디터에서 봉사 현장 사진을 넣으면 **아무 일도 일어나지 않는다.** 콘솔에만 다음이 찍힌다.

```
installHook.js:1 Upload failed: Error: File size exceeds maximum allowed (5MB)
    at r (...) at Array.map (<anonymous>) at uploadFiles (...)
```

## 원인 (확인 완료)

### 직접 원인 — 5MB 클라이언트 사전검증

1. `src/lib/tiptap-utils.ts:5` — `MAX_FILE_SIZE = 5 * 1024 * 1024`
2. `src/components/tiptap-templates/simple/simple-editor.tsx:300` — `ImageUploadNode.configure({ maxSize: MAX_FILE_SIZE })`
3. `src/components/tiptap-node/image-upload-node/image-upload-node.tsx:89` — `if (file.size > options.maxSize)` → Error 생성 후 **즉시 return**

presign 요청조차 발생하지 않는다. 서버·R2 무관.

### 진짜 원인 3가지

| # | 원인 | 근거 |
|---|---|---|
| A | **실패가 콘솔에만 찍힘** | `simple-editor.tsx:303` `onError: (error) => console.error("Upload failed:", error)` — 토스트·UI 표시 없음 |
| B | **에러 상태 UI 조차 렌더 안 됨** | 크기 검증(`image-upload-node.tsx:89`)이 `setFileItems`(108)보다 **먼저** return → 실패 파일이 목록에 안 올라감. 운영자 화면엔 드롭존만 그대로 |
| C | **리사이즈·압축이 전혀 없음** | `editor-image-upload.ts` 가 원본 `File` 을 그대로 R2 에 PUT. `readImageDimensions` 는 치수만 읽고 변환 안 함 |

*[가정]* 스마트폰·카메라 원본 사진은 5~15MB 가 흔하다. 봉사 현장 사진을 그대로 올리는 운영 특성상 이 에러는 우연이 아니라 **상시 발생**.

### 5MB 는 기술 제약이 아니라 정책값

- 근거는 ADR-017, 문서에 *"보수적, 조정 가능"* 이라 명시.
- 업로드는 브라우저 → R2 presigned PUT **직송** → Vercel 4.5MB body 제한과 무관. Server Action 은 `filename`/`mime`/`size` 메타데이터만 주고받는다.
- 같은 공지 작성 화면에서 문서 첨부는 20MB(ADR-041)인데 본문 이미지만 5MB — 운영자 입장에서 비대칭.

### 부수 확인

- `src/lib/tiptap-utils.ts:289` `handleImageUpload` 는 **어디서도 import 안 되는 tiptap 데모 잔재**인데 `:301` 에서 동일 문구를 던진다. 향후 디버깅 혼선 요인 (본 작업 범위 밖 — 기존 dead code 는 요청 없이 건드리지 않음).
- `image-upload-node.tsx` / `tiptap-utils.ts` 는 커밋이 벤더링 1회(#52)뿐인 **원본 그대로**. `simple-editor.tsx` 는 4회 수정된 우리 설정 지점 → **벤더 파일은 건드리지 않고 설정 지점에서 해결**하는 것이 이 레포 관례.

## 채택안 — ①+② (사용자 선택, 범위 = 본문 + 커버)

### 설계 결정

| # | 결정 | 왜 |
|---|---|---|
| D1 | 리사이즈 삽입 지점 = **`makeBodyImageUploader`** | 드롭존(ImageUploadNode)과 "2장 나란히"(ImageRowButton) **두 진입점의 공통 길목**. 한 곳 수정으로 둘 다 커버 |
| D2 | `maxSize` = **원본 허용 상한 30MB** (5MB 아님) | 벤더 게이트(`image-upload-node.tsx:89`)가 리사이즈보다 **먼저** 돈다. 5MB 로 두면 12MB 사진은 리사이즈 시도조차 못 함. 30MB 초과는 디코드 자체가 OOM/멈춤 위험이라 거부 유지 |
| D3 | 정책 상수는 **순수 모듈** `src/features/storage/image-policy.ts` | `upload.ts` 는 `@/lib/s3`(aws-sdk·node:crypto) 의존이라 클라 import 불가 → 현재 `tiptap-utils.ts` 에 5MB 가 **중복 선언**돼 drift 위험. `attachment-policy.ts` 선례 그대로 (배럴 `index.ts` 는 `server-only` — 순수 모듈은 클라가 직접 import) |
| D4 | 재인코딩 포맷 = **webp** (필요 시에만) | 허용 MIME + 알파 지원 + quality 노브 + jpeg 대비 압축 우위. **분기 없는 단일 경로**. `canvas.toBlob` 은 미지원 시 spec 상 png 로 조용히 폴백 → 결과 `blob.type` 을 신뢰하고 확장자를 거기서 파생 |
| D5 | **이미 작으면 무손실 통과** | `size ≤ 5MB && 긴 변 ≤ 2560px` → 원본 그대로. 불필요한 세대 손실 방지 |
| D6 | 긴 변 상한 **2560px** | 본문 이미지는 공개 페이지에서 next/image 를 안 거치고 raw `<img>` 로 나간다 → 저장 크기 = 전송 크기. 최대 표시폭(~800px)의 2배 + 여유 |
| D7 | 영문 에러 → 한국어 매핑을 **`image-policy.ts`** 에 | 벤더 파일을 수정하지 않기 위한 경계. 순수 함수라 node 환경 vitest 로 단위 테스트 가능 |

### 흐름

```
파일 선택
  → [벤더 게이트] size > 30MB ? → 영문 Error → toKoreanUploadError → toast.error  ← ①
  → [우리 uploader] prepareImageForUpload(file)                                    ← ②
       ├ 허용 MIME 아님 → 통과 → 서버가 한국어로 거부 → toast                      ← ①
       ├ size ≤ 5MB && 긴 변 ≤ 2560 → 원본 그대로 (무손실)
       └ 그 외 → decode → 2560 맞춰 축소 → webp quality [0.85, 0.72, 0.6] 사다리
                  └ 그래도 5MB 초과 → 한국어 throw → toast                        ← ①
  → presign(서버가 5MB·MIME 독립 재검증) → R2 PUT
```

## 파일

| 파일 | 변경 |
|---|---|
| `src/features/storage/image-policy.ts` | **신규** — 순수 정책 SSOT (`MAX_IMAGE_BYTES` / `MAX_SOURCE_IMAGE_BYTES` / `MAX_IMAGE_EDGE_PX` / `ALLOWED_IMAGE_MIME` / `isAllowedImageMime` / `fitWithinMaxEdge` / `toKoreanUploadError`) |
| `src/features/storage/image-resize.ts` | **신규** — 브라우저 전용 `prepareImageForUpload` |
| `src/features/storage/image-policy.test.ts` | **신규** — 순수 로직 단위 테스트 |
| `src/features/storage/upload.ts` | 상수·MIME 판정을 `image-policy` 에서 import (중복 선언 제거) |
| `src/features/storage/index.ts` | 배럴 재export 출처를 `./image-policy` 로 |
| `src/features/storage/upload.test.ts` | import 경로 정정 + `isAllowedImageMime` 테스트를 `image-policy.test.ts` 로 이관(함수를 따라감) |
| `src/admin/components/editor-image-upload.ts` | PUT 전 `prepareImageForUpload` 삽입 |
| `src/components/tiptap-templates/simple/simple-editor.tsx` | `maxSize` → 원본 상한 · `onError` → `toast.error(toKoreanUploadError(e))` |
| `src/admin/components/CoverImageUploader.tsx` | `prepareImageForUpload` 삽입 (dims 는 리사이즈 **후** 파일에서 캡처) + 안내 문구 |
| `docs/decisions.md` | ADR-046 추가 (ADR-017 사이즈 계약 개정) |

**스키마 변경 0 · 마이그레이션 0.**

### 구현 중 바뀐 결정

- **`src/lib/tiptap-utils.ts` 는 손대지 않는다** (계획 단계에선 `MAX_FILE_SIZE` 를 재export 로 바꾸려 했음).
  거기 `MAX_FILE_SIZE` 는 미사용 데모 잔재 `handleImageUpload` 와 한 묶음인 **벤더 원본**이라, 우리 설정 지점
  (`simple-editor.tsx`)에서 `image-policy` 를 직접 import 하는 쪽이 "벤더 무수정" 관례와 일관된다.
  결과적으로 5MB 중복 선언은 살아있는 경로에서 제거됐고(`upload.ts` → `image-policy`), 벤더 잔재는 그대로 둔다.
- **`toKoreanUploadError` 는 `editor-image-upload.ts` 재export 없이** `image-policy.ts` 에서 직접 import.
  `editor-image-upload.ts` 는 server action 을 import 해 node 환경 단위 테스트가 어렵다 — 순수 모듈에 두는 편이 테스트 가능.
- **커버 업로더 안내 문구 동반 수정** (계획에 없던 항목). 자동 축소 도입 후 "최대 5MB" 는 거짓이자 위축 문구 —
  운영자가 큰 사진을 아예 안 올리게 만들어 ② 의 목적을 무력화한다.

## 검증 — 전부 통과 (2026-07-16)

| # | 항목 | 결과 |
|---|---|---|
| 1 | `pnpm tsc --noEmit` | **0** |
| 2 | `pnpm lint` | **0** |
| 3 | `pnpm test` | **115 통과** (기존 103 + 신규 12) |
| 4 | 커버 업로드 (13.91MB / 4000×3000 JPEG) | → **2.79MB / 2560×1920 webp** · `Content-Type: image/webp` (키 확장자 일치) |
| 5 | 드롭존 본문 업로드 (동일 원본) | → **2.79MB / 2560×1920 webp** |
| 6 | "2장 나란히" (13.91MB ×2) | → **둘 다 webp**, 한 문단 안에 정상 삽입 |
| 7 | 작은 이미지(800×600) 무손실 통과 | → **SHA256 동일**, `.jpg` 유지 = 재인코딩 안 함 |
| 8 | `.gif` | → 토스트 **"허용되지 않은 이미지 형식: image/gif (JPG/PNG/WEBP 만)"** (과거엔 침묵) |
| 9 | 84MB JPEG (원본 상한 초과) | → 토스트 **"원본 이미지가 너무 큽니다. 30MB 이하 파일로 올려주세요."** ← 원래 증상과 동일 경로 |
| 10 | 드롭존 안내 문구 | `Maximum 3 files, 30MB each.` (5MB → 30MB 반영 확인) |
| 11 | 발행 → 공개 상세 렌더 | 본문 webp 2장 **HTTP 200 · naturalWidth 2560 · 콘솔 에러 0** |

> 검증용 임시글·객체는 로컬 DB/MinIO 에서 삭제 완료. 노이즈 이미지(압축 최악 조건)로 2.79MB 이므로 실제 사진은 더 작다.

### 검증 중 발견한 별건 (본 작업 범위 밖)

- `/admin/news/new` **하이드레이션 미스매치** — 발행 일시 피커가 서버 `오전 9:40` vs 클라 `AM 9:40` 로 갈린다.
  ADR-045 Consequences 의 후속 ⓑ(`KpiEditor.tsx:49` `toLocaleString` 시간대) 와 **동일 계열**. `timeZone`/`hour12` 명시로 해소 가능.
  본 브랜치와 무관하므로 건드리지 않음 → `docs/TODO.md` 로 이관.

## 범위 밖 (후속 `docs/TODO.md`)

- **HEIC 미지원** — `accept="image/*"` 라 아이폰 HEIC 선택은 되지만 허용 MIME 이 아니라 서버가 거부. ①로 이제 한국어 토스트는 보인다. 자동 변환은 브라우저별 디코드 편차(Chrome 디코드 불가)로 별도 판단 필요.
- `ImageRowButton` 의 `window.alert` → toast 통일 (동작은 하므로 인접 코드 개선 자제, §3 Surgical).
- `tiptap-utils.ts:289` `handleImageUpload` dead code 제거.
- 기존 업로드된 대용량 이미지 소급 최적화.

---

## TL;DR

- **문제**: 어드민 에디터 이미지 업로드가 조용히 실패. 콘솔에만 `File size exceeds maximum allowed (5MB)`.
- **원인**: (직접) 5MB 클라 사전검증 `image-upload-node.tsx:89`. (진짜) ⓐ `onError` 가 `console.error` 뿐 ⓑ 크기 검증이 `setFileItems` 보다 먼저 return 해 에러 UI 조차 없음 ⓒ 리사이즈 없이 원본 PUT. 5MB 는 ADR-017 **정책값**이지 기술 제약 아님(R2 직송이라 Vercel 4.5MB 무관).
- **채택안**: ① `onError` → 한국어 `toast.error` ② `makeBodyImageUploader`(두 진입점 공통 길목) + `CoverImageUploader` 에 업로드 전 자동 리사이즈. `maxSize` 는 **원본 상한 30MB** 로 올려 벤더 게이트가 리사이즈보다 먼저 자르는 것을 방지. 5MB **저장 상한은 유지**.
- **파일**: `image-policy.ts`(신규 순수 SSOT) · `image-resize.ts`(신규) · `editor-image-upload.ts` · `simple-editor.tsx` · `CoverImageUploader.tsx` · `upload.ts`/`index.ts`/`tiptap-utils.ts`(5MB 중복 선언 제거) · ADR-046.
- **검증**: tsc0 · lint0 · test(103+신규) · 8MB 사진 3경로 실측 · 공개 렌더.
- **폴백**: 전부 클라이언트 경로 변경 — 스키마·마이그레이션 0. 문제 시 커밋 revert 로 즉시 원복.
