import { NextApiRequest, NextApiResponse } from 'next';
import {
  deleteVideo,
  getVideo,
  updateTitle,
} from '../../../../server/db/videos';
import { unstable_getServerSession as getServerSession } from 'next-auth/next';
import { authOptions as nextAuthOptions } from '../../auth/[...nextauth]';
import fs from 'fs';
import { env } from '../../../../env/server.mjs';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET': {
      if (!req.query.id || Array.isArray(req.query.id)) {
        return res.status(400).json({
          message: 'Invalid ID param',
          success: false,
        });
      }

      const video = await getVideo({ id: req.query.id });

      if (!video) {
        return res.status(404).json({
          message: 'Video not found',
          success: false,
        });
      }

      return res.status(200).json(video);
    }
    case 'PATCH': {
      const session = await getServerSession(req, res, nextAuthOptions);
      if (!session?.user) {
        return res.status(401).json({
          message: 'You must be signed in',
          success: false,
        });
      }

      if (!req.query.id || Array.isArray(req.query.id)) {
        return res.status(400).json({
          message: 'Invalid ID param',
          success: false,
        });
      }

      if (!req.body.title || typeof req.body.title !== 'string') {
        return res.status(400).json({
          message: 'Invalid Title param',
          success: false,
        });
      }

      const video = await getVideo({ id: req.query.id });

      if (!video) {
        return res.status(404).json({
          message: 'Video not found',
          success: false,
        });
      }

      if (video.userId !== session.user.id) {
        return res.status(403).json({
          message: 'Not authorized to update this upload',
          success: false,
        });
      }

      try {
        await updateTitle({ id: req.query.id, newTitle: req.body.title });
      } catch (e) {
        return res.status(500).json({
          message: 'Error while updating title',
          success: false,
        });
      }

      return res.status(200).json({
        message: 'Video updated',
        success: true,
      });
    }
    case 'DELETE': {
      const session = await getServerSession(req, res, nextAuthOptions);
      if (!session?.user) {
        return res.status(401).json({
          message: 'You must be signed in',
          success: false,
        });
      }

      if (!req.query.id || Array.isArray(req.query.id)) {
        return res.status(400).json({
          message: 'Invalid ID param',
          success: false,
        });
      }

      const video = await getVideo({ id: req.query.id });

      if (!video) {
        return res.status(404).json({
          message: 'Video not found',
          success: false,
        });
      }

      if (video.userId !== session.user.id) {
        return res.status(403).json({
          message: 'Not authorized to delete this upload',
          success: false,
        });
      }

      try {
        await deleteVideo({ id: req.query.id });
        fs.rmSync(`${env.DATA_DIR}/uploads/${req.query.id}.mp4`);
        fs.rmSync(`${env.DATA_DIR}/uploads/${req.query.id}.jpg`);
      } catch (e) {
        return res.status(500).json({
          message: 'Error while deleting uploads',
          success: false,
        });
      }

      return res.status(200).json({
        message: 'Video deleted',
        success: true,
      });
    }
    default:
      return res.status(405).end();
  }
};

export default handler;
