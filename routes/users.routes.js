import express from 'express';
import auth from '../auth/user.auth.js';
import {
  createUserIfNotExist,
  loginUser,
  logoutUser,
  getCurrentUserDataFromToken,
  updateUserSubscriptionStatus,
} from '../controller/users.controller.js';

const usersRouter = express.Router();

usersRouter.post('/signup', createUserIfNotExist);

usersRouter.post('/login', loginUser);

usersRouter.get('/logout', auth, logoutUser);

usersRouter.get('/current', auth, getCurrentUserDataFromToken);

usersRouter.patch('/', auth, updateUserSubscriptionStatus);

export default usersRouter;
