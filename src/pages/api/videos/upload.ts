import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession as getServerSession } from 'next-auth/next';
import { authOptions as nextAuthOptions } from '../auth/[...nextauth]';
import nc from 'next-connect';
import multer from 'multer';
import { prisma } from '../../../server/db/client';
import cuid from 'cuid';
import { execFileSync } from 'child_process';
import fs from 'fs';
import { env } from '../../../env/server.mjs';
import {
  FFMpegProgress,
  IFFMpegFileDetails,
  IFFMpegProgressData,
} from 'ffmpeg-progress-wrapper';

const parser = multer({
  storage: multer.diskStorage({
    destination: `${env.DATA_DIR}/uploads`,
    filename: (req, file, cb) => cb(null, `clippy-upload-${file.originalname}`),
  }),
});

interface MulterRequest extends NextApiRequest {
  file: Express.Multer.File;
}

const upload = nc<NextApiRequest, NextApiResponse>({
  onNoMatch: (req, res) => {
    res.status(405).json({
      message: `Method ${req.method} Not Allowed`,
    });
  },
});

upload.use(parser.single('video_file'));

upload.post(async (req: MulterRequest, res) => {
  const session = await getServerSession(req, res, nextAuthOptions);
  if (!session?.user) {
    return res.send({
      message: 'You must be signed in to upload a uploads',
      success: false,
    });
  }

  const tmpFile = `${env.DATA_DIR}/uploads/clippy-upload-${req.file.originalname}`;

  try {
    const newId = cuid();

    // create new video in DB
    await prisma.video.create({
      data: {
        id: newId,
        title: req.body.video_title || '',
        description: req.body.video_description || '',
        userId: session.user.id,
      },
    });

    // create progress in DB
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
      tmpFile,
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
      `${env.DATA_DIR}/uploads/${newId}.jpg`,
    ]);

    const videoTranscodingProcess = new FFMpegProgress([
      '-y',
      '-i',
      tmpFile,
      '-vcodec',
      'h264',
      '-acodec',
      'aac',
      '-filter_complex',
      'scale=ceil(iw*min(1\\,min(1920/iw\\,1080/ih))/2)*2:(floor((ow/dar)/2))*2',
      `${env.DATA_DIR}/uploads/${newId}.mp4`,
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
    videoTranscodingProcess.onDone().then(async () => {
      console.log(`${newId} - Conversion finished`);
      await prisma.videoProgress.delete({
        where: {
          id: progress.id,
        },
      });
      fs.rmSync(tmpFile);
    });

    const returnVideo = await prisma.video.findFirst({
      where: {
        id: newId,
      },
      include: {
        progress: true,
      },
    });

    return res.status(200).json({
      message: 'Video successfully uploaded!',
      success: true,
      video: returnVideo,
    });
  } catch (e: any) {
    console.error(e);
    fs.rmSync(tmpFile);
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
