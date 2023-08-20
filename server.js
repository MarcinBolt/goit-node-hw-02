import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';
import './config/config-passport.js';
import usersRouter from './routes/users.routes.js';
import contactsRouter from './routes/contacts.routes.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api', usersRouter);
app.use('/api', contactsRouter);

app.use((_, res, __) => {
  res.status(404).json({
    status: 'error',
    code: 404,
    message: `Use api on routes: 
    /api/signup - registration user {email, password}
    /api/login - login {email, password},
    /api/logout - logout User by delete its token,
    /users/current - get current User data from token`,
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
    app.listen(PORT, function () {
      console.log(`Server running. Use our API on port: ${PORT}`);
    });
  })
  .catch(err => {
    console.log(`Server not running. Error message: ${err.message}`);
    process.exit(1);
  });
