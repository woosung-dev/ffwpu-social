import { describe, expect, it } from "vitest";
import { canToggleVisibility, getPublishState } from "./publish-state";

const NOW = new Date("2026-08-08T12:00:00Z");
const PAST = new Date("2026-06-14T09:00:00Z");
const FUTURE = new Date("2026-08-20T09:00:00Z");

describe("getPublishState", () => {
  it("발행일이 없으면 임시저장 — isHidden 값과 무관", () => {
    expect(getPublishState(null, false, NOW)).toBe("draft");
    expect(getPublishState(null, true, NOW)).toBe("draft");
  });

  it("발행일이 미래면 예약 — 아직 공개된 적 없어 isHidden 무시", () => {
    expect(getPublishState(FUTURE, false, NOW)).toBe("scheduled");
    expect(getPublishState(FUTURE, true, NOW)).toBe("scheduled");
  });

  it("발행일이 과거면 isHidden 이 공개/비공개를 가른다", () => {
    expect(getPublishState(PAST, false, NOW)).toBe("published");
    expect(getPublishState(PAST, true, NOW)).toBe("hidden");
  });

  it("발행일이 정확히 현재면 공개 — 경계는 발행된 것으로 본다", () => {
    expect(getPublishState(NOW, false, NOW)).toBe("published");
  });

  it("비공개 전환은 발행일을 바꾸지 않는다 — 되돌리면 같은 상태로 복귀", () => {
    const before = getPublishState(PAST, false, NOW);
    const hidden = getPublishState(PAST, true, NOW);
    const restored = getPublishState(PAST, false, NOW);
    expect(before).toBe("published");
    expect(hidden).toBe("hidden");
    expect(restored).toBe(before);
  });
});

describe("canToggleVisibility", () => {
  it("공개된 적 있는 글만 노출을 토글할 수 있다", () => {
    expect(canToggleVisibility("published")).toBe(true);
    expect(canToggleVisibility("hidden")).toBe(true);
  });

  it("임시저장·예약은 토글 대상이 아니다", () => {
    expect(canToggleVisibility("draft")).toBe(false);
    expect(canToggleVisibility("scheduled")).toBe(false);
  });
});
