import { UserStatus } from "@prisma/client";
import { Badge, BadgeProps } from "../ui/badge";

export const UserStatusBadge = ({ status }: { status: UserStatus }) => {
  const variant = (
    {
      [UserStatus.AwaitingApproval]: "secondary",
      [UserStatus.Completed]: "default",
      [UserStatus.Locked]: "destructive",
    } satisfies Record<UserStatus, BadgeProps["variant"]>
  )[status];

  const text = (
    {
      [UserStatus.AwaitingApproval]: "Awaiting Approval",
      [UserStatus.Completed]: "Completed",
      [UserStatus.Locked]: "Locked",
    } satisfies Record<UserStatus, string>
  )[status];

  return <Badge variant={variant}>{text}</Badge>;
};
