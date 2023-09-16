"use client";

import { Button } from "./ui/button";
import { useToast } from "~/components/ui/use-toast";

export default function ToastButton() {
  const { toast } = useToast();
  return (
    <Button
      onClick={() =>
        toast({
          title: "Success!",
          description: "Your video has been uploaded",
          duration: 2000,
        })
      }
    >
      Toast
    </Button>
  );
}
