import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "~/app/api/auth/[...nextauth]/route";
import { prisma } from "~/lib/server/prisma";

const RequestBodySchema = z.object({
  filename: z.string(),
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

  const video = await prisma.video.create({
    data: {
      status: "uploading",
      title: body.filename,
      userId: session.user.id,
    },
  });

  return NextResponse.json({
    key: video.id,
  });
};
