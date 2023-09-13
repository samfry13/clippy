import { AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { s3 } from "~/lib/server/s3";

const RequestBodySchema = z.object({
  key: z.string(),
  uploadId: z.string(),
});

export const POST = async (request: NextRequest) => {
  const parseResult = RequestBodySchema.safeParse(await request.json());
  if (!parseResult.success) {
    return new NextResponse(
      JSON.stringify({ error: parseResult.error.flatten() }),
      { status: 400 }
    );
  }

  const body = parseResult.data;

  await s3.send(
    new AbortMultipartUploadCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: body.key,
      UploadId: body.uploadId,
    })
  );

  return new NextResponse(undefined, { status: 200 });
};