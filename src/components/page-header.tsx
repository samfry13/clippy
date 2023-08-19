"use client";

import { DefaultSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export const PageHeader = ({ user }: { user: DefaultSession["user"] }) => {
  return (
    <nav className="flex p-4 shadow-md justify-between">
      <div className="flex gap-4 items-center">
        <Image src="/clippy-icon.svg" alt="Logo" width={32} height={32} />
        <Link href="/">Clippy</Link>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarImage src={user?.image ?? ""} />
            <AvatarFallback>{user?.name?.slice(0, 2)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              signOut();
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};
