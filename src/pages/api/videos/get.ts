import { NextApiRequest, NextApiResponse } from "next";
import { getVideo } from "../../../server/db/videos";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!req.query.id || Array.isArray(req.query.id)) {
    return res.status(400).json({
      message: "Invalid id param",
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

  return res.status(200).json(video);
};

export default handler;
