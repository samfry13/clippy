import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth/next";
import { authOptions as nextAuthOptions } from "../auth/[...nextauth]";
import { getAllUsersVideos } from "../../../server/db/videos";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, nextAuthOptions);
  if (!session?.user) {
    return res.status(401).json({
      message: "You must be signed in to get users uploads",
      success: false,
    });
  }

  if (session.user.id !== req.query.userId) {
    return res.status(403).json({
      message: "You cannot access another users uploads",
      success: false,
    });
  }

  return res.json(
    await getAllUsersVideos({
      userId: req.query.userId,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      start: req.query.start ? Number(req.query.start) : undefined,
    })
  );
};

export default handler;
