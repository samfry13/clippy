import Head from 'next/head';
import PageContainer from '../components/PageContainer';
import { GetServerSideProps } from 'next';
import { getVideo, updateViewCount } from '../server/db/videos';
import { useQuery } from 'react-query';
import { Card, CardHeader, CardMedia, Container, Tooltip } from '@mui/material';
import axios from 'axios';
import { env } from '../env/server.mjs';
import { format, formatDistanceToNow } from 'date-fns';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const video = await getVideo({ id: id as string });
  if (!video) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  await updateViewCount({ id: id as string, amount: 1 });

  const protocol = env.NODE_ENV === 'production' ? 'https' : 'http';
  const origin = context.req.url
    ? new URL(context.req.url, `${protocol}://${context.req.headers.host}`)
        .origin
    : '';

  return {
    props: {
      video: {
        ...video,
        createdAt: video?.createdAt.toLocaleDateString('en-us'),
      },
      origin,
    },
  };
};

interface Video {
  title: string;
  description: string;
  id: string;
  createdAt: string;
  views: number;
}

const VideoPage = ({
  video: _video,
  origin,
}: {
  video: Video;
  origin: string;
}) => {
  const { data: video } = useQuery<Video>(
    ['getVideo', _video.id],
    () => axios.get(`/api/videos/${_video.id}`).then((resp) => resp.data),
    {
      enabled: Boolean(_video.id),
      initialData: _video,
    },
  );

  if (!video) {
    return null;
  }

  const createdAt = new Date(video.createdAt);
  const shortCreatedAt = formatDistanceToNow(createdAt);
  const longCreatedAt = format(createdAt, 'PPPPp');

  return (
    <>
      <Head>
        <title>{video.title ? `Clippy - ${video.title}` : 'Clippy'}</title>

        {/*General meta tags*/}
        <meta property="og:site_name" content="Clippy" />
        <meta property="og:url" content={`${origin}/${video.id}`} />
        <meta property="og:title" content={video.title} />
        <meta property="og:description" content={video.description} />
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

      <PageContainer>
        <Container sx={{ marginTop: 5 }}>
          <Card sx={{ marginTop: 5 }}>
            <CardHeader
              title={video.title}
              titleTypographyProps={{ noWrap: true }}
              subheader={
                <span>
                  {`${video.views} Views • `}
                  <Tooltip title={longCreatedAt}>
                    <span>{`${shortCreatedAt} ago`}</span>
                  </Tooltip>
                </span>
              }
              subheaderTypographyProps={{ noWrap: true, variant: 'caption' }}
            />
            <CardMedia>
              <video
                controls
                autoPlay
                preload="metadata"
                poster={`/api/t/${video.id}`}
                style={{ width: 'calc(100% - 24px)', margin: '10px' }}
              >
                <source src={`/api/v/${video.id}`} />
              </video>
            </CardMedia>
          </Card>
        </Container>
      </PageContainer>
    </>
  );
};

export default VideoPage;
