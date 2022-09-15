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

  const videoStream = fs.createReadStream(videoPath);
  res.writeHead(200, {
    'Content-Disposition': `attachment; filename=${id}.mp4`,
    'Content-Type': 'video/mp4',
  });
  return videoStream.pipe(res);
};

export default handler;

export const config = {
  api: {
    responseLimit: false,
  },
};
