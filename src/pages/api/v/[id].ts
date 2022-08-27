import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const { range } = req.headers;
  const videoPath = path.resolve(".", `uploads/${id}`);
  if (!range) {
    const videoStream = fs.createReadStream(videoPath);
    res.writeHead(206, {
      "Content-Type": "uploads/mp4",
    });
    videoStream.pipe(res);
    return;
  }

  const videoSize = fs.statSync(videoPath).size;
  const CHUNK_SIZE = 10 ** 6;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "uploads/mp4",
  };
  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
};

export default handler;

export const config = {
  api: {
    responseLimit: false,
  },
};
