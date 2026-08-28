// KPI service — 비즈니스 로직 (db import 금지, db 레이어 함수만 호출). 갱신 transaction 안에서 audit_logs 기록 — v1.1
import "server-only";

import { db } from "@/db";
import * as kpiDb from "./db";
import type {
  KpiUpdateInput,
  StoryStatsUpdateInput,
  StoryTextUpdateInput,
} from "./schemas";

export async function listKpisForAdmin() {
  return kpiDb.listForAdmin("impact");
}

// StorySection 통계 (나눔 쌀·나눔 가정·나눔 시설) — 어드민 입력 폼. 숫자는 쌀나눔 시트 동기화가 채운다 (ADR-058)
export async function listStoryStatsForAdmin() {
  return kpiDb.listForAdmin("story");
}

// 4 row 일괄 갱신 — transaction 안에서 한 row 라도 실패 시 전체 롤백
export async function updateKpis(input: KpiUpdateInput) {
  return db.transaction(async (tx) => {
    const updated = [];
    for (const row of input.rows) {
      const result = await kpiDb.updateBySlug(tx, row.slug, {
        label: row.label,
        sublabel: row.sublabel,
        value: row.value,
        displayValue: row.displayValue,
        unit: row.unit,
      });
      if (!result) {
        throw new Error(`KPI slug not found: ${row.slug}`);
      }
      updated.push(result);
    }
    return updated;
  });
}

// StorySection 카피 조회 — 태그·제목·부제 (displayValue, 제목·부제는 \n 줄바꿈 포함). 어드민 폼 초기값
export async function listStorySectionText() {
  const rows = await kpiDb.listForAdmin("story_text");
  const bySlug = (slug: string) =>
    rows.find((r) => r.slug === slug)?.displayValue ?? "";
  return {
    tag: bySlug("story_tag"),
    title: bySlug("story_title"),
    subtitle: bySlug("story_subtitle"),
  };
}

// StorySection 카피 갱신 — 3행(태그·제목·부제) displayValue 갱신. 빈값 허용(공개는 상수 fallback)
export async function updateStorySectionText(input: StoryTextUpdateInput) {
  const entries: Array<{ slug: string; label: string; displayValue: string }> = [
    { slug: "story_tag", label: "태그", displayValue: input.tag },
    { slug: "story_title", label: "제목", displayValue: input.title },
    { slug: "story_subtitle", label: "부제", displayValue: input.subtitle },
  ];
  return db.transaction(async (tx) => {
    const updated = [];
    for (const e of entries) {
      const result = await kpiDb.updateBySlug(tx, e.slug, {
        label: e.label,
        value: null,
        displayValue: e.displayValue,
        unit: null,
      });
      if (!result) {
        throw new Error(`Story text slug not found: ${e.slug}`);
      }
      updated.push(result);
    }
    return updated;
  });
}

// StorySection 통계 일괄 갱신 — 숫자·단위·표시값(ADR-058). 빈 단위는 null 로 저장해 formatKpiDisplay 가 접미사 없이 렌더.
export async function updateStoryStats(input: StoryStatsUpdateInput) {
  return db.transaction(async (tx) => {
    const updated = [];
    for (const row of input.rows) {
      const result = await kpiDb.updateBySlug(tx, row.slug, {
        label: row.label,
        value: row.value ?? null,
        displayValue: row.displayValue,
        unit: row.unit ?? null,
      });
      if (!result) {
        throw new Error(`Story stat slug not found: ${row.slug}`);
      }
      updated.push(result);
    }
    return updated;
  });
}
