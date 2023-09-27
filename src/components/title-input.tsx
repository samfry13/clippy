"use client";

import { useDebounce } from "~/lib/useDebounce";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";
import { useEffect, useState } from "react";

export const TitleInput = ({
  id,
  initialValue,
}: {
  id: string;
  initialValue: string;
}) => {
  const { toast } = useToast();
  const [title, setTitle] = useState(initialValue);

  useEffect(() => {
    setTitle(initialValue);
  }, [initialValue]);

  const updateTitle = async (newTitle: string) => {
    await fetch(`/api/video/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: newTitle,
      }),
    }).catch(() => {
      toast({
        title: "Error",
        description: "There was an error updating the video's title",
        variant: "destructive",
      });
    });
  };

  useDebounce(
    () => {
      if (title !== initialValue) updateTitle(title);
    },
    1000,
    [title]
  );

  return (
    <Input
      className="px-0 py-1 text-lg h-auto border-none hover:ring-1 hover:ring-ring hover:ring-offset-1"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
    />
  );
};
