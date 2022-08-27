import { useState } from "react";
import { Video } from "@prisma/client";

export interface UploadingVideo extends Video {
  progress: number;
  success: boolean;
  speed: string;
  uploading: true;
  abort: () => void;
}

const useUploadForm = (url: string) => {
  const [video, setVideo] = useState<UploadingVideo>();

  const uploadFile = (file?: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("video_file", file);
    formData.append("video_title", file.name);

    const xhr = new XMLHttpRequest();
    setVideo({
      uploading: true,
      title: file.name,
      description: "",
      id: "",
      userId: "",
      createdAt: new Date(),
      views: 0,
      success: false,
      progress: 0,
      speed: "0 MB/s",
      abort: xhr.abort,
    });

    const beforeUnload = () => "";

    window.addEventListener("beforeunload", beforeUnload);
    xhr.upload.addEventListener(
      "progress",
      (e) => {
        if (e.lengthComputable) {
          const bytesUploaded = e.loaded;
          const bytesTotal = e.total;
          const percentComplete = Math.round(
            (bytesUploaded / bytesTotal) * 100
          );
          setVideo((prevState) => ({
            ...(prevState as UploadingVideo),
            progress: percentComplete,
          }));
        }
      },
      false
    );
    xhr.addEventListener(
      "load",
      (e: any) => {
        window.removeEventListener("beforeunload", beforeUnload);
        const id = JSON.parse(e.target.responseText).id;
        setVideo((prevState) => ({
          ...(prevState as UploadingVideo),
          success: true,
          id,
        }));
      },
      false
    );
    xhr.addEventListener(
      "error",
      () => {
        setVideo(undefined);
      },
      false
    );
    xhr.addEventListener(
      "abort",
      () => {
        setVideo(undefined);
      },
      false
    );

    xhr.open("POST", url);
    xhr.send(formData);
  };

  return {
    uploadFile,
    video,
  };
};

export default useUploadForm;
