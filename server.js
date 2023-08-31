import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';
import './config/passportConfig.js';
import usersRouter from './routes/users.routes.js';
import contactsRouter from './routes/contacts.routes.js';
import { AVATARS_DIR, PUBLIC_DIR, TMP_DIR } from './helpers/globalVariables.js';
import { createDirIfNotExist } from './helpers/createDir.js';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/users', usersRouter);
app.use('/api/contacts', contactsRouter);

app.use('/api/avatars', express.static(AVATARS_DIR));

app.use((_, res, __) => {
  res.status(404).json({
    status: 'error',
    code: 404,
    message: `The given endpoint does not exist`,
    data: 'Not found',
  });
});

app.use((err, _, res, __) => {
  console.log(err.stack);
  res.status(500).json({
    status: 'fail',
    code: 500,
    message: err.message,
    data: 'Internal Server Error',
  });
});

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
