import passport from 'passport';
import jwt from 'jsonwebtoken';
import { findUserByIdInDB } from '../service/users.service.js';
import 'dotenv/config';

const SECRET = process.env.SECRET;

const auth = async (req, res, next) => {
  try {
    const token = req.get('Authorization').replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Not authorized',
        data: 'Unauthorized',
      });
    }

    const decodedToken = jwt.verify(token, SECRET);
    const userId = decodedToken.id;
    const foundUser = await findUserByIdInDB(userId);
    if (!foundUser || foundUser.token !== token)
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Not authorized',
        data: 'Unauthorized',
      });
  } catch (err) {
    console.error(err);
    return res.status(401).json({
      status: 'error',
      code: 401,
      message: 'Not authorized',
      data: 'Unauthorized',
    });
  }

  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (!user || err) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Not authorized',
        data: 'Unauthorized',
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};

export default auth;
