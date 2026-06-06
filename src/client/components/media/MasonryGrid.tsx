// 마조네리 그리드 — 서버에서 round-robin 분배(item i → col i%N)로 읽기 순서(행 우선) 보존 + CLS 0 + 클라 JS 0.
// 카드 높이는 각 카드가 이미지 실제 비율로 정함(MediaCard/ArticleCard). BP별 컬럼 수가 다르면 tier 마다
// 분배를 다시 계산해 가시성 클래스로 토글 — 숨김 tier(display:none)의 lazy 이미지는 미로드라 비용 낮음.
import { Fragment, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type MasonryTier = {
  columns: number;
  // 이 tier 가 보이는 구간의 Tailwind 가시성 클래스 (예: 모바일 "flex md:hidden", 데스크탑 "hidden md:flex")
  visibilityClassName: string;
};

type Props<T> = {
  items: T[];
  tiers: MasonryTier[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  // 컬럼 간·카드 간 간격 (기본 gap-4)
  gapClassName?: string;
  // 항목 상대 높이(예: height/width). 주면 Pinterest식 shortest-column 배치, 없으면 순서 보존 round-robin.
  getWeight?: (item: T) => number;
};

// 컬럼 분배. getWeight 가 있으면 누적 높이가 가장 작은 컬럼에 배치(Pinterest shortest-column) — 컬럼 하단 균형.
// 없으면 round-robin(item i → col i%N, 행 우선 순서 보존). 순서대로 순회하므로 앞 항목은 빈 컬럼에 먼저 깔려 상단 행 유지.
function distribute<T>(
  items: T[],
  columnCount: number,
  getWeight?: (item: T) => number,
): T[][] {
  const cols: T[][] = Array.from({ length: columnCount }, () => []);
  if (!getWeight) {
    for (let i = 0; i < items.length; i++) {
      cols[i % columnCount].push(items[i]);
    }
    return cols;
  }
  const heights = new Array<number>(columnCount).fill(0);
  for (const item of items) {
    // 동률이면 가장 왼쪽 컬럼 (좌→우 읽기 순서 보존)
    let target = 0;
    for (let c = 1; c < columnCount; c++) {
      if (heights[c] < heights[target]) target = c;
    }
    cols[target].push(item);
    heights[target] += getWeight(item);
  }
  return cols;
}

export function MasonryGrid<T>({
  items,
  tiers,
  getKey,
  renderItem,
  gapClassName = "gap-4",
  getWeight,
}: Props<T>) {
  return (
    <>
      {tiers.map((tier) => (
        <div
          key={`tier-${tier.columns}`}
          className={cn("w-full", tier.visibilityClassName, gapClassName)}
        >
          {distribute(items, tier.columns, getWeight).map((col, ci) => (
            <div key={ci} className={cn("flex flex-1 flex-col", gapClassName)}>
              {col.map((item) => (
                <Fragment key={getKey(item)}>{renderItem(item)}</Fragment>
              ))}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
