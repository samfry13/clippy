import { useCallback, useEffect, useState } from 'react';
import { Video, VideoProgress } from '@prisma/client';
import axios, { AxiosResponse } from 'axios';
import { env } from '../env/client.mjs';

export type VideoInclude = Video & {
  progress?: VideoProgress;
};

interface Callback<T> {
  (err: any, result?: undefined): void;
  (err: undefined | null, result: T): void;
}

const useUploadForm = (url: string, callback: Callback<VideoInclude>) => {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    // prevent the window from being
    const beforeUnload = () => '';
    if (files.length) {
      window.addEventListener('beforeunload', beforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
    };
  });

  const uploadFiles = useCallback(
    (_files?: File[]) => {
      if (!_files) return;

      // this allows us to filter out any files that had an error while attempting to upload
      let tempFiles = _files;

      for (let i = 0; i < _files.length; i++) {
        const file = _files[i]!;
        try {
          if (file.size > env.NEXT_PUBLIC_MAX_UPLOAD_SIZE) {
            throw new Error(`Filesize too large - ${file.name}`);
          }

          const formData = new FormData();
          formData.append('video_file', file);
          formData.append('video_title', file.name);

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
              callback(null, resp.data);
            });
        } catch (e) {
          tempFiles = tempFiles?.filter(
            (tempFile) => tempFile.name !== file.name,
          );
          callback(e);
        }
      }

      setFiles([...files, ...tempFiles]);
      setProgress({
        ...progress,
        ...tempFiles.reduce((t, c) => ({ ...t, [c.name]: 0 }), {}),
      });
    },
    [files, progress, url, callback],
  );

  return {
    uploadFiles,
    progress,
    files,
  };
};

export default useUploadForm;
