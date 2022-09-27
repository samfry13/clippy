import { useCallback, useEffect, useState } from 'react';
import { Video, VideoProgress } from '@prisma/client';
import { createUpload } from '@mux/upchunk';
import { env } from 'env/client';

const DEFAULT_MAX_UPLOAD_SIZE = 104857600;
const DEFAULT_MAX_CHUNK_SIZE = 30720;

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
          if (file.size > (env('MAX_UPLOAD_SIZE') || DEFAULT_MAX_UPLOAD_SIZE)) {
            throw new Error(`Filesize too large - ${file.name}`);
          }
          if (!file.type.startsWith('video')) {
            throw new Error('Only video files are allowed');
          }

          const upload = createUpload({
            endpoint: `${url}?fileName=${file.name}`,
            file,
            method: 'POST',
            chunkSize: env('MAX_CHUNK_SIZE') || DEFAULT_MAX_CHUNK_SIZE,
          });

          upload.on('error', (err) => {
            console.error(err.detail);
          });

          upload.on('progress', (ev) => {
            setProgress({
              ...progress,
              [file.name]: Math.round(ev.detail),
            });
          });

          upload.on('success', () => {
            setFiles(files.filter((f) => f.name !== file.name));
            const newProgress = { ...progress };
            delete newProgress[file.name];
            setProgress(newProgress);
            callback(null);
          });

          const formData = new FormData();
          formData.append('video_file', file);
          formData.append('video_title', file.name);
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
