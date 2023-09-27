"use client";

import { useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { signIn } from "next-auth/react";

export const EmailSigninForm = ({ callbackUrl }: { callbackUrl?: string }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        signIn("email", { email: inputRef.current?.value, callbackUrl });
      }}
    >
      <Label htmlFor="email">Email Address</Label>
      <Input ref={inputRef} type="email" id="email" name="email" required />
      <Button type="submit" className="w-full mt-2">
        Sign in with Email
      </Button>
    </form>
  );
};
