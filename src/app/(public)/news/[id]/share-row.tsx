// 소식 상세 공유 — 네이티브 공유(navigator.share, 모바일서 카카오/페북 노출) + 링크 복사. 브랜드 전용 버튼은 SDK 도입 시 (v1.1)
"use client";

import { Link2, Share2 } from "lucide-react";
import { useState } from "react";

export function ShareRow({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard 미지원 환경 — 무시 */
    }
  };

  const share = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url: window.location.href });
        return;
      } catch {
        /* 사용자 취소 — 폴백 안 함 */
        return;
      }
    }
    await copyLink();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={share}
        aria-label="공유하기"
        className="flex size-10 items-center justify-center rounded-full bg-surface-cool text-ink-strong-mid transition-opacity hover:opacity-80"
      >
        <Share2 className="size-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={copyLink}
        aria-label="링크 복사"
        className="flex size-10 items-center justify-center rounded-full bg-surface-cool text-ink-strong-mid transition-opacity hover:opacity-80"
      >
        <Link2 className="size-5" aria-hidden />
      </button>
      {copied && (
        <span className="text-sm text-ink-subtle" role="status">
          링크가 복사되었습니다
        </span>
      )}
    </div>
  );
}
