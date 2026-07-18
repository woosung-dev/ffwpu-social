// 공개 상세(소식·공지) 공유 — 네이티브 공유 + 링크 복사. newsId 없으면(공지) path로만 기록
"use client";

import { Link2, Share2 } from "lucide-react";
import { useState } from "react";

import { recordAnalyticsEventAction } from "@/features/analytics/actions";
import { buildAnalyticsPayload } from "@/features/analytics/client";

export function ShareRow({ title, newsId }: { title: string; newsId?: string }) {
  const [copied, setCopied] = useState(false);

  const recordShare = () => {
    void recordAnalyticsEventAction(
      buildAnalyticsPayload({ eventType: "share_click", newsId }),
    );
  };

  const copyLink = async (track = true) => {
    if (track) recordShare();
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard 미지원 환경 — 무시 */
    }
  };

  const share = async () => {
    recordShare();
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url: window.location.href });
        return;
      } catch {
        /* 사용자 취소 — 폴백 안 함 */
        return;
      }
    }
    await copyLink(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Figma 749:8256: 원형 40 + 아이콘 24 #4B5563 — 1회 사용이라 토큰 신설 대신 Tailwind 표준 gray-600(#4B5563) */}
      <button
        type="button"
        onClick={share}
        aria-label="공유하기"
        className="flex size-10 items-center justify-center rounded-full bg-surface-cool text-gray-600 transition-opacity hover:opacity-80"
      >
        <Share2 className="size-6" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => void copyLink()}
        aria-label="링크 복사"
        className="flex size-10 items-center justify-center rounded-full bg-surface-cool text-gray-600 transition-opacity hover:opacity-80"
      >
        <Link2 className="size-6" aria-hidden />
      </button>
      {copied && (
        <span className="text-sm text-ink-subtle" role="status">
          링크가 복사되었습니다
        </span>
      )}
    </div>
  );
}
