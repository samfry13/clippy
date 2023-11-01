import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number) {
  const marker = 1024;
  const decimal = 3;
  const kiloBytes = marker;
  const megaBytes = kiloBytes * marker;
  const gigaBytes = megaBytes * marker;

  // return bytes if less than a KB
  if (bytes < kiloBytes) return `${bytes} Bytes`;
  // return KB if less than a MB
  else if (bytes < megaBytes)
    return `${(bytes / kiloBytes).toFixed(decimal).replace(/[.,]0+$/, "")} KB`;
  // return MB if less than a GB
  else if (bytes < gigaBytes)
    return `${(bytes / megaBytes).toFixed(decimal).replace(/[.,]0+$/, "")} MB`;
  // return GB
  else
    return `${(bytes / gigaBytes).toFixed(decimal).replace(/[.,]0+$/, "")} GB`;
}

export const formatTime = (time: Date) =>
  `${time.getMinutes().toString().padStart(2, "0")}:${time
    .getSeconds()
    .toString()
    .padStart(2, "0")}:${Math.ceil((time.getMilliseconds() - 1) / 10)
    .toString()
    .padStart(2, "0")}`;
