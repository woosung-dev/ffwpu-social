// clsx + tailwind-merge 결합 헬퍼 — Tailwind 클래스 충돌을 결정론적으로 해소한다
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
