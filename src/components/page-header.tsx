import Image from "next/image";
import Link from "next/link";
import { cn } from "~/lib/utils";

export const PageHeader = () => {
  return (
    <nav className="flex gap-4 p-4 shadow-md items-center">
      <Image src="/clippy-icon.svg" alt="Logo" width={32} height={32} />
      <Link href="/">Clippy</Link>
    </nav>
  );
};
