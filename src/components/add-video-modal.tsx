"use client";

import { Edit, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useCallback, useEffect, useRef, useState } from "react";
import { Uploader } from "~/lib/uploader";
import { Progress } from "./ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "./ui/alert-dialog";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useToast } from "./ui/use-toast";
import { formatBytes, formatTime } from "~/lib/utils";
import { useRouter } from "next/navigation";
import { TrimVideo } from "./trim-video";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

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

  const [video, setVideo] = useState<File | null>(null);
  const [editing, setEditing] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  const [step, setStep] = useState<
    "loading" | "processing thumbnail" | "processing video" | "uploading" | null
  >(null);
  const [progress, setProgress] = useState<number | null>(null);
  const ffmpegRef = useRef(new FFmpeg());
  const abortRef = useRef(new AbortController());
  const [messages, setMessages] = useState<string[]>([]);

  const [ffmpegLoadPromise, setFfmpegLoadPromise] =
    useState<Promise<void> | null>(null);

  const [transcodeEta, setTranscodeEta] = useState<number | null>(null);

  const sendMessage = (message: string) => {
    setMessages((prev) => [...prev, message]);
  };

  const load = useCallback(async () => {
    const ffmpeg = ffmpegRef.current;
    if (!ffmpegRef.current) ffmpegRef.current = ffmpeg;

    ffmpeg.on("log", ({ message }) => {
      sendMessage(message);
    });

    sendMessage("Loading ffmpeg...");
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
    sendMessage("ffmpeg loaded!");
  }, []);

  // Start the load as soon as the component is mounted, so that hopefully
  // by the time the user starts uploading a video, they don't have to deal
  // with this step
  useEffect(() => {
    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg.loaded) {
      setFfmpegLoadPromise(load());
    }
  }, [load]);

  const transcode = async (
    file: File,
    options?: { startTime: number; endTime: number }
  ) => {
    const ffmpeg = ffmpegRef.current;

    await ffmpeg.writeFile(file.name, await fetchFile(file));

    if (options) {
      ffmpeg.on("log", ({ message }) => {
        const matches = message.match(
          /time=(\d\d:\d\d:\d\d\.\d\d).*?speed=(\d+\.\d+)x/
        );
        const time = matches?.[1];
        const speed = matches?.[2];

        if (time && speed) {
          const [hours, minutes, seconds] = time.split(":");
          const parsedTime =
            Number(hours) * 60 * 60 + Number(minutes) * 60 + Number(seconds);
          const parsedSpeed = Number(speed);

          const duration = options.endTime - options.startTime;
          const progress = parsedTime / duration;
          setProgress(progress * 100);

          const eta = (duration - parsedTime) / parsedSpeed;
          setTranscodeEta(eta);
        }
      });
    } else {
      ffmpeg.on("progress", ({ progress }) => {
        setProgress(progress * 100);
      });
    }

    // generate thumbnail
    await ffmpeg.exec([
      ...(options ? ["-ss", options.startTime.toString()] : []),
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
    setProgress(0);
    setStep("processing video");

    await ffmpeg.exec([
      "-i",
      file.name,
      ...(options
        ? [
            "-ss",
            options.startTime.toString(),
            "-to",
            options.endTime.toString(),
          ]
        : []),
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
          setVideo(null);
          router.refresh();
        })
        .catch(abort);
    });

    uploader.on("error", abort);

    uploader.upload();

    return abort;
  };

  const uploadFile = async (
    file: File,
    options?: { startTime: number; endTime: number }
  ) => {
    abortRef.current = new AbortController();
    abortRef.current.signal.onabort = () => {
      ffmpegRef.current.terminate();
    };

    try {
      // Load ffmpeg.wasm
      setStep("loading");
      setProgress(0);
      if (!ffmpegRef.current.loaded && ffmpegLoadPromise) {
        await ffmpegLoadPromise;
      }

      if (abortRef.current.signal.aborted) return;

      // Process file
      setStep("processing thumbnail");
      setProgress(0);
      const newFiles = await transcode(file, options);

      if (abortRef.current.signal.aborted) return;
      if (newFiles.video.size > maxUploadSize) {
        return toast({
          title: "Error",
          description: `Upload is too big (max ${formatBytes(maxUploadSize)})`,
          variant: "destructive",
        });
      }

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
          if (!file) return;

          setVideo(file);

          if (inputRef.current) {
            inputRef.current.value = "";
          }
        }}
      />

      <Button
        onClick={() => inputRef.current?.click()}
        className="flex gap-2 fixed bottom-4 right-4 z-50 sm:relative sm:bottom-[unset] sm:right-[unset]"
      >
        <Plus />
        <span className="hidden sm:block">Upload Video</span>
      </Button>

      <AlertDialog open={video !== null}>
        <AlertDialogContent className="max-w-7xl">
          <AlertDialogHeader className="flex-row justify-between items-center">
            {editing ? "Edit Video" : "Preview Video"}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editing ? "default" : "outline"}
                  onClick={() => setEditing((e) => !e)}
                >
                  <Edit />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {editing ? "Discard Changes" : "Edit Video"}
              </TooltipContent>
            </Tooltip>
          </AlertDialogHeader>
          <AlertDialogDescription>{video?.name}</AlertDialogDescription>

          {video && (
            <TrimVideo
              video={video}
              edit={editing}
              onChange={(options) => {
                setStartTime(options.startTime);
                setEndTime(options.endTime);
              }}
            />
          )}

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setVideo(null)}>
              Cancel
            </AlertDialogCancel>
            {video && (
              <AlertDialogAction
                onClick={() =>
                  uploadFile(
                    video,
                    startTime !== null && endTime !== null
                      ? {
                          startTime,
                          endTime,
                        }
                      : undefined
                  )
                }
              >
                Upload
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(step)}>
        <AlertDialogContent>
          <AlertDialogHeader>Upload Progress</AlertDialogHeader>
          <AlertDialogDescription>
            {step}
            {step === "processing video" && transcodeEta && (
              <span> - eta: {Math.floor(transcodeEta)}s</span>
            )}
          </AlertDialogDescription>
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
