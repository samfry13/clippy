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

const AlwaysScrollToBottom = () => {
  const elementRef = useRef<HTMLDivElement>(null);
  useEffect(() => elementRef.current?.scrollIntoView());
  return <div ref={elementRef} />;
};

export const AddVideoModal = ({
  provider,
  maxUploadSize,
  maxChunkSize,
}: {
  provider: "s3" | "file";
  maxUploadSize: number;
  maxChunkSize: number;
}) => {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<
    "loading" | "processing" | "uploading" | null
  >(null);
  const [progress, setProgress] = useState<number | null>(null);
  const ffmpegRef = useRef(new FFmpeg());
  const abortRef = useRef(new AbortController());
  const [messages, setMessages] = useState<string[]>([]);

  const load = async () => {
    const ffmpeg = ffmpegRef.current;
    if (!ffmpegRef.current) ffmpegRef.current = ffmpeg;

    ffmpeg.on("log", ({ message }) => {
      setMessages((prev) => [...prev, message]);
    });
    ffmpeg.on("progress", ({ progress }) => {
      setProgress(progress * 100);
    });

    if (window.crossOriginIsolated) {
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `/scripts/core-mt/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `/scripts/core-mt/ffmpeg-core.wasm`,
          "application/wasm",
          true,
          (e) => setProgress(e.received / e.total / 3)
        ),
        workerURL: await toBlobURL(
          `/scripts/core-mt/ffmpeg-core.worker.js`,
          "text/javascript"
        ),
      });
    } else {
      // cross origin isolation should be enabled, but in the case that it's not
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `/scripts/core/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `/scripts/core/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      });
    }
  };

  const transcode = async (file: File) => {
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

    return new File([new Blob([(fileData as Uint8Array).buffer])], file.name, {
      type: "video/mp4",
    });
  };

  const upload = async (file: File) => {
    setMessages((prev) => [...prev, "Starting Upload..."]);

    if (provider === "s3") {
      const { key, uploadId } = await fetch("/api/upload/s3/start", {
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
        }),
      }).then((resp) => resp.json());

      const uploader = new Uploader({
        chunkSize: maxChunkSize,
        file,
        getEndpoint: async (chunkNumber) => {
          return await fetch("/api/upload/s3/request-part", {
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
        setMessages((prev) => [
          ...prev,
          `Attempting to upload file chunk: ${chunkNumber + 1}`,
        ]);
      });

      uploader.on("chunkSuccess", ({ detail: chunkNumber }) => {
        setMessages((prev) => [
          ...prev,
          `Successfully uploaded file chunk: ${chunkNumber + 1}`,
        ]);
      });

      const abort = () => {
        setMessages((prev) => [...prev, "Aborting upload..."]);
        setStep(null);
        setProgress(null);
        uploader.abort();
        fetch("/api/upload/s3/abort", {
          method: "POST",
          body: JSON.stringify({
            key,
            uploadId,
          }),
        });
      };

      uploader.on("success", (e) => {
        setMessages((prev) => [...prev, "Finishing upload..."]);
        fetch("/api/upload/s3/complete", {
          method: "POST",
          body: JSON.stringify({
            key,
            uploadId,
            etags: e.detail.etags,
          }),
        })
          .then(() => {
            setMessages((prev) => [...prev, "Finished!"]);
            setStep(null);
            setProgress(null);
          })
          .catch(abort);
      });

      uploader.on("error", abort);

      uploader.upload();

      return abort;
    }

    const { key } = await fetch("/api/upload/file/start", {
      method: "POST",
      body: JSON.stringify({
        filename: file.name,
      }),
    }).then((resp) => resp.json());

    const uploader = new Uploader({
      chunkSize: maxChunkSize,
      file,
      getEndpoint: async () => {
        return {
          url: `/api/upload/file/upload-part?key=${key}`,
          method: "POST",
        };
      },
    });

    uploader.on("progress", (progress) => setProgress(progress.detail * 100));

    uploader.on("chunkAttempt", ({ detail: chunkNumber }) => {
      setMessages((prev) => [
        ...prev,
        `Attempting to upload file chunk: ${chunkNumber + 1}`,
      ]);
    });

    uploader.on("chunkSuccess", ({ detail: chunkNumber }) => {
      setMessages((prev) => [
        ...prev,
        `Successfully uploaded file chunk: ${chunkNumber + 1}`,
      ]);
    });

    const abort = () => {
      setMessages((prev) => [...prev, "Aborting upload..."]);
      setStep(null);
      setProgress(null);
      uploader.abort();
      fetch("/api/upload/file/abort", {
        method: "POST",
        body: JSON.stringify({
          key,
        }),
      });
    };

    uploader.on("success", (e) => {
      setMessages((prev) => [...prev, "Finished!"]);
      setStep(null);
      setProgress(null);
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
              const newFile = await transcode(file);

              if (abortRef.current.signal.aborted) return;

              // Upload step
              setStep("uploading");
              setProgress(0);
              const abort = await upload(newFile);

              abortRef.current.signal.onabort = abort;
            } catch (e) {
              setStep(null);
              setProgress(null);
              setMessages((prev) => [...prev, "Upload cancelled"]);
              console.log(e);
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
