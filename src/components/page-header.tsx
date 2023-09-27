import Image from "next/image";
import Link from "next/link";
import { AddVideoModal } from "./add-video-modal";
import { UserAvatar } from "./user-avatar";
import { ModeToggle } from "./theme-mode-toggle";
import { User } from "@prisma/client";

const DEFAULT_MAX_UPLOAD_SIZE = 100 * 1024 * 1024; // 100 MB
const DEFAULT_MAX_CHUNK_SIZE = 5 * 1024 * 1024; // 100 MB

export const PageHeader = ({ user }: { user?: User }) => {
  const config = {
    maxUploadSize:
      Number(process.env.MAX_UPLOAD_SIZE) || DEFAULT_MAX_UPLOAD_SIZE,
    maxChunkSize: Number(process.env.MAX_CHUNK_SIZE) || DEFAULT_MAX_CHUNK_SIZE,
  } as const;

  return (
    <nav className="flex p-4 shadow-md dark:shadow-primary-foreground justify-between">
      <div className="flex gap-4 items-center">
        <Image src="/clippy-icon.svg" alt="Logo" width={32} height={32} />
        <Link href="/">Clippy</Link>
      </div>
      {user && <AddVideoModal {...config} />}
      <div className="flex gap-4 items-center">
        <ModeToggle />
        {user && <UserAvatar user={user} />}
      </div>
    </nav>
  );
};
