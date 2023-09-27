import { User, UserStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ZodType, z } from "zod";
import { authOptions } from "~/app/api/auth/[...nextauth]/route";
import { prisma } from "~/lib/server/prisma";

const QuerySchema = z.object({
  id: z.string(),
});

const PatchBodySchema = z
  .object({
    status: z.enum([
      UserStatus.AwaitingApproval,
      UserStatus.Completed,
      UserStatus.Locked,
    ]),
  } satisfies Partial<Record<keyof User, ZodType>>)
  .partial();

export async function PATCH(
  request: NextRequest,
  context: { params: unknown }
) {
  // Parse query
  const queryParseResult = QuerySchema.safeParse(context.params);
  if (!queryParseResult.success) {
    return new NextResponse(JSON.stringify({ message: "No ID in url" }), {
      status: 400,
    });
  }
  const query = queryParseResult.data;

  // Parse body
  const bodyParseResult = PatchBodySchema.safeParse(await request.json());
  if (!bodyParseResult.success) {
    return new NextResponse(JSON.stringify({ message: "Body is invalid" }), {
      status: 400,
    });
  }
  const body = bodyParseResult.data;

  // Parse session
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse(JSON.stringify({ message: "Requires session" }), {
      status: 403,
    });
  }

  // check if user is admin
  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
    },
  });
  if (!user || user.role !== "Admin") {
    return new NextResponse(
      JSON.stringify({ message: "Insufficient Permissions" }),
      {
        status: 403,
      }
    );
  }

  try {
    const newUser = await prisma.user.update({
      where: {
        id: query.id,
      },
      data: body,
    });

    return NextResponse.json(newUser);
  } catch (e: any) {
    return new NextResponse(e.toString(), { status: 500 });
  }
}
