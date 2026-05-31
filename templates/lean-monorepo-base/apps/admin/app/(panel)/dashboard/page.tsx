// 어드민 대시보드 - 운영자가 로그인 직후 보는 요약 화면
import Link from "next/link";
import { listNews } from "@/features/news/service";

export default async function DashboardPage() {
  const recent = await listNews({ limit: 5 });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">대시보드</h1>
        <p className="text-sm text-[var(--color-text-muted)]">최근 활동을 한눈에 확인하세요.</p>
      </header>

      <section className="rounded-lg border bg-[var(--color-bg)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">최근 소식</h2>
          <Link href="/news" className="text-sm text-[var(--color-primary)] hover:underline">
            전체 보기
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">아직 등록된 소식이 없습니다.</p>
        ) : (
          <ul className="divide-y">
            {recent.map((n) => (
              <li key={n.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/news/${n.id}/edit`}
                    className="block truncate font-medium hover:underline"
                  >
                    {n.title}
                  </Link>
                  <p className="truncate text-xs text-[var(--color-text-muted)]">
                    {n.summary ?? ""}
                  </p>
                </div>
                <span className="shrink-0 rounded bg-[var(--color-surface)] px-2 py-0.5 text-xs">
                  {n.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
