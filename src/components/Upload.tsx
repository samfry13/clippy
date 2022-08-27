import { Fab } from "@mui/material";
import { Upload as UploadIcon } from "@mui/icons-material";
import { useEffect, useRef } from "react";
import useUploadForm, { UploadingVideo } from "../utils/useUploadForm";

const Upload = ({
  setUploadingVideo,
}: {
  setUploadingVideo: (video: UploadingVideo) => void;
}) => {
  const input = useRef<HTMLInputElement>(null);
  const { uploadFile, video } = useUploadForm("/api/upload");

  useEffect(() => {
    if (video) {
      setUploadingVideo(video);
    }
  }, [video, setUploadingVideo]);

  return (
    <>
      <input
        type="file"
        style={{ display: "none" }}
        ref={input}
        onChange={(e) => {
          const file = e.target.files?.[0];
          uploadFile(file);
        }}
      />
      <Fab
        variant="extended"
        sx={{ position: "absolute", bottom: 16, right: 16 }}
        onClick={() => input.current?.click()}
      >
        <UploadIcon sx={{ mr: 1 }} />
        Upload
      </Fab>
    </>
  );
};

export default Upload;
