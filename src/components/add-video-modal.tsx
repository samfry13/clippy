"use client";

import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";
import { Uploader } from "~/lib/uploader";
import { Progress } from "./ui/progress";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "./ui/alert-dialog";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useToast } from "./ui/use-toast";
import { formatBytes } from "~/lib/utils";
import { useRouter } from "next/navigation";

const AlwaysScrollToBottom = () => {
  const elementRef = useRef<HTMLDivElement>(null);
  useEffect(() => elementRef.current?.scrollIntoView());
  return <div ref={elementRef} />;
};

export const AddVideoModal = ({
  maxUploadSize,
  maxChunkSize,
}: {
  maxUploadSize: number;
  maxChunkSize: number;
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<
    "loading" | "processing" | "uploading" | null
  >(null);
  const [progress, setProgress] = useState<number | null>(null);
  const ffmpegRef = useRef(new FFmpeg());
  const abortRef = useRef(new AbortController());
  const [messages, setMessages] = useState<string[]>([]);

  const sendMessage = (message: string) => {
    setMessages((prev) => [...prev, message]);
  };

  const load = async () => {
    const ffmpeg = ffmpegRef.current;
    if (!ffmpegRef.current) ffmpegRef.current = ffmpeg;

    ffmpeg.on("log", ({ message }) => {
      sendMessage(message);
    });
    ffmpeg.on("progress", ({ progress }) => {
      setProgress(progress * 100);
    });

    if (window.crossOriginIsolated) {
      const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.2/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm",
          true,
          (e) => setProgress(e.received / e.total / 3)
        ),
        workerURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.worker.js`,
          "text/javascript"
        ),
      });
    } else {
      // cross origin isolation should be enabled, but in the case that it's not,
      // load single threaded ffmpeg instead
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      });
    }
  };

  const transcode = async (file: File) => {
    const ffmpeg = ffmpegRef.current;

    await ffmpeg.writeFile(file.name, await fetchFile(file));
    // generate thumbnail
    await ffmpeg.exec([
      "-i",
      file.name,
      "-vf",
      "thumbnail",
      "-update",
      "true",
      "-frames:v",
      "1",
      "output.webp",
    ]);
    // transcode video
    await ffmpeg.exec([
      "-i",
      file.name,
      "-filter:v",
      "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease",
      "output.mp4",
    ]);
    const thumbData = await ffmpeg.readFile("output.webp");
    const videoData = await ffmpeg.readFile("output.mp4");

    const thumbFile = new File(
      [new Blob([(thumbData as Uint8Array).buffer])],
      file.name,
      {
        type: "image/webp",
      }
    );
    const videoFile = new File(
      [new Blob([(videoData as Uint8Array).buffer])],
      file.name,
      {
        type: "video/mp4",
      }
    );

    return { video: videoFile, thumbnail: thumbFile };
  };

  const upload = async ({
    video,
    thumbnail,
  }: {
    video: File;
    thumbnail: File;
  }) => {
    sendMessage("Starting Upload...");

    const { key, uploadId } = await fetch("/api/upload/start", {
      method: "POST",
      body: JSON.stringify({
        filename: video.name,
      }),
    }).then((resp) => resp.json());

    const { url } = await fetch("/api/upload/thumb", {
      method: "POST",
      body: JSON.stringify({ key }),
    }).then((resp) => resp.json());

    await fetch(url, {
      method: "PUT",
      body: thumbnail,
      headers: {
        "Content-Type": "image/webp",
      },
    });

    const uploader = new Uploader({
      chunkSize: maxChunkSize,
      file: video,
      getEndpoint: async (chunkNumber) => {
        return await fetch("/api/upload/request-part", {
          method: "POST",
          body: JSON.stringify({
            key,
            uploadId,
            partNumber: chunkNumber + 1,
          }),
        })
          .then((resp) => resp.json())
          .then(({ url }) => ({ url, method: "PUT" }));
      },
    });

    uploader.on("progress", (progress) => setProgress(progress.detail * 100));

    uploader.on("chunkAttempt", ({ detail: chunkNumber }) => {
      sendMessage(`Attempting to upload file chunk: ${chunkNumber + 1}`);
    });

    uploader.on("chunkSuccess", ({ detail: chunkNumber }) => {
      sendMessage(`Successfully uploaded file chunk: ${chunkNumber + 1}`);
    });

    const abort = () => {
      sendMessage("Aborting upload...");
      setStep(null);
      setProgress(null);
      uploader.abort();
      fetch("/api/upload/abort", {
        method: "POST",
        body: JSON.stringify({
          key,
          uploadId,
        }),
      });
    };

    uploader.on("success", (e) => {
      sendMessage("Finishing upload...");
      fetch("/api/upload/complete", {
        method: "POST",
        body: JSON.stringify({
          key,
          uploadId,
          etags: e.detail.etags,
        }),
      })
        .then(() => {
          sendMessage("Finished!");
          setStep(null);
          setProgress(null);
          router.refresh();
        })
        .catch(abort);
    });

    uploader.on("error", abort);

    uploader.upload();

    return abort;
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
            if (file.size > maxUploadSize) {
              return toast({
                title: "Error",
                description: `Upload is too big (max ${formatBytes(
                  maxUploadSize
                )})`,
                variant: "destructive",
              });
            }

            abortRef.current = new AbortController();
            abortRef.current.signal.onabort = () => {
              ffmpegRef.current.terminate();
            };

            try {
              // Load ffmpeg.wasm
              setStep("loading");
              setProgress(0);
              await load();

              if (abortRef.current.signal.aborted) return;

              // Process file
              setStep("processing");
              setProgress(0);
              const newFiles = await transcode(file);

              if (abortRef.current.signal.aborted) return;

              // Upload step
              setStep("uploading");
              setProgress(0);
              const abort = await upload(newFiles);

              abortRef.current.signal.onabort = abort;
            } catch (e) {
              abortRef.current.abort();
              setStep(null);
              setProgress(null);
              sendMessage("Upload cancelled");
              console.error(e);
            }
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
          <details>
            <summary className="cursor-pointer">More Info</summary>
            <div className="text-xs max-h-24 overflow-y-scroll max-w-full break-all p-2 rounded-sm bg-slate-700">
              <ul>
                {messages.map((message, i) => (
                  <li key={i} className="-indent-4 pl-4">
                    {message}
                  </li>
                ))}
              </ul>
              <AlwaysScrollToBottom />
            </div>
          </details>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setStep(null);
                setProgress(null);
                abortRef.current.abort();
              }}
            >
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
