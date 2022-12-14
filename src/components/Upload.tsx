import { Fab } from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import { useEffect, useRef } from 'react';
import useUploadForm from 'utils/useUploadForm';
import { useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';

const Upload = ({
  setUploadingVideos,
}: {
  setUploadingVideos: (files: { file: File; progress: number }[]) => void;
}) => {
  const input = useRef<HTMLInputElement>(null);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { uploadFiles, files, progress } = useUploadForm(
    '/api/videos/upload',
    (error) => {
      if (error) {
        enqueueSnackbar(`${error}`, {
          variant: 'error',
          autoHideDuration: 5000,
        });
      } else {
        queryClient.invalidateQueries(['getAllVideos']);
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
        accept="video/*"
        onChange={(e) => {
          uploadFiles([...Array.from(e.target.files || [])]);
          if (input.current) {
            input.current.value = '';
          }
        }}
      />
      <Fab
        variant="extended"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => input.current?.click()}
      >
        <UploadIcon sx={{ mr: 1 }} />
        Upload
      </Fab>
    </>
  );
};

export default Upload;
