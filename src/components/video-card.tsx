"use client";

import { Video } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Input } from "./ui/input";
import { AspectRatio } from "./ui/aspect-ratio";
import Image from "next/image";

export const VideoCard = ({ video }: { video: Video }) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const { shortDate, longDate } = useMemo(() => {
    const createdAt = new Date(video.createdAt);
    const shortDate = formatDistanceToNow(createdAt);
    const longDate = format(createdAt, "PPPPp");
    return { shortDate, longDate };
  }, [video.createdAt]);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{<Input defaultValue={video.title} />}</CardTitle>
        <CardDescription>
          {`${video.views} Views • `}
          <span title={longDate}>{shortDate} ago</span>
        </CardDescription>
      </CardHeader>

      <a href={`/${video.id}`}>
        <AspectRatio ratio={16 / 9}>
          <Image
            className="hover:brightness-125 transition-all duration-200"
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
