import { getServerSession } from "next-auth";
import { prisma } from "~/lib/server/prisma";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { VideoCard } from "~/components/video-card";
import { VideoStatus } from "@prisma/client";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const videos = session?.user
    ? await prisma.video.findMany({
        where: {
          userId: session.user.id,
          status: VideoStatus.Ready,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    : [];

  return (
    <main className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 py-10 px-4 gap-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </main>
  );
}
