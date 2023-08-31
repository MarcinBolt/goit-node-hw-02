import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PUBLIC_DIR = path.join(__dirname, '../public');
export const AVATARS_DIR = path.join(PUBLIC_DIR ,'avatars');

export const MAX_AVATAR_FILE_SIZE_IN_BYTES = 200000;