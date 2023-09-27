"use client";

import { signIn } from "next-auth/react";
import { Button } from "./ui/button";

export const ProviderButton = ({ id, name }: { id: string; name: string }) => {
  return <Button onClick={() => signIn(id)}>Sign in with {name}</Button>;
};
