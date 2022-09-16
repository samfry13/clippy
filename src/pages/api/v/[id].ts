import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import { env } from '../../../env/server.mjs';

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const videoPath = path.resolve('.', `${env.DATA_DIR}/uploads/${id}.mp4`);

  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({
      message: 'Video not found',
      success: false,
    });
  }

  const { range } = req.headers;

  if (!range) {
    const videoStream = fs.createReadStream(videoPath);
    res.writeHead(200, {
      'Content-Disposition': `attachment; filename=${id}.mp4`,
      'Content-Type': 'video/mp4',
    });
    return videoStream.pipe(res);
  }

  const videoSize = fs.statSync(videoPath).size;
  const CHUNK_SIZE = 10 ** 6;
  const start = Number(range.replace(/\D/g, ''));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': 'video/mp4',
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
