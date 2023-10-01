"use client";

import { ShieldOff } from "lucide-react";
import { AlertDialogTooltipButton } from "../alert-dialog-tooltip-button";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import { User, UserStatus } from "@prisma/client";

export const LockAccountButton = ({ id }: { id: string }) => {
  const { toast } = useToast();
  const router = useRouter();

  const lockUser = () => {
    fetch(`/api/admin/user/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: UserStatus.Locked,
      } satisfies Partial<User>),
    })
      .then((resp) => {
        if (resp.ok) {
          toast({
            title: "Success",
            description: `Successfully locked user: ${id}`,
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
      tooltip="Lock Account"
      title="Lock User Account"
      description="Are you sure you want to lock this user's account?"
      cancel="Cancel"
      action="Lock"
      onClick={lockUser}
      variant="destructive"
    >
      <ShieldOff />
    </AlertDialogTooltipButton>
  );
};
