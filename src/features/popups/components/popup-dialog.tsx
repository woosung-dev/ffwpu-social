// 홈 활성 팝업을 한 번에 하나씩 노출하고 브라우저별 해제 상태를 반영한다.
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  closePopupForSession,
  dismissPopupForWeek,
  isPopupSuppressed,
} from "@/client/lib/popup-dismiss";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export type PopupItem = {
  id: string;
  title: string;
  imageUrl: string;
  imageWidth: number | null;
  imageHeight: number | null;
  linkUrl: string | null;
};

export function PopupDialog({ popups }: { popups: PopupItem[] }) {
  const [current, setCurrent] = useState<PopupItem | null>(null);

  useEffect(() => {
    setCurrent(popups.find((popup) => !isPopupSuppressed(popup.id)) ?? null);
  }, [popups]);

  const handleClose = () => {
    if (current) closePopupForSession(current.id);
    setCurrent(null);
  };

  const handleDismissForWeek = () => {
    if (current) dismissPopupForWeek(current.id);
    setCurrent(null);
  };

  const handleLinkClick = () => {
    if (current) closePopupForSession(current.id);
    setCurrent(null);
  };

  if (!current) return null;

  const image = (
    <Image
      src={current.imageUrl}
      width={current.imageWidth ?? 1200}
      height={current.imageHeight ?? 1200}
      className="h-auto w-full"
      alt={current.title}
      unoptimized
    />
  );
  const linkedImage = current.linkUrl ? (
    current.linkUrl.startsWith("/") ? (
      <Link href={current.linkUrl} onClick={handleLinkClick}>
        {image}
      </Link>
    ) : (
      <a
        href={current.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleLinkClick}
      >
        {image}
      </a>
    )
  ) : (
    image
  );

  return (
    <Dialog
      open={current != null}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent
        aria-describedby={undefined}
        className="w-[calc(100vw-32px)] max-w-[480px] gap-0 overflow-hidden rounded-2xl border-none p-0 [&>[data-slot=dialog-close]]:size-11 [&>[data-slot=dialog-close]]:bg-black/50 [&>[data-slot=dialog-close]]:text-white [&>[data-slot=dialog-close]]:opacity-100"
      >
        <DialogTitle className="sr-only">{current.title}</DialogTitle>
        {linkedImage}
        <div className="flex items-center justify-between border-t border-border bg-white px-4 py-1.5">
          <button
            type="button"
            className="min-h-11 text-sm text-ink-subtle"
            onClick={handleDismissForWeek}
          >
            일주일간 보지 않기
          </button>
          <button
            type="button"
            className="min-h-11 text-sm font-medium"
            onClick={handleClose}
          >
            닫기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
