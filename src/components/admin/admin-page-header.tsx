import Image from "next/image";
import Link from "next/link";
import { UserAvatar } from "../user-avatar";
import { ModeToggle } from "../theme-mode-toggle";
import { User } from "@prisma/client";

export const AdminPageHeader = ({ user }: { user: User }) => {
  return (
    <nav className="flex p-4 shadow-md dark:shadow-primary-foreground justify-between">
      <div className="flex gap-4 items-center">
        <Image src="/clippy-icon.svg" alt="Logo" width={32} height={32} />
        <Link href="/">Clippy</Link>
      </div>
      <div className="flex gap-4 items-center">
        <ModeToggle />
        <UserAvatar user={user} />
      </div>
    </nav>
  );
};
