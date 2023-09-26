import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { z } from "zod";

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
