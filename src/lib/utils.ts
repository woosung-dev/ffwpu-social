// shadcn/ui 표준 cn() 헬퍼 — clsx + tailwind-merge 결합으로 클래스명 충돌 안전 병합
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
