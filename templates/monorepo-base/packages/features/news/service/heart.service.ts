// 익명 좋아요 토글 비즈니스 로직 — sessionId 1회 토글, soft delete + heartCount 동기화
import * as heartRepo from "../db/heart.repo";
import * as newsRepo from "../db/news.repo";
import type { HeartResult, HeartToggleInput } from "../schemas";

export async function toggle(input: HeartToggleInput): Promise<HeartResult> {
  const active = await heartRepo.findActive(input.newsId, input.sessionId);
  if (active) {
    // 이미 좋아요 → 취소 (soft delete + count -1)
    await heartRepo.softDelete(active.id);
    const heartCount = await newsRepo.bumpHeartCount(input.newsId, -1);
    return { liked: false, heartCount };
  }
  // 신규 좋아요 (insert + count +1)
  await heartRepo.insert(input.newsId, input.sessionId);
  const heartCount = await newsRepo.bumpHeartCount(input.newsId, 1);
  return { liked: true, heartCount };
}

export async function isLikedBySession(
  newsId: string,
  sessionId: string,
): Promise<boolean> {
  const active = await heartRepo.findActive(newsId, sessionId);
  return active !== null;
}
