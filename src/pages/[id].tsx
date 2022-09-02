import Head from "next/head";
import PageContainer from "../components/PageContainer";
import { GetServerSideProps } from "next";
import { getVideo, updateViewCount } from "../server/db/videos";
import { useQuery } from "react-query";
import { Card, CardHeader, CardMedia, Container } from "@mui/material";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  const video = await getVideo({ id: id as string });
  if (!video) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  await updateViewCount({ id: id as string, amount: 1 });

  return {
    props: {
      video: {
        ...video,
        createdAt: video?.createdAt.toLocaleDateString("en-us"),
      },
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

const VideoPage = ({ video: _video }: { video: Video }) => {
  const { data: video } = useQuery<Video>(
    ["getVideo", _video.id],
    async () => {
      return await fetch(`/api/videos/get?id=${_video.id}`).then((resp) =>
        resp.json()
      );
    },
    {
      enabled: Boolean(_video.id),
      initialData: _video,
    }
  );

  if (!video) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{video.title ? `Clippy - ${video.title}` : "Clippy"}</title>

        <meta property="og:title" content={video.title} />
        <meta property="og:type" content="video.other" />
        <meta property="og:image" content={`/api/t/${video.id}`} />
        <meta property="og:video" content={`/api/v/${video.id}`} />
        <meta property="og:video:url" content={`/api/v/${video.id}`} />
        <meta property="og:video:secure_url" content={`/api/v/${video.id}`} />
        <meta property="og:description" content={video.description} />
        <meta property="og:site_name" content="Clippy" />
        <meta property="og:url" content={`/api/v/${video.id}`} />
      </Head>

      <PageContainer>
        <Container sx={{ marginTop: 5 }}>
          <Card sx={{ marginTop: 5 }}>
            <CardHeader
              title={video.title}
              subheader={`${video.views} Views • ${video.createdAt}`}
            />
            <CardMedia>
              <video
                controls
                autoPlay
                muted
                preload="metadata"
                poster={`/api/t/${video.id}`}
                style={{ width: "calc(100% - 24px)", margin: "10px" }}
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
