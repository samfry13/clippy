import fs from "fs";
import path from "path";
import { NextRequest, NextResponse, userAgent } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const RequestQuerySchema = z.object({
  filename: z.string(),
});

const RequestHeadersSchema = z.object({
  "content-type": z.string().refine(
    (arg) => {
      if (!arg.startsWith("video")) return false;

      return true;
    },
    {
      message: "Invalid content type. Only videos are accepted.",
    }
  ),
  "content-range": z.string(),
});

export const POST = async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse(undefined, { status: 403 });
  }

  const url = new URL(request.url);
  const queryParseResult = RequestQuerySchema.safeParse(
    Object.fromEntries(url.searchParams)
  );
  if (!queryParseResult.success) {
    return new NextResponse(
      JSON.stringify({ error: queryParseResult.error.flatten() }),
      { status: 400 }
    );
  }

  const query = queryParseResult.data;

  const headersParseResult = RequestHeadersSchema.safeParse(
    Object.fromEntries(request.headers)
  );
  if (!headersParseResult.success) {
    return new NextResponse(
      JSON.stringify({ error: headersParseResult.error.flatten() }),
      { status: 400 }
    );
  }

  const headers = headersParseResult.data;

  const match = headers["content-range"].match(/bytes\s(\d+)-(\d+)\/(\d+)/);
  if (!match || !match[1] || !match[2] || !match[3])
    return new NextResponse(
      JSON.stringify({ error: "Invalid Content-Range Format" }),
      { status: 400 }
    );

  const rangeStart = parseInt(match[1]);
  const rangeEnd = parseInt(match[2]);
  const fileSize = parseInt(match[3]);
  if (isNaN(rangeStart) || isNaN(rangeEnd) || isNaN(fileSize))
    return new NextResponse(
      JSON.stringify({ error: "Invalid Content-Range Format" }),
      { status: 400 }
    );

  if (
    rangeStart >= fileSize ||
    rangeStart >= rangeEnd ||
    rangeStart >= fileSize
  )
    return new NextResponse(
      JSON.stringify({ error: "Invalid Content-Range Format" }),
      { status: 400 }
    );

  if (!request.body)
    return new NextResponse(
      JSON.stringify({ error: "Invalid Content-Range Format" }),
      { status: 400 }
    );

  const dataDir = process.env.DATA_DIR || "data";
  const filePath = path.join(dataDir, query.filename);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  if (rangeStart !== 0) {
    // this is not the first chunk
    const stats = fs.statSync(filePath);
    if (!stats || stats.size !== rangeStart) {
      return new NextResponse(
        JSON.stringify({ error: "Bad 'Chunk' provided" }),
        { status: 400 }
      );
    }
  }

  try {
    const file = await request.arrayBuffer();
    fs.appendFileSync(filePath, new Uint8Array(file));

    if (rangeEnd !== fileSize - 1) {
      // if this is not the final chunk
      return NextResponse.json({ message: "Chunk uploaded" });
    }

    return NextResponse.json({
      message: "Video successfully uploaded",
    });
  } catch (e: any) {
    console.error(e);

    return new NextResponse(JSON.stringify({ error: e.toString() }), {
      status: 500,
    });
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};
