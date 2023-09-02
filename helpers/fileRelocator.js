import fs from 'fs/promises';
import { removeFile } from './fileRemover.js';

export const moveFileFromOldToNewPath = async (oldFilePath, newFilePath) => {
  await fs.rename(oldFilePath, newFilePath, err => {
    if (err) {
      removeFile(oldFilePath);
      throw err;
    }
  });
};
