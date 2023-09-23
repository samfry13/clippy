import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { z } from "zod";
import s3 from "~/lib/server/s3";

const RequestQuerySchema = z.object({
  id: z.string(),
});

export const GET = async (
  request: NextRequest,
  context: { params: unknown }
) => {
  const queryParseResult = RequestQuerySchema.safeParse(context.params);
  if (!queryParseResult.success) {
    return new NextResponse(
      JSON.stringify({ error: queryParseResult.error.flatten() }),
      { status: 400 }
    );
  }

  const query = queryParseResult.data;

  /**
   * Get Image from S3
   */
  if (s3.enabled) {
    const object = await s3.client.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${query.id}.webp`,
      })
    );

    return new NextResponse(object.Body?.transformToWebStream(), {
      status: 200,
      headers: {
        ...(object.ContentType
          ? {
              "Content-Type": object.ContentType,
            }
          : {}),
        ...(object.ContentLength
          ? {
              "Content-Length": object.ContentLength.toString(),
            }
          : {}),
      },
    });
  }

  /**
   * Get Image from Disk
   */
  const filePath = path.resolve(
    ".",
    `${process.env.DATA_DIR}/${query.id}.webp`
  );
  const imageBuffer = fs.readFileSync(filePath);
  return new NextResponse(imageBuffer, {
    headers: {
      "Content-Type": "image/webp",
    },
  });
};
