import { Fab, Snackbar } from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import useUploadForm from '../utils/useUploadForm';
import { useQueryClient } from 'react-query';
import { useSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';

const Upload = ({
  setUploadingVideos,
}: {
  setUploadingVideos: (files: { file: File; progress: number }[]) => void;
}) => {
  const input = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { uploadFiles, files, progress } = useUploadForm(
    '/api/videos/upload',
    (error) => {
      if (error) {
        enqueueSnackbar(`${error}`, { variant: 'error' });
      } else {
        queryClient.invalidateQueries(['getAllVideos', session?.user?.id]);
      }
    },
  );

  useEffect(() => {
    setUploadingVideos(
      files.map((file) => ({
        file,
        progress: progress[file.name]!,
      })),
    );
  }, [setUploadingVideos, files, progress]);

  return (
    <>
      <input
        type="file"
        multiple
        style={{ display: 'none' }}
        ref={input}
        onChange={(e) => {
          uploadFiles([...Array.from(e.target.files || [])]);
          if (input.current) {
            input.current.value = '';
          }
        }}
      />
      <Fab
        variant="extended"
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
        onClick={() => input.current?.click()}
      >
        <UploadIcon sx={{ mr: 1 }} />
        Upload
      </Fab>
    </>
  );
};

export default Upload;
