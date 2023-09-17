import { UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "~/app/api/auth/[...nextauth]/route";
import { s3 } from "~/lib/server/s3";

const RequestBodySchema = z.object({
  key: z.string(),
  uploadId: z.string(),
  partNumber: z.number(),
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

  const url = await getSignedUrl(
    s3,
    new UploadPartCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: body.key,
      UploadId: body.uploadId,
      PartNumber: body.partNumber,
    }),
    { expiresIn: 60 }
  );

  return NextResponse.json({
    url,
  });
};
