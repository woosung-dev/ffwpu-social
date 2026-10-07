// 공개 사이트 핵심 흐름 — 홈 → 소식 목록 → 상세 → 공감 토글, 공지 목록 + 예외(잘못된 글 주소)
import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";

// 홈 팝업(운영자 등록 시 노출)이 클릭을 가리지 않도록 닫는다 — 없으면 아무것도 안 함
async function dismissPopup(page: Page) {
  const dialog = page.getByRole("dialog");
  if (await dialog.isVisible().catch(() => false)) {
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  }
}

test("홈 — 히어로·KPI·소식 섹션 렌더", async ({ page, guard }) => {
  // [기존 결함] 홈 prod 빌드 hydration 불일치 — main 에서도 5/5 재현, dev 미재현. docs/TODO.md 추적, 수정 시 이 허용 제거
  guard.allow(/Minified React error #418/);
  await page.goto("/");
  await dismissPopup(page);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#kpi")).toBeAttached();
  await expect(page.locator("#stories")).toBeAttached();
});

test("소식 목록 → 상세 → 공감 토글(누름·취소)", async ({ page }) => {
  await page.goto("/news");
  // 카드·히어로 링크 중 첫 상세 링크 (href 패턴 외에 안정적 접근 수단이 없음)
  const firstArticle = page.locator('main a[href^="/news/"]').first();
  await expect(firstArticle).toBeVisible();
  await firstArticle.click();
  await expect(page).toHaveURL(/\/news\/[0-9a-f-]{36}$/);

  // 새 브라우저 컨텍스트 = 새 익명 sessionId → 초기 상태는 미공감
  const like = page.getByRole("button", { name: "공감해요" });
  await expect(like).toHaveAttribute("aria-pressed", "false");
  await like.click();
  const unlike = page.getByRole("button", { name: "공감 취소" });
  await expect(unlike).toHaveAttribute("aria-pressed", "true");
  await unlike.click();
  await expect(page.getByRole("button", { name: "공감해요" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

test("공지 목록 렌더", async ({ page }) => {
  await page.goto("/notices");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("잘못된 소식 주소 → 404 화면 (서버 오류 아님)", async ({ page, guard }) => {
  guard.allow(/HTTP 404: .*\/news\/not-a-uuid/);
  // Suspense 안 notFound() 가 부하 시 간헐적으로 클라 렌더 폴백(#419, 약 1/280) — 결과 화면(404)은 동일
  guard.allow(/Minified React error #419/);
  await page.goto("/news/not-a-uuid");
  await expect(page.getByText("404")).toBeVisible();
});

test("잘못된 공지 주소 → 404 화면 (서버 오류 아님)", async ({ page, guard }) => {
  guard.allow(/HTTP 404: .*\/notices\/not-a-uuid/);
  // Suspense 안 notFound() 가 부하 시 간헐적으로 클라 렌더 폴백(#419, 약 1/280) — 결과 화면(404)은 동일
  guard.allow(/Minified React error #419/);
  await page.goto("/notices/not-a-uuid");
  await expect(page.getByText("404")).toBeVisible();
});

test("목록 API 실패 → 화면 유지(크래시 없음), 서버 응답으로 목록 복구", async ({ page, guard }) => {
  // 의도적으로 끊는 요청의 브라우저 로그
  guard.allow(/Failed to load resource: net::ERR_FAILED/);
  await page.goto("/news");
  await page.route("**/api/news**", (route) => route.abort());

  const tab = page.getByRole("button", { name: "가족 치유" });
  await tab.click();
  await expect(page).toHaveURL(/category=/);
  await expect(tab).toHaveAttribute("aria-pressed", "true");
  // 클라 fetch 가 실패해도 RSC 경로가 목록을 채운다 — 빈 화면·오류 화면이 아니어야 한다
  await expect(page.getByRole("combobox", { name: "정렬 순서" })).toBeVisible();
  await expect(page.getByText("페이지를 불러오지 못했습니다")).toBeHidden();
});
