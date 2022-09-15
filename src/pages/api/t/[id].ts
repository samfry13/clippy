import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import { env } from '../../../env/server.mjs';

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const filePath = path.resolve('.', `${env.DATA_DIR}/uploads/${id}.jpg`);
  const imageBuffer = fs.readFileSync(filePath);
  res.setHeader('Content-Type', 'image/jpg');
  return res.send(imageBuffer);
};

export default handler;
