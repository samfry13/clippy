import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { authOptions } from "~/app/api/auth/[...nextauth]/route";

const ThumbQuerySchema = z.object({
  key: z.string(),
});

const RequestHeadersSchema = z.object({
  "content-type": z.literal("image/webp"),
});

export const POST = async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse(undefined, { status: 403 });
  }

  const url = new URL(request.url);
  const queryParseResult = ThumbQuerySchema.safeParse(
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

  const dataDir = process.env.DATA_DIR || "data";
  const filePath = path.join(dataDir, `${query.key}.webp`);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  try {
    const file = await request.arrayBuffer();
    fs.writeFileSync(filePath, new Uint8Array(file));

    return NextResponse.json({
      message: "Thumbnail successfully uploaded",
    });
  } catch (e: any) {
    console.error(e);
    return new NextResponse(JSON.stringify({ error: e.toString() }), {
      status: 500,
    });
  }
};
