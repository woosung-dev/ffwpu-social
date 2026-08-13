// 랜딩 전역 설정 입력 스키마 — 클라이언트·서버 공통 검증
import { z } from "zod";

import { FEATURED_SLOT_MAX } from "./constants/slots";

export const featuredVisibleCountSchema = z
  .number()
  .int("노출 개수는 정수여야 합니다.")
  .min(1, "최소 1개는 보여야 합니다.")
  .max(FEATURED_SLOT_MAX, `노출 개수는 최대 ${FEATURED_SLOT_MAX}개까지 가능합니다.`);
