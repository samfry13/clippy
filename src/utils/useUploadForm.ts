import { useCallback, useEffect, useState } from "react";
import { Video, VideoProgress } from "@prisma/client";
import axios, { AxiosResponse } from "axios";

export type VideoInclude = Video & {
  progress?: VideoProgress;
};

const useUploadForm = (
  url: string,
  callback: (video: VideoInclude) => void
) => {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    // prevent the window from being
    const beforeUnload = () => "";
    window.addEventListener("beforeunload", beforeUnload);

    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
    };
  });

  const uploadFiles = useCallback(
    (_files?: File[]) => {
      if (!_files?.length) return;

      for (let i = 0; i < _files.length; i++) {
        const file = _files[i]!;
        const filesIdx = i + files.length;

        const formData = new FormData();
        formData.append("video_file", file);
        formData.append("video_title", file.name);

        axios
          .post<any, AxiosResponse<VideoInclude>, FormData>(url, formData, {
            onUploadProgress: (ev) => {
              setProgress({
                ...progress,
                [file.name]: Math.round(ev.loaded * 100) / ev.total,
              });
            },
          })
          .then((resp) => {
            setFiles(files.filter((f) => f.name !== file.name));
            const newProgress = { ...progress };
            delete newProgress[file.name];
            setProgress(newProgress);
            callback(resp.data);
          });
      }

      setFiles([...files, ..._files]);
      setProgress({
        ...progress,
        ..._files.reduce((t, c) => ({ ...t, [c.name]: 0 }), {}),
      });
    },
    [files, progress, url, callback]
  );

  return {
    uploadFiles,
    progress,
    files,
  };
};

export default useUploadForm;
