import mongoose from 'mongoose';
import 'dotenv/config';
import app from './app.js';
import { AVATARS_DIR, PUBLIC_DIR, TMP_DIR } from './helpers/globalVariables.js';
import { createDirIfNotExist } from './helpers/createDir.js';

const PORT = process.env.PORT || 4000;
const uriDb = process.env.DATABASE_URL;

const connection = mongoose.connect(uriDb, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connection
  .then(() => {
    app.listen(PORT, async () => {
      await createDirIfNotExist(PUBLIC_DIR);
      await createDirIfNotExist(AVATARS_DIR);
      await createDirIfNotExist(TMP_DIR);
      console.log(`Server running. Use our API on port: ${PORT}`);
    });
  })
  .catch(err => {
    console.log(`Server not running. Error message: ${err.message}`);
    process.exit(1);
  });
