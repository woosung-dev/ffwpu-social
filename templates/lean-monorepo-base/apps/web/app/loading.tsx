// 라우트 전환 중 표시될 기본 로딩 UI
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div
        className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"
        role="status"
        aria-label="로딩 중"
      />
    </div>
  );
}
