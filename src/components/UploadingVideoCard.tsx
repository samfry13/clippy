import { Card, CardHeader, CardMedia, CircularProgress } from "@mui/material";
import { UploadingVideo } from "../utils/useUploadForm";

const VideoCard = ({ video }: { video: UploadingVideo }) => {
  return (
    <>
      <Card sx={{ maxWidth: 345 }} elevation={5}>
        <CardHeader
          title={video.title}
          subheader={video.progress < 100 ? "Uploading..." : "Processing..."}
        />
        <CardMedia>
          <div
            style={{
              height: 140,
              backgroundColor: "#222",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {video.progress < 100 ? (
              <div
                style={{
                  border: "1px solid #eee",
                  width: "75%",
                  height: "40px",
                  borderRadius: "10px",
                  padding: "4px",
                  display: "flex",
                }}
              >
                <div
                  style={{
                    width: `${15}%`,
                    backgroundColor: "#eee",
                    borderRadius: "10px",
                  }}
                />
                <div style={{ flexGrow: 1 }} />
              </div>
            ) : (
              <CircularProgress sx={{ color: "#eee" }} />
            )}
          </div>
        </CardMedia>
      </Card>
    </>
  );
};

export default VideoCard;
