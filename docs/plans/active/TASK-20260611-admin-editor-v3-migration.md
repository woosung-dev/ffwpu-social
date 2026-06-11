---
status: active
opened: 2026-06-11
branch: feat/admin-editor-v3-migration
slice_id: TASK-20260611-admin-editor-v3-migration
spec_status: confirmed
brainstorming_done: 2026-06-11
---

# 어드민 본문 에디터 Tiptap v2 → v3 공식 simple-editor 전면 교체

> 사용자 결정: 공식 simple-editor(v3) 로 전면 교체. sandbox(PR #50)에서 스펙 확정 후 진행.

## 확정 스펙

- **베이스**: 공식 Tiptap `simple-editor` (`ueberdosis/tiptap-ui-components` apps/web) 소스 그대로 이식.
- **추가**: 글자 크기(`TextStyleKit.fontSize` + `FontSizeDropdownMenu`), 유튜브(`@tiptap/extension-youtube` + `YoutubeButton`).
- **제외(기능 축소 수용)**: 표, 글자색(텍스트 컬러), 이미지 캡션/폭.
- **이미지**: 공식 `ImageUploadNode` → 우리 R2(`uploadImageAction` presigned PUT) 배선.
- **발행글 호환**: graceful — 렌더러가 옛 v2 노드(표·youtube·figure)를 만나도 안 깨지게 처리. (시드 본문 table/youtube/image 노드 0, 프로덕션 샘플 소식 제외 → 호환 부담 작음.)

## 통합 사실 (조사 완료)

- 공식 컴포넌트는 `tiptap-*` 자체 SCSS만 사용 → Tailwind 유틸 의존 없음. 클래스 스코프라 앱 Tailwind v4 와 충돌 낮음. `index.scss` 의 전역 reset 부분만 주의(앱 preflight 가 이미 커버 → 생략/스코프).
- 앱: Next 16 + Tailwind v4, sass 미설치 → `sass` 추가 필요.
- 이미지 업로드 = `lib/tiptap-utils.ts` `handleImageUpload(file,onProgress?,abortSignal?)→url` (현재 데모) 를 R2 로 교체.
- v3 영향 파일(현행): TiptapEditor·NewsEditor·news-body-renderer·sanitize·editor-allowlist·excerpt(×2)·edit page.

## 체크리스트 (단계별 커밋)

- [x] **P1 패키지** — @tiptap/* v2→v3.26.0(color·table 제거, list/typography/첨자/horizontal-rule/extensions 추가, youtube v3), UI 의존성(floating-ui·radix dropdown/popover·react-hotkeys·lodash) + sass. clean install.
- [x] **P2 컴포넌트 이식** — 공식 141파일 → 앱 `src/`(`@/`=src 정합). 이식 컴포넌트 tsc 에러 0. SCSS 는 CSS변수(var(--tt-*)) 방식이라 Tailwind 충돌 없음.
- [x] **P3 에디터 배선** — SimpleEditor props 화(defaultValue/onChange/scope/editable). ImageUploadNode.upload → makeBodyImageUploader(R2 presigned PUT). NewsEditor 교체. 구 v2 에디터 삭제. SCSS 전역 토큰 로드.
- [x] **P4 렌더러/sanitize v3 (가산)** — sup/sub·taskList·taskItem·codeBlock·heading4 추가, highlight var→hex 해석. 표·글자색·figure·youtube 유지(옛 발행글 graceful). 단위테스트 54 통과.
- [x] **P5 통합** — 서버액션·편집/조회 페이지는 body 가 opaque JSON 이라 무변경. next build 가 /admin/news/new·[id]/edit·/news/[id] 전부 프리렌더 성공으로 검증.
- [x] **P6 검증** — tsc·lint·test(54)·**next build(20/20 페이지)** 전부 그린. 남은 것: 브라우저 런타임(편집·발행·조회) 수동 확인.

## 리스크

- SCSS in Next 16 (전역 reset 충돌) — 컴포넌트 SCSS 는 클래스 스코프라 안전, index.scss reset 만 생략/스코프.
- 발행글 v2 JSON 호환 — 렌더러 graceful (미지원 노드는 빈/텍스트 폴백).
- "use client" 경계 — 에디터는 client, 렌더러는 server.
- React 19 ↔ 공식(18 타입) — 동작 호환, 타입 경고 시 보정.
