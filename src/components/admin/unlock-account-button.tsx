"use client";

import { Key } from "lucide-react";
import { AlertDialogTooltipButton } from "../alert-dialog-tooltip-button";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";

export const UnlockAccountButton = ({ id }: { id: string }) => {
  const { toast } = useToast();
  const router = useRouter();

  const unlockUser = () => {
    fetch(`/api/admin/user/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "Completed",
      } satisfies Partial<User>),
    })
      .then((resp) => {
        if (resp.ok) {
          toast({
            title: "Success",
            description: `Successfully unlocked user: ${id}`,
          });
          router.refresh();
        } else {
          toast({
            title: "Error",
            description: `Error while updating user: ${resp.status} - ${resp.statusText}`,
          });
        }
      })
      .catch((e) => {
        toast({
          title: "Error",
          description: `Error while updating user: ${e}`,
        });
      });
  };

  return (
    <AlertDialogTooltipButton
      tooltip="Unlock Account"
      title="Unlock User Account"
      description="Are you sure you want to unlock this user's account?"
      cancel="Cancel"
      action="Unlock"
      onClick={unlockUser}
    >
      <Key />
    </AlertDialogTooltipButton>
  );
};
