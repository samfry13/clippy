"use client";

import { signIn } from "next-auth/react";
import { Button } from "./ui/button";

export const ProviderButton = ({
  id,
  name,
  callbackUrl,
}: {
  id: string;
  name: string;
  callbackUrl?: string;
}) => {
  return (
    <Button onClick={() => signIn(id, { callbackUrl })}>
      Sign in with {name}
    </Button>
  );
};
