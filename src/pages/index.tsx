import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import PageContainer from '../components/PageContainer';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import VideoCard from '../components/VideoCard';
import { Video } from '@prisma/client';
import { Container, Grid } from '@mui/material';
import { getAllUsersVideos } from '../server/db/videos';
import { useQuery, useQueryClient } from 'react-query';
import Upload from '../components/Upload';
import UploadingVideoCard from '../components/UploadingVideoCard';
import { VideoInclude } from '../utils/useUploadForm';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions,
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
        createdAt: video.createdAt.toISOString(),
      })),
    },
  };
};

const Home = ({ videos }: { videos: VideoInclude[] }) => {
  const { data: session } = useSession();
  useEffect(() => {
    if (!session?.user) {
      signIn();
    }
  }, [session]);

  const { data } = useQuery<Video[]>(
    ['getAllVideos', session?.user?.id],
    async () => {
      return await fetch(
        `/api/videos/getAllForUser?userId=${session!.user!.id}`,
      ).then((resp) => resp.json());
    },
    {
      enabled: Boolean(session?.user?.id),
      initialData: videos,
    },
  );

  const [uploadingVideos, setUploadingVideos] = useState<
    { file: File; progress: number }[]
  >([]);

  return (
    <>
      <Head>
        <title>Clippy</title>
        <meta name="description" content="Self-hosted clips" />
        <link
          rel="icon"
          type="image/png"
          sizes="48x48"
          href="/favicon-48x48.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="144x144"
          href="/favicon-144x144.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/favicon-192x192.png"
        />
      </Head>

      <PageContainer>
        <Container sx={{ marginTop: 5 }}>
          <Grid container spacing={2}>
            {uploadingVideos.map((video, i) => (
              <Grid item xs={6} md={4} lg={3} key={`${i}-${video.file.name}`}>
                <UploadingVideoCard
                  file={video.file}
                  progress={video.progress}
                />
              </Grid>
            ))}
            {data?.map((video) => (
              <Grid item xs={6} md={4} lg={3} key={video.id}>
                <VideoCard video={video} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </PageContainer>

      <Upload setUploadingVideos={setUploadingVideos} />
    </>
  );
};

export default Home;
