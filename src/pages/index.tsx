import type { GetServerSideProps } from "next";
import Head from "next/head";
import PageContainer from "../components/PageContainer";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import VideoCard from "../components/VideoCard";
import { Video } from "@prisma/client";
import { Container, Grid } from "@mui/material";
import { getAllUsersVideos } from "../server/db/videos";
import { useQuery, useQueryClient } from "react-query";
import Upload from "../components/Upload";
import { UploadingVideo } from "../utils/useUploadForm";
import UploadingVideoCard from "../components/UploadingVideoCard";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  let videos;
  if (session?.user) {
    videos = await getAllUsersVideos({
      userId: session.user.id,
      limit: 10,
      start: 0,
    });
  }

  return {
    props: {
      session,
      videos: (videos || []).map((video) => ({
        ...video,
        createdAt: video.createdAt.toLocaleString(),
      })),
    },
  };
};

const Home = ({ videos }: { videos: Video[] }) => {
  const { data: session } = useSession();
  useEffect(() => {
    if (!session?.user) {
      signIn();
    }
  }, [session]);

  const { data } = useQuery<Video[]>(
    ["getAllVideos", session?.user?.id],
    async () => {
      return await fetch(
        `/api/videos/getAllForUser?id=${session!.user!.id}`
      ).then((resp) => resp.json());
    },
    {
      enabled: Boolean(session?.user?.id),
      initialData: videos,
    }
  );

  const [uploadingVideo, setUploadingVideo] = useState<UploadingVideo>();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (uploadingVideo?.success) {
      queryClient.invalidateQueries(["getAllVideos", session?.user?.id]);
    }
  }, [uploadingVideo?.success, queryClient, session?.user?.id]);

  return (
    <>
      <Head>
        <title>Clippy</title>
        <meta name="description" content="Self-hosted clips" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <PageContainer>
        <Container sx={{ marginTop: 5 }}>
          <Grid container spacing={2}>
            {uploadingVideo && !uploadingVideo.success && (
              <Grid item xs={6} md={4} key={uploadingVideo.id}>
                <UploadingVideoCard video={uploadingVideo} />
              </Grid>
            )}
            {data?.map((video) => (
              <Grid item xs={6} md={4} key={video.id}>
                <VideoCard video={video} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </PageContainer>

      <Upload setUploadingVideo={setUploadingVideo} />
    </>
  );
};

export default Home;
