import { Video } from "@prisma/client";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { format, formatDistanceToNow } from "date-fns";
import { AspectRatio } from "./ui/aspect-ratio";
import Image from "next/image";
import { TitleInput } from "./title-input";
import { VideoCardMenu } from "./video-card-menu";

export const VideoCard = ({ video }: { video: Video }) => {
  const createdAt = new Date(video.createdAt);
  const shortDate = formatDistanceToNow(createdAt);
  const longDate = format(createdAt, "PPPPp");

  return (
    <Card className="overflow-hidden">
      <CardHeader className="relative px-6 pb-6 pt-2 [&>button~*]:pr-7 [&>button+div]:translate-y-[-3px] [&>button]:absolute [&>button]:right-4 [&>button]:top-4">
        <VideoCardMenu id={video.id} />

        <CardTitle>
          <TitleInput id={video.id} initialValue={video.title} />
        </CardTitle>
        <CardDescription>
          {`${video.views} Views • `}
          <span title={longDate}>{shortDate} ago</span>
        </CardDescription>
      </CardHeader>

      <a href={`/${video.id}`}>
        <AspectRatio ratio={16 / 9}>
          <Image
            className="hover:brightness-125 transition-all duration-200 object-contain"
            fill
            placeholder="empty"
            alt={`${video.title}`}
            src={`/api/t/${video.id}`}
          />
        </AspectRatio>
      </a>
    </Card>
  );
};
