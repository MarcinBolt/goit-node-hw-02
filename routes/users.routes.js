import express from 'express';
import auth from '../helpers/user.auth.js';
import {
  createUserIfNotExist,
  loginUser,
  logoutUser,
  getCurrentUserDataFromToken,
  updateUserSubscriptionStatus,
  checkFileBeforeUpload,
  updateUserAvatar,
} from '../controller/users.controller.js';
import upload from '../config/multerStorageConfig.js';

const usersRouter = express.Router();

usersRouter.post('/signup', createUserIfNotExist);

usersRouter.post('/login', loginUser);

usersRouter.get('/logout', auth, logoutUser);

usersRouter.get('/current', auth, getCurrentUserDataFromToken);

usersRouter.patch(
  '/avatars',
  auth,
  upload.single('avatar'),
  checkFileBeforeUpload,
  updateUserAvatar
);

usersRouter.patch('/', auth, updateUserSubscriptionStatus);

export default usersRouter;
