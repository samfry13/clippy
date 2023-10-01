import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "~/app/api/auth/[...nextauth]/route";
import { ApproveButton } from "~/components/admin/approve-button";
import { LockAccountButton } from "~/components/admin/lock-account-button";
import { UnlockAccountButton } from "~/components/admin/unlock-account-button";
import { UserStatusBadge } from "~/components/admin/user-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { TooltipProvider } from "~/components/ui/tooltip";
import { prisma } from "~/lib/server/prisma";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      _count: {
        select: {
          videos: {
            where: {
              status: "ready",
            },
          },
        },
      },
    },
    orderBy: {
      role: "asc",
    },
  });

  return (
    <main className="mx-auto py-10 px-4 gap-4">
      <TooltipProvider delayDuration={250}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">id</TableHead>
              <TableHead>name</TableHead>
              <TableHead>email</TableHead>
              <TableHead>videos</TableHead>
              <TableHead>role</TableHead>
              <TableHead>status</TableHead>
              <TableHead>actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="truncate">
                  <Link href={`/users/${user.id}`}>{user.id}</Link>
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user._count.videos}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <UserStatusBadge status={user.status} />
                </TableCell>
                <TableCell className="flex gap-2">
                  {user.id !== session?.user?.id && user.role !== "Admin" && (
                    <>
                      {user.status === "AwaitingApproval" && (
                        <ApproveButton id={user.id} />
                      )}
                      {user.status !== "Locked" && (
                        <LockAccountButton id={user.id} />
                      )}
                      {user.status === "Locked" && (
                        <UnlockAccountButton id={user.id} />
                      )}
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TooltipProvider>
    </main>
  );
}
