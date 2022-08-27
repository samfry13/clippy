import { Video } from "@prisma/client";
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
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";
import { useRouter } from "next/router";
import { Close } from "@mui/icons-material";
import { useMutation, useQueryClient } from "react-query";
import { useSession } from "next-auth/react";

const VideoCard = ({ video }: { video: Video }) => {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  const queryClient = useQueryClient();
  const { mutate: deleteVideo } = useMutation(
    ["delete", video.id],
    async () => {
      await fetch(`/api/videos/delete?id=${video.id}`, {
        method: "DELETE",
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getAllVideos", session?.user?.id]);
      },
    }
  );

  return (
    <>
      <Card sx={{ maxWidth: 345 }} elevation={5}>
        <CardHeader
          title={<p>{video.title}</p>}
          subheader={`${video.views} Views • ${video.createdAt}`}
          action={
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVertIcon />
            </IconButton>
          }
        />
        <CardActionArea onClick={() => router.push(`/${video.id}`)}>
          <CardMedia
            component="img"
            height="140"
            image={`/api/t/${video.id}`}
            alt={video.description}
          />
        </CardActionArea>
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
