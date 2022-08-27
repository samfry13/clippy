import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth/next";
import { authOptions as nextAuthOptions } from "../auth/[...nextauth]";
import { deleteVideo, getVideo } from "../../../server/db/videos";
import fs from "fs";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, nextAuthOptions);
  if (!session?.user) {
    return res.status(401).json({
      message: "You must be signed in",
      success: false,
    });
  }

  if (!req.query.id || Array.isArray(req.query.id)) {
    return res.status(400).json({
      message: "Invalid ID param",
      success: false,
    });
  }

  const video = await getVideo({ id: req.query.id });

  if (!video) {
    return res.status(404).json({
      message: "Video not found",
      success: false,
    });
  }

  if (video.userId !== session.user.id) {
    return res.status(403).json({
      message: "Not authorized to delete this uploads",
      success: false,
    });
  }

  try {
    await deleteVideo({ id: req.query.id });
    fs.rmSync(`./uploads/${req.query.id}.mp4`);
    fs.rmSync(`./uploads/${req.query.id}.jpg`);
  } catch (e) {
    return res.status(500).json({
      message: "Error while deleting uploads",
      success: false,
    });
  }

  return res.status(200).json({
    message: "Video deleted",
    success: true,
  });
};

export default handler;
