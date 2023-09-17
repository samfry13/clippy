import { getServerSession } from "next-auth";
import { prisma } from "~/lib/server/prisma";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const videos = session?.user
    ? await prisma.video.findMany({
        where: {
          userId: session.user.id,
          status: "ready",
        },
      })
    : [];

  return (
    <main className="">
      <ul>
        {videos.map((video) => (
          <li key={video.id}>{video.title}</li>
        ))}
      </ul>
    </main>
  );
}
