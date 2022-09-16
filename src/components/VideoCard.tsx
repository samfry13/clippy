import {
  Button,
  Card,
  CardActionArea,
  CardHeader,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Close } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSession } from 'next-auth/react';
import { VideoInclude } from '../utils/useUploadForm';
import { format, formatDistanceToNow } from 'date-fns';
import CardProgress from './CardProgress';
import { VideoProgress } from '@prisma/client';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useSnackbar } from 'notistack';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)({
  '& .MuiInput-root:before': {
    border: 'none',
  },
  '& .MuiInput-input': {
    textOverflow: 'ellipsis',
  },
});

const VideoCard = ({ video }: { video: VideoInclude }) => {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const { enqueueSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();
  const [progress, setProgress] = useState<number | undefined>(
    video.progress?.progress,
  );
  const queryClient = useQueryClient();
  const { mutate: deleteVideo } = useMutation(
    ['delete', video.id],
    async () => {
      await axios
        .delete(`/api/videos/${video.id}`)
        .catch((err) => enqueueSnackbar(err.message, { variant: 'error' }));
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['getAllVideos', session?.user?.id]);
      },
    },
  );

  useQuery(
    ['getProgress', video.id],
    async () => {
      return await axios
        .get(`/api/videos/${video.id}/progress`)
        .catch((err: AxiosError) => {
          if (err.response?.status !== 404) {
            enqueueSnackbar(err.message, { variant: 'error' });
          } else {
            throw err;
          }
        });
    },
    {
      enabled: Boolean(video.progress),
      refetchInterval: 1000,
      retry: false,
      onSuccess: (data: AxiosResponse<VideoProgress>) => {
        setProgress(data.data.progress);
      },
      onError: (err: AxiosError) => {
        if (err.response?.status === 404) {
          setProgress(undefined);
          queryClient.invalidateQueries(['getAllVideos', session?.user?.id]);
        }
      },
    },
  );

  const [title, setTitle] = useState(video.title);
  useEffect(() => {
    if (video.title !== title) {
      setTitle(video.title);
    }
    // we only want to update when the props update, otherwise this would fire
    // every time we update the text field
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.title]);
  const [hasTitleChanged, setHasTitleChanged] = useState(false);
  const { mutate: updateVideoTitle } = useMutation(
    ['updateTitle', video.id],
    async (newTitle: string) => {
      await axios
        .patch(`/api/videos/${video.id}`, {
          title: newTitle,
        })
        .catch((err) => enqueueSnackbar(err.message, { variant: 'error' }));
    },
  );

  const createdAt = new Date(video.createdAt);
  const shortCreatedAt = formatDistanceToNow(createdAt);
  const longCreatedAt = format(createdAt, 'PPPPp');

  const totalProgress = progress || video.progress?.progress;

  return (
    <>
      <Card sx={{ maxWidth: 345 }} elevation={5}>
        <CardHeader
          sx={{
            display: 'flex',
            overflow: 'hidden',
            '& .MuiCardHeader-content': {
              overflow: 'hidden',
            },
          }}
          disableTypography
          title={
            <StyledTextField
              variant="standard"
              fullWidth
              placeholder="Add a title..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setHasTitleChanged(true);
              }}
              onBlur={(e) => {
                if (hasTitleChanged) {
                  setHasTitleChanged(false);
                  updateVideoTitle(e.target.value);
                }
              }}
            />
          }
          subheader={
            <Typography noWrap variant="caption">
              {video.progress ? (
                'Processing...'
              ) : (
                <span>
                  {`${video.views} Views • `}
                  <Tooltip title={longCreatedAt}>
                    <span>{`${shortCreatedAt} ago`}</span>
                  </Tooltip>
                </span>
              )}
            </Typography>
          }
          action={
            video.progress ? undefined : (
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreVertIcon />
              </IconButton>
            )
          }
        />
        {video.progress ? (
          <CardMedia>
            <CardProgress
              progress={totalProgress!}
              thumbnail={`/api/t/${video.id}`}
            />
          </CardMedia>
        ) : (
          <CardActionArea onClick={() => router.push(`/${video.id}`)}>
            <CardMedia
              component="img"
              height="140"
              image={`/api/t/${video.id}`}
              alt={video.description}
            />
          </CardActionArea>
        )}
      </Card>

      <Menu open={open} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
        <MenuItem
          onClick={() => {
            navigator.clipboard.writeText(
              `${window.location.origin}/${video.id}`,
            );
            enqueueSnackbar('Copied Link!');
            setAnchorEl(null);
          }}
        >
          Copy Link
        </MenuItem>
        <MenuItem onClick={() => setDialogOpen(true)}>Delete</MenuItem>
      </Menu>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {'Delete Video'}
          <IconButton
            onClick={() => setDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this video?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              deleteVideo();
              enqueueSnackbar('Video deleted');
              setDialogOpen(false);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VideoCard;
