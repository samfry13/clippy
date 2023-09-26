import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "~/app/api/auth/[...nextauth]/route";
import s3 from "~/lib/server/s3";
import { prisma } from "~/lib/server/prisma";

const RequestBodySchema = z.object({
  key: z.string(),
  uploadId: z.string(),
  etags: z.array(z.string()),
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

  await prisma.video.update({
    where: {
      id: body.key,
    },
    data: {
      status: "ready",
    },
  });

  await s3.client.send(
    new CompleteMultipartUploadCommand({
      Bucket: s3.config.bucket,
      Key: `${body.key}.mp4`,
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
