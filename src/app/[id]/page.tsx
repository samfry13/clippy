import { prisma } from "~/lib/server/prisma";
import { notFound } from "next/navigation";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { format, formatDistanceToNow } from "date-fns";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { headers } from "next/headers";
import s3 from "~/lib/server/s3";
import { Metadata } from "next";

const getVideoInfo = async (id: string) => {
  const video = await prisma.video.findFirst({
    where: {
      id,
    },
  });

  if (!video) {
    return notFound();
  }

  const hostname = headers().get("host");
  const origin = hostname?.includes("localhost")
    ? `http://${hostname}`
    : `https://${hostname}`;
  const videoUrl = s3.enabled
    ? `${s3.config.publicEndpoint}/${video.id}.mp4`
    : `${origin}/api/v/${video.id}`;
  const thumbUrl = s3.enabled
    ? `${s3.config.publicEndpoint}/${video.id}.webp`
    : `${origin}/api/t/${video.id}`;

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
    openGraph: {
      // General meta tags
      siteName: "Clippy",
      url: `${origin}/${video.id}`,
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
  const { video, longDate, shortDate, videoUrl, thumbUrl } = await getVideoInfo(
    params.id
  );

  return (
    <main className="max-w-5xl mx-auto py-10">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{video.title}</CardTitle>
          <CardDescription>
            {`${video.views} Views • `}
            <span title={longDate}>{shortDate} ago</span>
          </CardDescription>
        </CardHeader>

        <AspectRatio ratio={16 / 9}>
          <video controls autoPlay poster={thumbUrl}>
            <source src={videoUrl} />
          </video>
        </AspectRatio>
      </Card>
    </main>
  );
}
