import { CircularProgress } from "@mui/material";

const CardProgress = ({
  progress,
  thumbnail,
}: {
  progress: number;
  thumbnail?: string;
}) => {
  return (
    <div
      style={{
        height: 140,
        ...(thumbnail
          ? {
              backgroundImage: `url(${thumbnail})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : { backgroundColor: "#222" }),
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      {thumbnail && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backdropFilter: "blur(2px)",
          }}
        />
      )}
      {progress < 100 ? (
        <div
          style={{
            border: "1px solid #eee",
            width: "75%",
            height: "40px",
            borderRadius: "10px",
            padding: "4px",
            display: "flex",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              backgroundColor: "#eee",
              borderRadius: "10px",
            }}
          />
          <div style={{ flexGrow: 1 }} />
        </div>
      ) : (
        <CircularProgress sx={{ color: "#eee", zIndex: 1 }} />
      )}
    </div>
  );
};

export default CardProgress;
