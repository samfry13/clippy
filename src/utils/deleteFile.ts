import fs from 'fs';

export const deleteFile = (path: string) => {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
};
