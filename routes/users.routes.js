import express from 'express';
import auth from '../api/user.auth.js';
import {
  createUserIfNotExist,
  loginUser,
  logoutUser,
  getCurrentUserDataFromToken,
} from '../controller/users.controller.js';

const usersRouter = express.Router();

usersRouter.post('/users/signup', createUserIfNotExist);

usersRouter.post('/users/login', loginUser);

usersRouter.get('/users/logout', auth, logoutUser);

usersRouter.get('/users/current', auth, getCurrentUserDataFromToken);

export default usersRouter;
