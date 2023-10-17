"use client";

import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useToast } from "./ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";

export const VideoCardMenu = ({ id, name }: { id: string; name: string }) => {
  const { toast } = useToast();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const router = useRouter();

  const deleteVideo = async () => {
    await fetch(`/api/video/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        toast({
          title: "Video deleted",
          description: "Video has been successfully deleted",
        });
        router.refresh();
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "There was an error deleting the video",
          variant: "destructive",
        });
      });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="w-9 h-9 bg-background hover:bg-secondary/80 flex justify-center items-center rounded-md transition-all">
          <MoreVertical className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/${id}`);
              toast({
                title: "Copied Link!",
              });
            }}
          >
            Copy Link
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={`/api/v/${id}`} download={name}>
              Download
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDeleteDialog(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={openDeleteDialog}
        onOpenChange={(open) => setOpenDeleteDialog(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this video?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteVideo()}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
