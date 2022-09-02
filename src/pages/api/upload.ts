import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth/next";
import { authOptions as nextAuthOptions } from "./auth/[...nextauth]";
import nc from "next-connect";
import multer from "multer";
import { prisma } from "../../server/db/client";
import cuid from "cuid";
import { execFileSync } from "child_process";
import fs from "fs";
import { env } from "../../env/server.mjs";

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

upload.use(parser.single("video_file"));

upload.post(async (req: MulterRequest, res) => {
  const session = await getServerSession(req, res, nextAuthOptions);
  if (!session?.user) {
    return res.send({
      message: "You must be signed in to upload a uploads",
      success: false,
    });
  }

  try {
    process.stdout.write("Starting processing...");
    const newId = cuid();

    const tmpFile = `${env.DATA_DIR}/uploads/clippy-upload-${req.file.originalname}`;

    execFileSync("ffmpeg", [
      "-y",
      "-i",
      tmpFile,
      "-vcodec",
      "h264",
      "-acodec",
      "aac",
      "-strict",
      "-2",
      "-loglevel",
      "quiet",
      "-metadata",
      `title=${req.body.title}`,
      "-metadata",
      `comment=${req.body.description}`,
      `${env.DATA_DIR}/uploads/${newId}.mp4`,
    ]);

    execFileSync("ffmpeg", [
      "-y",
      "-i",
      tmpFile,
      "-vf",
      "thumbnail",
      "-t",
      "3",
      "-vframes",
      "1",
      "-strict",
      "-2",
      "-loglevel",
      "quiet",
      `${env.DATA_DIR}/uploads/${newId}.jpg`,
    ]);

    fs.rmSync(tmpFile);

    process.stdout.write("DONE\n");

    const newVideo = await prisma.video.create({
      data: {
        id: newId,
        title: req.body.video_title || "",
        description: req.body.video_description || "",
        userId: session.user.id,
      },
    });

    return res.status(200).json({
      message: "Video successfully uploaded!",
      success: true,
      id: newVideo.id,
    });
  } catch (e: any) {
    console.error(e);
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
