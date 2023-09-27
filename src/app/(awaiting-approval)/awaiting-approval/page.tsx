"use client";

import { signOut } from "next-auth/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default async function LockedPage() {
  return (
    <div className="max-w-xs mx-auto mt-20">
      <Card>
        <CardHeader>
          <CardTitle>Awaiting Approval</CardTitle>
          <CardDescription>
            Your account is awaiting admin approval
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col">
          <Button onClick={() => signOut({ callbackUrl: "/signin" })}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
