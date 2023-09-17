import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "~/app/api/auth/[...nextauth]/route";
import { prisma } from "~/lib/server/prisma";

const RequestBodySchema = z.object({
  key: z.string(),
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

  await prisma.video.update({
    where: {
      id: body.key,
      userId: session.user.id,
    },
    data: {
      status: "aborted",
    },
  });

  return new NextResponse(undefined, { status: 200 });
};
