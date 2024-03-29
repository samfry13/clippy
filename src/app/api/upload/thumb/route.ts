import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "~/app/api/auth/[...nextauth]/route";
import s3 from "~/lib/server/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/lib/env.mjs";

const RequestBodySchema = z.object({
  key: z.string(),
});

export const POST = async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse(undefined, { status: 403 });
  }

  const bodyParseResult = RequestBodySchema.safeParse(await request.json());
  if (!bodyParseResult.success) {
    return new NextResponse(
      JSON.stringify({ error: bodyParseResult.error.flatten() }),
      { status: 400 }
    );
  }

  const body = bodyParseResult.data;

  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: `${body.key}.webp`,
    })
  );

  return NextResponse.json({
    url,
  });
};
