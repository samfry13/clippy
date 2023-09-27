"use client";

import { signIn } from "next-auth/react";
import { Button } from "./ui/button";
import { BuiltInProviderType } from "next-auth/providers/index";

export const ProviderButton = ({
  id,
  name,
  callbackUrl,
}: {
  id: BuiltInProviderType;
  name: string;
  callbackUrl?: string;
}) => {
  return (
    <Button onClick={() => signIn(id, { callbackUrl })}>
      Sign in with {name}
    </Button>
  );
};
