import "../globals.css";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Inter } from "next/font/google";
import { PageHeader } from "~/components/page-header";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { ThemeProvider } from "~/components/theme-provider";
import { Toaster } from "~/components/ui/toaster";
import { prisma } from "~/lib/server/prisma";
import { UserStatus } from "@prisma/client";
import { TooltipProvider } from "~/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clippy",
  description: "Self-hosted clips",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/signin");
  }

  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return redirect("/signin");
  }

  if (user.status === UserStatus.AwaitingApproval) {
    return redirect("/awaiting-approval");
  }

  if (user.status === UserStatus.Locked) {
    return redirect("/locked");
  }

  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          type="image/png"
          sizes="48x48"
          href="/favicon-48x48.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="144x144"
          href="/favicon-144x144.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/favicon-192x192.png"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider delayDuration={250}>
            <PageHeader user={user} />
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
