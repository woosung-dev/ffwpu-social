// 배포 헬스체크 엔드포인트 — DB 미접근, 항상 200 (Caddy·docker healthcheck·CI 헬스게이트가 참조)
export function GET() {
  return Response.json({ status: "ok" });
}
