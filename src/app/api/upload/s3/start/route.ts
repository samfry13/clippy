import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "~/app/api/auth/[...nextauth]/route";
import { s3 } from "~/lib/server/s3";

const RequestBodySchema = z.object({
  filename: z.string(),
});

export const POST = async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse(undefined, { status: 403 });
  }

  const parseResult = RequestBodySchema.safeParse(await request.json());
  if (!parseResult.success) {
    return new NextResponse(
      JSON.stringify({ error: parseResult.error.flatten() }),
      { status: 400 }
    );
  }

  const body = parseResult.data;

  const multipartUpload = await s3.send(
    new CreateMultipartUploadCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: body.filename,
    })
  );

  return NextResponse.json({
    key: multipartUpload.Key,
    uploadId: multipartUpload.UploadId,
  });
};
