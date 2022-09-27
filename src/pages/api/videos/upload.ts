import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession as getServerSession } from 'next-auth/next';
import { authOptions as nextAuthOptions } from 'pages/api/auth/[...nextauth]';
import nc from 'next-connect';
import { prisma } from 'server/db/client';
import cuid from 'cuid';
import { execFileSync } from 'child_process';
import fs from 'fs';
import { env } from 'env/server';
import {
  FFMpegProgress,
  IFFMpegFileDetails,
  IFFMpegProgressData,
} from 'ffmpeg-progress-wrapper';
import { deleteFile } from 'utils/deleteFile';
import path from 'path';

const UPLOAD_DIR = path.join(env('DATA_DIR'), 'uploads');

const upload = nc<NextApiRequest, NextApiResponse>({
  onNoMatch: (req, res) => {
    res.status(405).json({
      message: `Method ${req.method} Not Allowed`,
    });
  },
});

upload.post(async (req, res) => {
  const session = await getServerSession(req, res, nextAuthOptions);
  if (!session?.user) {
    return res.status(403).send({
      message: 'You must be signed in to upload a uploads',
      success: false,
    });
  }

  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.startsWith('video')) {
    return res.status(400).send({
      message: 'Invalid content type. Only videos are accepted',
      success: false,
    });
  }

  const contentRange = req.headers['content-range'];
  if (!contentRange) {
    return res.status(400).json({
      message: 'Missing Content-Range',
      success: false,
    });
  }

  const fileName = req.query.fileName;
  if (!fileName || Array.isArray(fileName)) {
    return res.status(400).json({
      message: 'Missing fileName query param',
      success: false,
    });
  }

  const match = contentRange.match(/bytes\s(\d+)-(\d+)\/(\d+)/);
  if (!match || !match[1] || !match[2] || !match[3]) {
    return res.status(400).json({
      message: 'Invalid Content-Range Format',
      success: false,
    });
  }

  const rangeStart = parseInt(match[1]);
  const rangeEnd = parseInt(match[2]);
  const fileSize = parseInt(match[3]);
  if (isNaN(rangeStart) || isNaN(rangeEnd) || isNaN(fileSize)) {
    return res.status(400).json({
      message: 'Invalid Content-Range Format',
      success: false,
    });
  }

  if (rangeStart >= fileSize || rangeStart >= rangeEnd || rangeEnd > fileSize) {
    return res.status(400).json({
      message: 'Invalid Content-Range Format',
      success: false,
    });
  }

  const filePath = path.join(UPLOAD_DIR, fileName);
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
  }
  if (rangeStart !== 0) {
    // this is not the first chunk
    const stats = fs.statSync(filePath);
    if (!stats) {
      return res.status(400).json({
        message: 'Invalid partial chunk',
        success: false,
      });
    }
    if (stats.size !== rangeStart) {
      return res.status(400).json({
        message: 'Bad "Chunk" provided',
        success: false,
      });
    }
  }

  try {
    await new Promise<void>((resolve, reject) => {
      req.on('error', (e) => {
        console.error('failed upload', e);
        reject(e);
      });
      req.on('end', () => {
        resolve();
      });
      req.pipe(
        fs.createWriteStream(filePath, { flags: 'a', start: rangeStart }),
      );
    });

    if (rangeEnd !== fileSize - 1) {
      // if this is not the final chunk
      return res.status(200).json({
        message: 'Chunk uploaded',
        success: true,
      });
    }

    const newId = cuid();

    await prisma.video.create({
      data: {
        id: newId,
        title: '',
        userId: session.user.id,
      },
    });

    const progress = await prisma.videoProgress.create({
      data: {
        progress: 0,
        videoId: newId,
      },
    });

    // create thumbnail first in sync, so we can return with it
    execFileSync('ffmpeg', [
      '-y',
      '-i',
      filePath,
      '-vf',
      'thumbnail',
      '-t',
      '3',
      '-vframes',
      '1',
      '-strict',
      '-2',
      '-loglevel',
      'quiet',
      `${env('DATA_DIR')}/uploads/${newId}.jpg`,
    ]);

    const videoTranscodingProcess = new FFMpegProgress([
      '-y',
      '-i',
      filePath,
      '-vcodec',
      'h264',
      '-acodec',
      'aac',
      '-filter_complex',
      'scale=ceil(iw*min(1\\,min(1920/iw\\,1080/ih))/2)*2:(floor((ow/dar)/2))*2',
      `${env('DATA_DIR')}/uploads/${newId}.mp4`,
    ]);
    videoTranscodingProcess.once('details', (details: IFFMpegFileDetails) => {
      console.log(
        `${newId} Processing - ${details.resolution?.width}x${details.resolution?.height} @ ${details.fps}fps - length: ${details.duration}s`,
      );
    });
    videoTranscodingProcess.on(
      'progress',
      async (data: IFFMpegProgressData) => {
        const progressInt = Math.round((data.progress || 0) * 100);
        await prisma.videoProgress.update({
          where: {
            id: progress.id,
          },
          data: {
            progress: progressInt,
          },
        });
      },
    );
    videoTranscodingProcess
      .onDone()
      .then(async () => {
        console.log(`${newId} - Conversion finished`);
        await prisma.videoProgress.delete({
          where: {
            id: progress.id,
          },
        });
        deleteFile(filePath);
      })
      .catch(async (err) => {
        console.error(err);
        await prisma.video.delete({
          where: { id: newId },
        });
        deleteFile(filePath);
        deleteFile(`${env('DATA_DIR')}/uploads/${newId}.mp4`);
        deleteFile(`${env('DATA_DIR')}/uploads/${newId}.jpg`);
      });

    return res.status(200).json({
      message: 'Video successfully uploaded!',
      success: true,
    });
  } catch (e: any) {
    console.error(e);
    deleteFile(filePath);
    return res.status(500).json({
      message: e.message,
      success: false,
    });
  }
});

export default upload;

export const config = {
  api: {
    bodyParser: false,
  },
};
