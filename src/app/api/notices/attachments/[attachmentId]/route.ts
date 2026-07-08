// 공지 첨부 다운로드 — presigned GET 302 redirect. 원본 파일명을 Content-Disposition 으로 보존 (ADR-041)
// R2 public URL 은 Content-Disposition 제어 불가 + cross-origin <a download> 무시 → presign 이 유일 경로.
// 부모 공지 미발행이면 404 (첨부 URL 추측 차단). 객체가 스토리지에 없으면 R2/MinIO 가 404 응답 (사전 Head 생략 — 레이턴시 비용 > 효용)
import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

import { S3_BUCKET, s3 } from "@/lib/s3";
import { attachmentContentDisposition, getPublishedAttachment } from "@/features/notices";

const PRESIGN_EXPIRES_SECONDS = 60;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ attachmentId: string }> },
) {
  const { attachmentId } = await params;
  // uuid 선검증 — 형식 불량은 DB 조회 없이 404
  if (!z.uuid().safeParse(attachmentId).success) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }
  const attachment = await getPublishedAttachment(attachmentId);
  if (!attachment) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }
  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: attachment.key,
      ResponseContentDisposition: attachmentContentDisposition(attachment.fileName),
      ResponseContentType: attachment.mime,
    }),
    { expiresIn: PRESIGN_EXPIRES_SECONDS },
  );
  return NextResponse.redirect(url, {
    status: 302,
    // presign 은 60초 만료 — 중간 캐시가 만료된 URL 을 재사용하지 않도록
    headers: { "Cache-Control": "no-store" },
  });
}
