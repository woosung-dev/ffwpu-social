// 공유 유틸 — cn (clsx + tailwind-merge) 한 곳에서만 정의
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
