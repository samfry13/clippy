"use client";

import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useRef } from "react";

export const AddVideoModal = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        accept="video/*"
        onChange={(e) => {
          if (inputRef.current) {
            inputRef.current.value = "";
          }
        }}
      />
      <Button onClick={() => inputRef.current?.click()} className="flex gap-2">
        <Plus />
        <span className="hidden sm:block">Upload Video</span>
      </Button>
    </>
  );
};
