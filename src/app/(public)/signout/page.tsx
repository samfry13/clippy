"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { signOut } from "next-auth/react";

export default function Signin() {
  return (
    <div className="max-w-xs mx-auto mt-20">
      <Card>
        <CardHeader>
          <CardTitle>Sign Out</CardTitle>
          <CardDescription>Are you sure you want to sign out?</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col">
          <Button onClick={() => signOut({ callbackUrl: "/signin" })}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
