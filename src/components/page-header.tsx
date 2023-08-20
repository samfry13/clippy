import { DefaultSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { AddVideoModal } from "./add-video-modal";
import { UserAvatar } from "./user-avatar";
import { ModeToggle } from "./theme-mode-toggle";

export const PageHeader = ({ user }: { user: DefaultSession["user"] }) => {
  return (
    <nav className="flex p-4 shadow-md justify-between">
      <div className="flex gap-4 items-center">
        <Image src="/clippy-icon.svg" alt="Logo" width={32} height={32} />
        <Link href="/">Clippy</Link>
      </div>
      <AddVideoModal />
      <div className="flex gap-4 items-center">
        <ModeToggle />
        <UserAvatar user={user} />
      </div>
    </nav>
  );
};
