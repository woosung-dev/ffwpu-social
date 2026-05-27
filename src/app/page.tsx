// 임시 홈 — D-5 시드/3-Layer 정상 작동 검증용. D-3에 디자인 시안 구현으로 교체
// Next 16 Cache Components: DB 호출은 <Suspense> boundary 안에서 (또는 "use cache")
import { Suspense } from "react";
import { listNews } from "@/features/news/service";

async function NewsList() {
  const { items, total } = await listNews({ page: 1, limit: 9 });
  return (
    <section>
      <h2 className="text-xl font-semibold mb-2">
        D-5 데이터 검증 — 소식 {total}건
      </h2>
      <ul className="space-y-2">
        {items.map((n) => (
          <li
            key={n.id}
            className="border-l-2 pl-3"
            style={{ borderColor: "var(--color-accent)" }}
          >
            <div className="text-sm text-neutral-500">{n.category}</div>
            <div>{n.title}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl p-8 space-y-6">
      <header>
        <h1
          className="text-3xl font-bold"
          style={{ color: "var(--color-primary)" }}
        >
          사회공헌단 Sow Good
        </h1>
        <p className="text-base text-neutral-600">가치를 삶으로 증명합니다</p>
      </header>
      <Suspense fallback={<div className="text-neutral-400">불러오는 중…</div>}>
        <NewsList />
      </Suspense>
    </main>
  );
}
