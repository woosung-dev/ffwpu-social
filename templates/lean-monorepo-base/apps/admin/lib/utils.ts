// Tailwind 클래스 병합 유틸 + 자주 쓰는 헬퍼 모음
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: Date | string | number) {
  const d = input instanceof Date ? input : new Date(input);
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}
