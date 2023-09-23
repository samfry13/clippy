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
import Head from "next/head";
import { headers } from "next/headers";

export default async function VideoPage({
  params,
}: {
  params: { id: string };
}) {
  const video = await prisma.video.findFirst({
    where: {
      id: params.id,
    },
  });

  if (!video) {
    notFound();
  }

  const hostname = headers().get("host");
  const origin = hostname?.includes("localhost")
    ? `http://${hostname}`
    : `https://${hostname}`;

  const createdAt = new Date(video.createdAt);
  const shortDate = formatDistanceToNow(createdAt);
  const longDate = format(createdAt, "PPPPp");

  return (
    <>
      <Head>
        <title>{video.title ? `Clippy - ${video.title}` : "Clippy"}</title>

        {/*General meta tags*/}
        <meta property="og:site_name" content="Clippy" />
        <meta property="og:url" content={`${origin}/${video.id}`} />
        <meta property="og:title" content={video.title} />
        <meta property="og:type" content="video.other" />
        {/*Video-specific meta tags*/}
        <meta property="og:video" content={`${origin}/api/v/${video.id}`} />
        <meta property="og:video:url" content={`${origin}/api/v/${video.id}`} />
        <meta
          property="og:video:secure_url"
          content={`${origin}/api/v/${video.id}`}
        />
        <meta property="og:video:type" content="video/mp4" />
        <meta property="og:video:width" content="1920" />
        <meta property="og:video:height" content="1080" />
        <meta property="og:image" content={`${origin}/api/t/${video.id}`} />
      </Head>

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
            <video controls autoPlay poster={`/api/t/${video.id}`}>
              <source src={`/api/v/${video.id}`} />
            </video>
          </AspectRatio>
        </Card>
      </main>
    </>
  );
}
