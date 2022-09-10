import { NextApiRequest, NextApiResponse } from "next";
import { getVideoProgress } from "../../../../server/db/videos";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!req.query.id || Array.isArray(req.query.id)) {
    return res.status(400).json({
      message: "Invalid id param",
      success: false,
    });
  }

  const progress = await getVideoProgress({ id: req.query.id });

  if (!progress) {
    return res.status(404).json({
      message: "Progress not found",
      success: false,
    });
  }

  return res.status(200).json(progress);
};

export default handler;
