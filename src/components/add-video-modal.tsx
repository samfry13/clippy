"use client";

import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useRef, useState } from "react";
import { Uploader } from "~/lib/uploader";
import { Progress } from "./ui/progress";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
} from "./ui/alert-dialog";

export const AddVideoModal = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="video/*"
        onChange={async (e) => {
          const file = e.target.files?.[0];

          if (file) {
            const { key, uploadId } = await fetch(
              "/api/upload/upload-multipart/start",
              {
                method: "POST",
                body: JSON.stringify({
                  filename: file.name,
                }),
              }
            ).then((resp) => resp.json());

            const uploader = new Uploader({
              file,
              getEndpoint: async (chunkNumber) => {
                return await fetch(
                  "/api/upload/upload-multipart/request-part",
                  {
                    method: "POST",
                    body: JSON.stringify({
                      key,
                      uploadId,
                      partNumber: chunkNumber + 1,
                    }),
                  }
                )
                  .then((resp) => resp.json())
                  .then(({ url }) => url);
              },
            });

            uploader.on("progress", (progress) =>
              setProgress(progress.detail * 100)
            );

            const abort = () => {
              fetch("/api/upload/upload-multipart/abort", {
                method: "POST",
                body: JSON.stringify({
                  key,
                  uploadId,
                }),
              });
            };

            uploader.on("success", (e) => {
              fetch("/api/upload/upload-multipart/complete", {
                method: "POST",
                body: JSON.stringify({
                  key,
                  uploadId,
                  etags: e.detail.etags,
                }),
              })
                .then(() => {
                  setProgress(null);
                })
                .catch(abort);
            });

            uploader.on("error", abort);

            uploader.upload();
            setProgress(1);
          }

          if (inputRef.current) {
            inputRef.current.value = "";
          }
        }}
      />

      <Button
        onClick={() => inputRef.current?.click()}
        className="flex gap-2 absolute bottom-4 right-4 sm:relative sm:bottom-[unset] sm:right-[unset]"
      >
        <Plus />
        <span className="hidden sm:block">Upload Video</span>
      </Button>

      <AlertDialog open={Boolean(progress)}>
        <AlertDialogContent>
          <AlertDialogHeader>Upload Progress</AlertDialogHeader>
          <Progress value={progress} />
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
