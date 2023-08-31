import fs from 'fs/promises';

const isDirExist = folderPath =>
  fs
    .access(folderPath)
    .then(() => true)
    .catch(() => false);

export const createDirectoryIfNotExist = async (parentFolderPath, destinationFolderPath) => {
  if (!(await isDirExist(parentFolderPath))) {
    await fs.mkdir(parentFolderPath);
  }
  if (!(await isDirExist(destinationFolderPath))) {
    await fs.mkdir(destinationFolderPath);
  }
};
