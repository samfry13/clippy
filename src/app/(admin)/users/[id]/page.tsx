import { VideoStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { VideoCard } from "~/components/video-card";
import { prisma } from "~/lib/server/prisma";

export default async function AdminUserViewPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await prisma.user.findFirst({
    where: {
      id: params.id,
    },
    select: {
      email: true,
      status: true,
      videos: {
        where: {
          status: VideoStatus.Ready,
        },
      },
    },
  });

  if (!user) {
    return notFound();
  }

  return (
    <main className="max-w-5xl mx-auto py-10 px-4 gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Email</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold truncate"
              title={user.email || ""}
            >
              {user.email}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.status}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.videos.length}</div>
          </CardContent>
        </Card>
      </div>

      <h1 className="text-3xl mt-10 mb-5">Videos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {user.videos.map((video) => (
          <VideoCard key={`video-card-${video.id}`} video={video} />
        ))}
      </div>
    </main>
  );
}
