import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs";
import path from "path";
import parseRange from "range-parser";

function streamFile(
  path: string,
  options?: Parameters<typeof fs.createReadStream>[1]
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
   * Get Video from disk
   */
  const videoPath = path.resolve(
    ".",
    `${process.env.DATA_DIR}/${query.id}.mp4`
  );
  const videoSize = fs.statSync(videoPath).size;
  const rangeParseResult = parseRange(videoSize, range ?? "");

  if (
    !range ||
    rangeParseResult === -1 ||
    rangeParseResult === -2 ||
    rangeParseResult.length > 1
  ) {
    const videoStream = streamFile(videoPath);
    return new NextResponse(videoStream, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename=${query.id}.mp4`,
        "Content-Type": "video/mp4",
      },
    });
  }

  const parsedRange = rangeParseResult[0];
  const CHUNK_SIZE = 10 ** 6;
  const start = parsedRange.start;
  const end = Math.min(start + CHUNK_SIZE, parsedRange.end);
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength.toString(),
    "Content-Type": "video/mp4",
  };

  const videoStream = streamFile(videoPath, { start, end });
  return new NextResponse(videoStream, {
    status: 206,
    headers,
  });
};
