// S3 객체 best-effort prefix 청소 — 글 삭제 시 호출. 실패해도 DB 삭제는 성공 (v1.1 cleanup job 백업)
import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { S3_BUCKET, s3 } from "@/lib/s3";

const DELETE_BATCH_SIZE = 1000;

// prefix 로 시작하는 모든 객체 삭제. >1000 시 자동 페이지네이션. 반환 = 삭제된 객체 수
export async function deleteByPrefix(
  prefix: string,
): Promise<{ deleted: number }> {
  let deleted = 0;
  let continuationToken: string | undefined;
  do {
    const listed = await s3.send(
      new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );
    const objects =
      listed.Contents?.filter((o) => o.Key).map((o) => ({ Key: o.Key! })) ?? [];
    if (objects.length > 0) {
      // DeleteObjects 최대 1000 — ListObjectsV2 가 최대 1000 반환이므로 단일 호출로 충분
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: S3_BUCKET,
          Delete: { Objects: objects.slice(0, DELETE_BATCH_SIZE), Quiet: true },
        }),
      );
      deleted += objects.length;
    }
    continuationToken = listed.IsTruncated
      ? listed.NextContinuationToken
      : undefined;
  } while (continuationToken);
  return { deleted };
}
