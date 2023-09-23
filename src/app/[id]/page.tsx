import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "~/lib/server/prisma";
import { notFound } from "next/navigation";

export default async function VideoPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const video = await prisma.video.findFirst({
    where: {
      id: params.id,
    },
  });

  if (!video) {
    notFound();
  }

  return <div>{params.id}</div>;
}
