import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import s3 from "~/lib/server/s3";
import fs from "fs";
import path from "path";
import { ReadableOptions } from "stream";

function streamFile(
  path: string,
  options?: ReadableOptions
): ReadableStream<Uint8Array> {
  const downloadStream = fs.createReadStream(path, options);

  return new ReadableStream({
    start(controller) {
      downloadStream.on("data", (chunk: Buffer) =>
        controller.enqueue(new Uint8Array(chunk))
      );
      downloadStream.on("end", () => controller.close());
      downloadStream.on("error", (error: NodeJS.ErrnoException) =>
        controller.error(error)
      );
    },
    cancel() {
      downloadStream.destroy();
    },
  });
}

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

  const range = request.headers.get("range");

  /**
   * Get Video from S3
   */
  if (s3.enabled) {
    const object = await s3.client.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${query.id}.mp4`,
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
   * Get Video from disk
   */
  const videoPath = path.resolve(
    ".",
    `${process.env.DATA_DIR}/${query.id}.mp4`
  );
  const videoStream = streamFile(videoPath);
  return new NextResponse(videoStream, {
    status: 200,
    headers: {
      "Content-Type": "video/mp4",
    },
  });
};
