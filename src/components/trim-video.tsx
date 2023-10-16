"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useStateRef from "react-usestateref";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Slider } from "./ui/slider";
import { MultiSlider } from "./ui/multi-slider";
import { cn } from "~/lib/utils";

export const TrimVideo = ({
  video,
  edit,
  onChange,
}: {
  video: File;
  edit: boolean;
  onChange: (options: { startTime: number; endTime: number }) => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrl = useMemo(() => URL.createObjectURL(video), [video]);
  const [duration, setDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime, startTimeRef] = useStateRef(0);
  const [endTime, setEndTime, endTimeRef] = useStateRef(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const onDurationChange = () => {
      if (videoRef.current) {
        setDuration(videoRef.current.duration);
        setEndTime(videoRef.current.duration);
      }
    };

    const onProgress = () => {
      const currentTime = videoRef.current?.currentTime ?? 0;
      setCurrentTime(currentTime);
      if (videoRef.current && currentTime > endTimeRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = endTimeRef.current;
      }
    };

    const onPause = () => {
      setPlaying(false);
    };

    const onPlay = () => {
      setPlaying(true);
      if (
        videoRef.current &&
        videoRef.current.currentTime >= endTimeRef.current
      ) {
        videoRef.current.currentTime = startTimeRef.current;
        setCurrentTime(startTimeRef.current);
      }
    };

    const onVolumeChange = () => {
      setMuted(videoRef.current?.muted ?? false);
    };

    const currentRef = videoRef.current;
    if (currentRef) {
      currentRef.addEventListener("durationchange", onDurationChange);
      currentRef.addEventListener("timeupdate", onProgress);
      currentRef.addEventListener("pause", onPause);
      currentRef.addEventListener("play", onPlay);
      currentRef.addEventListener("volumechange", onVolumeChange);

      return () => {
        currentRef.removeEventListener("durationchange", onDurationChange);
        currentRef.removeEventListener("timeupdate", onProgress);
        currentRef.removeEventListener("pause", onPause);
        currentRef.removeEventListener("play", onPlay);
        currentRef.removeEventListener("volumechange", onVolumeChange);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        if (playing) {
          videoRef.current?.pause();
        } else {
          videoRef.current?.play();
        }
      } else if (e.code === "KeyM") {
        if (videoRef.current) {
          videoRef.current.muted = !videoRef.current.muted;
        }
      }
    };
    document.addEventListener("keyup", onKeyUp);

    return () => {
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [playing]);

  useEffect(() => {
    if (!edit) {
      // if the user cancels the edit, reset start and end times
      setStartTime(0);
      setEndTime(videoRef.current?.duration ?? 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edit]);

  return (
    <div className="relative group flex justify-center">
      <video ref={videoRef} src={videoUrl} className="max-h-[70vh]" />
      <div
        className={cn(
          "flex gap-4 items-center absolute bottom-2 left-2 right-2 bg-secondary p-2 rounded-md transition-all",
          playing && "opacity-0 group-hover:opacity-100"
        )}
      >
        <button
          onClick={() =>
            playing ? videoRef.current?.pause() : videoRef.current?.play()
          }
        >
          {playing ? <Pause /> : <Play />}
        </button>

        <div className="relative w-full">
          {edit && (
            <MultiSlider
              className="absolute"
              value={[startTime, endTime]}
              min={0}
              max={duration ?? 0}
              step={0.01}
              minStepsBetweenThumbs={0.1}
              onValueChange={([newStartTime, newEndTime]) => {
                videoRef.current?.pause();

                // set start time
                setStartTime(newStartTime);

                // set end time
                setEndTime(newEndTime);

                onChange({ startTime: newStartTime, endTime: newEndTime });

                if (videoRef.current) {
                  if (newStartTime > videoRef.current.currentTime) {
                    setCurrentTime(newStartTime);
                    videoRef.current.currentTime = newStartTime;
                  }
                  if (newEndTime < videoRef.current.currentTime) {
                    setCurrentTime(newEndTime);
                    videoRef.current.currentTime = newEndTime;
                  }
                }
              }}
            />
          )}
          <Slider
            value={[currentTime]}
            min={0}
            max={duration ?? 0}
            step={0.01}
            onValueChange={([_newCurrentTime]) => {
              videoRef.current?.pause();

              // set current time
              const newCurrentTime = Math.min(
                Math.max(startTime, _newCurrentTime),
                endTime
              );
              setCurrentTime(newCurrentTime);
              if (videoRef.current)
                videoRef.current.currentTime = newCurrentTime;
            }}
          />
        </div>

        <button
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.muted = !videoRef.current.muted;
            }
          }}
        >
          {muted ? <VolumeX /> : <Volume2 />}
        </button>
      </div>
    </div>
  );
};
