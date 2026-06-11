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

- [ ] **P1 패키지** — @tiptap/* v2 제거 → v3 추가(react·starter-kit·extension-image/list/text-style/text-align/typography/highlight/subscript/superscript/youtube·extensions·pm), `sass` 추가. tsc 깨지는 지점 확인.
- [ ] **P2 컴포넌트 이식** — sandbox `src/components/tiptap-*`·`hooks`·`lib`·`styles` → 앱 `src/` 이식(`@/` alias 정합). SCSS 빌드 통과(globals 충돌 없음).
- [ ] **P3 에디터 배선** — simple-editor + 글자크기 + 유튜브 컴포넌트 이식. `handleImageUpload` → R2. NewsEditor 가 새 에디터 사용(onChange JSON 유지).
- [ ] **P4 렌더러/보안 재작성** — news-body-renderer·sanitize·editor-allowlist·excerpt 를 v3 스키마로. 유튜브·글자크기·task/첨자 반영, 표·글자색·figure 는 graceful drop.
- [ ] **P5 통합** — 서버액션($T 직렬화 유지), 편집 페이지, 발행/조회 경로.
- [ ] **P6 검증** — pnpm tsc/lint/test/build + dev 발행·조회 수동 확인. PR.

## 리스크

- SCSS in Next 16 (전역 reset 충돌) — 컴포넌트 SCSS 는 클래스 스코프라 안전, index.scss reset 만 생략/스코프.
- 발행글 v2 JSON 호환 — 렌더러 graceful (미지원 노드는 빈/텍스트 폴백).
- "use client" 경계 — 에디터는 client, 렌더러는 server.
- React 19 ↔ 공식(18 타입) — 동작 호환, 타입 경고 시 보정.
