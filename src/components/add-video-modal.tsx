"use client";

import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useRef, useState } from "react";
import { Uploader } from "~/lib/uploader";
import { Progress } from "./ui/progress";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
} from "./ui/alert-dialog";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export const AddVideoModal = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<
    "loading" | "processing" | "uploading" | null
  >(null);
  const [progress, setProgress] = useState<number | null>(null);
  const ffmpegRef = useRef(new FFmpeg());

  const load = async () => {
    const baseUrl = "https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      console.log(message);
    });
    ffmpeg.on("progress", ({ progress }) => {
      setProgress(progress * 100);
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseUrl}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseUrl}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
      workerURL: await toBlobURL(
        `${baseUrl}/ffmpeg-core.worker.js`,
        "text/javascript"
      ),
    });
  };

  const transcode = async (file: Blob) => {
    const ffmpeg = ffmpegRef.current;

    await ffmpeg.writeFile(file.name, await fetchFile(file));
    await ffmpeg.exec([
      "-i",
      file.name,
      "-vcodec",
      "libx264",
      "-acodec",
      "aac",
      "-filter_complex",
      "scale=ceil(iw*min(1\\,min(1920/iw\\,1080/ih))/2)*2:(floor((ow/dar)/2))*2",
      "output.mp4",
    ]);
    const fileData = await ffmpeg.readFile("output.mp4");

    return new File([new Blob([(fileData as Uint8Array).buffer])], file.name);
  };

  const upload = async (file: File) => {
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
        return await fetch("/api/upload/upload-multipart/request-part", {
          method: "POST",
          body: JSON.stringify({
            key,
            uploadId,
            partNumber: chunkNumber + 1,
          }),
        })
          .then((resp) => resp.json())
          .then(({ url }) => url);
      },
    });

    uploader.on("progress", (progress) => setProgress(progress.detail * 100));

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
  };

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
            //TODO: load ffmpeg
            setStep("loading");
            setProgress(0);
            await load();
            setProgress(100);

            //TODO: process file
            setStep("processing");
            setProgress(0);
            const newFile = await transcode(file);

            // Upload step
            setStep("uploading");
            setProgress(0);
            await upload(newFile);

            // Done
            setStep(null);
            setProgress(null);
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

      <AlertDialog open={Boolean(step)}>
        <AlertDialogContent>
          <AlertDialogHeader>Upload Progress</AlertDialogHeader>
          <AlertDialogDescription>{step}</AlertDialogDescription>
          <Progress value={progress} />
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
