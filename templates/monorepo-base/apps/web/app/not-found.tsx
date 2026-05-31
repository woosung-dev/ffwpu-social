// web 앱 글로벌 404 - 단순 안내 + 홈 복귀 링크
import Link from "next/link";
import { Button } from "@myorg/ui-base/components/button";

export default function NotFound(): React.ReactElement {
  return (
    <main className="mx-auto flex min-h-screen max-w-screen-md flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-3xl font-bold tracking-tight">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-muted-foreground">
        주소가 잘못되었거나 콘텐츠가 이동/삭제되었을 수 있습니다.
      </p>
      <Button asChild>
        <Link href="/">홈으로</Link>
      </Button>
    </main>
  );
}
