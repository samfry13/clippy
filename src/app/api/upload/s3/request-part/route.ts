import { UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "~/app/api/auth/[...nextauth]/route";
import s3 from "~/lib/server/s3";

const RequestBodySchema = z.object({
  key: z.string(),
  uploadId: z.string(),
  partNumber: z.number(),
});

export const POST = async (request: NextRequest) => {
  if (!s3.enabled) {
    return new NextResponse(undefined, { status: 501 });
  }

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
    s3.client,
    new UploadPartCommand({
      Bucket: s3.config.bucket,
      Key: `${body.key}.mp4`,
      UploadId: body.uploadId,
      PartNumber: body.partNumber,
    }),
    { expiresIn: 60 }
  );

  return NextResponse.json({
    url,
  });
};
