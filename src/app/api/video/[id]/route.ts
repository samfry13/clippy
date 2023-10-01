import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "~/lib/server/prisma";
import s3 from "~/lib/server/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/lib/env.mjs";
import { UserRole } from "@prisma/client";

const QuerySchema = z.object({
  id: z.string(),
});

const PatchBodySchema = z.object({
  title: z.string(),
});

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

  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return new NextResponse(JSON.stringify({ message: "Requires session" }), {
      status: 403,
    });
  }

  const video = await prisma.video.findFirst({
    where: {
      id: query.id,
    },
  });

  if (!video || (user.role !== UserRole.Admin && video.userId !== user.id)) {
    return new NextResponse(
      JSON.stringify({ message: "Video Not Found for user" }),
      {
        status: 404,
      }
    );
  }

  try {
    const video = await prisma.video.update({
      where: {
        id: query.id,
      },
      data: body,
    });

    return NextResponse.json(video);
  } catch (e: any) {
    return new NextResponse(e.toString(), { status: 500 });
  }
}

export async function DELETE(
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

  // Parse session
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse(JSON.stringify({ message: "Requires session" }), {
      status: 403,
    });
  }

  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return new NextResponse(JSON.stringify({ message: "Requires session" }), {
      status: 403,
    });
  }

  const video = await prisma.video.findFirst({
    where: {
      id: query.id,
    },
  });

  if (!video || (user.role !== UserRole.Admin && video.userId !== user.id)) {
    return new NextResponse(
      JSON.stringify({ message: "Video Not Found for user" }),
      {
        status: 404,
      }
    );
  }

  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: `${query.id}.mp4`,
      })
    );
    await s3.send(
      new DeleteObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: `${query.id}.webp`,
      })
    );
    const video = await prisma.video.delete({
      where: {
        id: query.id,
      },
    });

    return NextResponse.json(video);
  } catch (e: any) {
    return new NextResponse(e.toString(), { status: 500 });
  }
}
