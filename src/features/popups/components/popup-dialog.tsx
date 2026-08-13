// 홈 활성 팝업을 한 번에 하나씩 노출하고 브라우저별 해제 상태를 반영한다.
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { dismissPopup, isPopupSuppressed } from "@/client/lib/popup-dismiss";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { PopupDismissDuration, PopupLinkTarget } from "../schemas";

export type PopupItem = {
  id: string;
  title: string;
  imageUrl: string;
  imageWidth: number | null;
  imageHeight: number | null;
  linkUrl: string | null;
  linkTarget: PopupLinkTarget;
  dismissDuration: PopupDismissDuration;
};

// 체크박스 문구 — 운영자가 팝업별로 고른 기간을 그대로 방문자에게 보여준다
const DISMISS_LABELS: Record<PopupDismissDuration, string> = {
  day: "하루 동안 보지 않기",
  week: "일주일간 보지 않기",
};

export function PopupDialog({ popups }: { popups: PopupItem[] }) {
  const [current, setCurrent] = useState<PopupItem | null>(null);
  const [hideForPeriod, setHideForPeriod] = useState(false);

  useEffect(() => {
    setCurrent(popups.find((popup) => !isPopupSuppressed(popup.id)) ?? null);
  }, [popups]);

  // 닫기 경로(버튼·ESC·오버레이·링크 클릭) 공통 — 체크 시에만 팝업별 기간만큼 억제 저장.
  // 미체크 닫기는 저장 없음(사용자 결정 2026-07-18): 새로고침·재진입 시 다시 노출된다.
  const handleClose = () => {
    if (current && hideForPeriod) dismissPopup(current.id, current.dismissDuration);
    setCurrent(null);
  };

  // 작은 새 창은 클릭 핸들러 안에서 열어 팝업 차단에 걸리지 않는다.
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!current) return;
    // 보조키 클릭(새 탭 의도)은 브라우저 기본 동작에 맡긴다.
    if (current.linkTarget === "small_window" && !(e.metaKey || e.ctrlKey || e.shiftKey)) {
      e.preventDefault();
      const width = 480;
      const height = Math.min(800, window.screen.availHeight - 80);
      // 현재 브라우저 창 중앙 기준. 멀티 모니터 음수 좌표도 유효하므로 클램프하지 않는다 (화면 밖은 브라우저가 스스로 보정)
      const left = Math.round(window.screenX + (window.outerWidth - width) / 2);
      const top = Math.round(window.screenY + (window.outerHeight - height) / 2);
      // noopener 를 feature 문자열에 넣으면 Chromium 이 left/top 을 무시하고 OS 기본 위치(좌하단 등)에 띄운다
      // → feature 에서는 빼고 opener 를 직접 끊는다 (탭내빙 방지 효과 동일)
      const win = window.open(
        current.linkUrl ?? "",
        "sg_popup_link",
        `popup=yes,width=${width},height=${height},left=${left},top=${top}`,
      );
      if (win) win.opener = null;
    }
    handleClose();
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
    current.linkTarget === "new_tab" ? (
      <a
        href={current.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleLinkClick}
      >
        {image}
      </a>
    ) : current.linkTarget === "small_window" ? (
      <a href={current.linkUrl} rel="noopener noreferrer" onClick={handleLinkClick}>
        {image}
      </a>
    ) : (
      <a href={current.linkUrl} onClick={handleLinkClick}>
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
      {/* 상단 X 는 제거(사용자 피드백) — 닫기 수단은 하단 버튼 + ESC + 오버레이로 충분 */}
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={false}
        className="w-[calc(100vw-32px)] max-w-[480px] gap-0 overflow-hidden rounded-2xl border-none p-0"
      >
        <DialogTitle className="sr-only">{current.title}</DialogTitle>
        {linkedImage}
        <div className="flex items-center justify-between gap-3 border-t border-border bg-white px-4 py-2.5">
          {/* label 로 감싸 텍스트 탭도 체크 토글 — 터치 타깃 44px 확보 */}
          <label className="flex min-h-11 cursor-pointer select-none items-center gap-2 text-sm text-ink-subtle">
            <Checkbox
              checked={hideForPeriod}
              onCheckedChange={(checked) => setHideForPeriod(checked === true)}
              aria-label={DISMISS_LABELS[current.dismissDuration]}
            />
            {DISMISS_LABELS[current.dismissDuration]}
          </label>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="h-11 rounded-full px-6 text-sm font-medium"
          >
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
