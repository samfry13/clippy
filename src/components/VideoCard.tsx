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
  Snackbar,
  Tooltip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";
import { useRouter } from "next/router";
import { Close } from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useSession } from "next-auth/react";
import { VideoInclude } from "../utils/useUploadForm";
import { format, formatDistanceToNow } from "date-fns";
import CardProgress from "./CardProgress";
import { VideoProgress } from "@prisma/client";
import axios, { AxiosError, AxiosResponse } from "axios";

const VideoCard = ({ video }: { video: VideoInclude }) => {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();
  const [progress, setProgress] = useState<number | undefined>(
    video.progress?.progress
  );
  const queryClient = useQueryClient();
  const { mutate: deleteVideo } = useMutation(
    ["delete", video.id],
    async () => {
      await fetch(`/api/videos/${video.id}`, {
        method: "DELETE",
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllVideos", session?.user?.id]);
      },
    }
  );

  useQuery(
    ["getProgress", video.id],
    async () => {
      return await axios.get(`/api/videos/${video.id}/progress`);
    },
    {
      enabled: Boolean(video.progress),
      refetchInterval: 1000,
      retry: false,
      onSuccess: (data: AxiosResponse<VideoProgress>) => {
        setProgress(data.data.progress);
      },
      onError: (err: AxiosError) => {
        console.log(err);
        if (err.response?.status === 404) {
          setProgress(undefined);
          queryClient.invalidateQueries(["getAllVideos", session?.user?.id]);
        }
      },
    }
  );

  const createdAt = new Date(video.createdAt);
  const shortCreatedAt = formatDistanceToNow(createdAt);
  const longCreatedAt = format(createdAt, "PPPPp");

  const totalProgress = progress || video.progress?.progress;

  return (
    <>
      <Card sx={{ maxWidth: 345 }} elevation={5}>
        <CardHeader
          sx={{
            display: "flex",
            overflow: "hidden",
            "& .MuiCardHeader-content": {
              overflow: "hidden",
            },
          }}
          titleTypographyProps={{ noWrap: true }}
          title={video.title}
          subheaderTypographyProps={{ noWrap: true, variant: "caption" }}
          subheader={
            totalProgress ? (
              "Processing..."
            ) : (
              <span>
                {`${video.views} Views • `}
                <Tooltip title={longCreatedAt}>
                  <span>{`${shortCreatedAt} ago`}</span>
                </Tooltip>
              </span>
            )
          }
          action={
            totalProgress ? undefined : (
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreVertIcon />
              </IconButton>
            )
          }
        />
        {totalProgress ? (
          <CardMedia>
            <CardProgress
              progress={totalProgress}
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
              `${window.location.origin}/${video.id}`
            );
            setSnackbarOpen(true);
            setAnchorEl(null);
          }}
        >
          Copy Link
        </MenuItem>
        <MenuItem onClick={() => setDialogOpen(true)}>Delete</MenuItem>
      </Menu>

      <Snackbar
        message="Copied Link!"
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        // anchorOrigin={{ vertical: "top", horizontal: "right" }}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {"Delete Video"}
          <IconButton
            onClick={() => setDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
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
