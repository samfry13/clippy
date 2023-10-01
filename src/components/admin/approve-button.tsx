"use client";

import { Check } from "lucide-react";
import { AlertDialogTooltipButton } from "../alert-dialog-tooltip-button";
import { User, UserStatus } from "@prisma/client";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";

export const ApproveButton = ({ id }: { id: string }) => {
  const { toast } = useToast();
  const router = useRouter();

  const approveUser = () => {
    fetch(`/api/admin/user/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: UserStatus.Completed,
      } satisfies Partial<User>),
    })
      .then((resp) => {
        if (resp.ok) {
          toast({
            title: "Success",
            description: `Successfully approved user: ${id}`,
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
      tooltip="Approve"
      title="Approve User"
      description="Are you sure you want to approve this user?"
      cancel="Cancel"
      action="Approve"
      onClick={approveUser}
    >
      <Check />
    </AlertDialogTooltipButton>
  );
};
