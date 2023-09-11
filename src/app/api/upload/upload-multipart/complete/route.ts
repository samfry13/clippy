import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { s3 } from "~/lib/server/s3";

const RequestBodySchema = z.object({
  key: z.string(),
  uploadId: z.string(),
  etags: z.array(z.string()),
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
    new CompleteMultipartUploadCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: body.key,
      UploadId: body.uploadId,
      MultipartUpload: {
        Parts: body.etags.map((etag, i) => ({
          ETag: etag,
          PartNumber: i + 1,
        })),
      },
    })
  );

  return new NextResponse(undefined, { status: 200 });
};
