import { prisma } from "~/lib/server/prisma";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { format, formatDistanceToNow } from "date-fns";
import { headers } from "next/headers";
import { Metadata } from "next";
import { VideoStatus } from "@prisma/client";

const getVideoInfo = async (id: string) => {
  const video = await prisma.video.findFirst({
    where: {
      id,
      status: VideoStatus.Ready,
    },
  });

  if (!video) {
    return notFound();
  }

  const hostname = headers().get("host");
  const origin = hostname?.includes("localhost")
    ? `http://${hostname}`
    : `https://${hostname}`;
  const videoUrl = `${origin}/api/v/${video.id}`;
  const thumbUrl = `${origin}/api/t/${video.id}`;

  const createdAt = new Date(video.createdAt);
  const shortDate = formatDistanceToNow(createdAt);
  const longDate = format(createdAt, "PPPPp");

  return {
    video,
    origin,
    videoUrl,
    thumbUrl,
    shortDate,
    longDate,
  } as const;
};

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { video, origin, videoUrl } = await getVideoInfo(params.id);

  return {
    title: video.title ? `Clippy - ${video.title}` : "Clippy",
    metadataBase: new URL(origin),
    openGraph: {
      // General meta tags
      siteName: "Clippy",
      url: `/${video.id}`,
      title: video.title,
      type: "video.other",
      // Video specific meta tags
      videos: [
        {
          url: videoUrl,
          secureUrl: videoUrl,
          type: "video/mp4",
          width: "1920",
          height: "1080",
        },
      ],
    },
  };
}

export default async function VideoPage({
  params,
}: {
  params: { id: string };
}) {
  const { longDate, shortDate, videoUrl, thumbUrl } = await getVideoInfo(
    params.id
  );
  const video = await prisma.video.update({
    where: {
      id: params.id,
    },
    data: {
      views: { increment: 1 },
    },
  });

  return (
    <main className="max-w-5xl mx-auto py-10 px-4">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{video.title}</CardTitle>
          <CardDescription>
            {`${video.views} Views • `}
            <span title={longDate}>{shortDate} ago</span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <video
            controls
            autoPlay
            poster={thumbUrl}
            className="max-h-[65vh] mx-auto"
          >
            <source src={videoUrl} />
          </video>
        </CardContent>
      </Card>
    </main>
  );
}
