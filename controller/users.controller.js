import {
  findUserByEmailInDB,
  findUserByTokenInDB,
  createUserInDB,
  updateKeyInDBForUserWithId,
  deleteUserFromDB,
} from '../service/users.service.js';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import bCrypt from 'bcryptjs';
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'node:path';
import { AVATARS_DIR, MAX_AVATAR_FILE_SIZE_IN_BYTES, TMP_DIR } from '../helpers/globalVariables.js';
import multer from 'multer';
import gravatar from 'gravatar';
import Jimp from 'jimp';

const SECRET = process.env.SECRET;

const userReqBodySchema = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: Joi.string().min(7).required(),
});

const userSubscriptionReqBodySchema = Joi.object({
  subscription: Joi.string().valid('starter', 'pro', 'business').required(),
});

const hashPassword = async password => {
  const salt = await bCrypt.genSalt(10);
  const hash = await bCrypt.hash(password, salt);
  return hash;
};

const validatePassword = (password, hash) => bCrypt.compare(password, hash);

const passwordValidator = async (password, userPassword) => {
  const isValidPassword = await validatePassword(password, userPassword);
  return isValidPassword;
};

const findUserByEmail = async email => {
  try {
    const user = await findUserByEmailInDB(email);
    return user;
  } catch (err) {
    console.error(err);
  }
};

const createUserIfNotExist = async (req, res, _) => {
  try {
    const { value, error } = userReqBodySchema.validate(req.body);
    const { email, password } = value;

    if (error) {
      return res.status(400).json({ status: 'error', code: 400, message: error.message });
    }

    const toLowerCaseEmail = email.toLowerCase();
    const user = await findUserByEmail(toLowerCaseEmail);

    if (user) {
      return res.status(409).json({
        status: 'error',
        code: 409,
        message: 'Email in use',
        data: 'Conflict',
      });
    }

    const avatarURL = gravatar.url(toLowerCaseEmail, {
      protocol: 'https',
      s: '100',
      r: 'pg',
      d: 'retro',
    });

    const hashedPassword = await hashPassword(password);
    createUserInDB(toLowerCaseEmail, hashedPassword, avatarURL);
    res.status(201).json({
      status: 'created',
      code: 201,
      data: {
        user: {
          email: toLowerCaseEmail,
          subscription: 'starter',
        },
      },
    });
  } catch (err) {
    console.error(err);
  }
};

const deleteUser = async (req, res, _) => {
  try {
    const { value, error } = userReqBodySchema.validate(req.body);
    const { email, password } = value;

    if (error) {
      return res.status(400).json({ status: 'error', code: 400, message: error.message });
    }

    const userIdFromReqAuthorizedToken = req.user.id;
    const toLowerCaseEmail = email.toLowerCase();
    const userFromDB = await findUserByEmail(toLowerCaseEmail);
    const isUserIdValid = userIdFromReqAuthorizedToken === userFromDB.id;
    const isPasswordValid = await passwordValidator(password, userFromDB.password);

    if (!isPasswordValid || !isUserIdValid) {
      return res.status(401).json({
        status: 'unauthorized',
        code: 401,
        message: 'Email or password is wrong',
        data: 'Unauthorized',
      });
    }

    deleteUserFromDB(toLowerCaseEmail);

    res.status(200).json({
      status: 'deleted',
      code: 200,
      data: {
        deletedUser: {
          email: toLowerCaseEmail,
        },
      },
    });
  } catch (err) {
    console.error(err);
  }
};

const loginUser = async (req, res, _) => {
  try {
    const { value, error } = userReqBodySchema.validate(req.body);
    const { email, password } = value;

    if (error) {
      return res.status(400).json({ status: 'error', code: 400, message: error.message });
    }

    const toLowerCaseEmail = email.toLowerCase();
    const user = await findUserByEmail(toLowerCaseEmail);

    if (!user) {
      return res.status(401).json({
        status: 'unauthorized',
        code: 401,
        message: 'Email or password is wrong',
        data: 'Unauthorized',
      });
    }

    const isPasswordValid = await passwordValidator(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'unauthorized',
        code: 401,
        message: 'Email or password is wrong',
        data: 'Unauthorized',
      });
    }

    const id = user.id;
    const payload = { id };
    const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });
    await updateKeyInDBForUserWithId({ token }, id);

    return res.json({
      status: 'success',
      code: 200,
      data: {
        token,
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Server error',
    });
  }
};

const logoutUser = async (req, res, _) => {
  try {
    let token = req.user.token;

    if (!token) {
      return res.status(401).json({
        status: 'unauthorized',
        code: 401,
        message: 'Not authorized',
      });
    }

    const user = await findUserByTokenInDB(token);
    const id = user.id;
    token = null;
    await updateKeyInDBForUserWithId({ token }, id);
    return res.json({
      status: 'success',
      code: 200,
      message: 'User successfully logged out',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Server error',
    });
  }
};

const getCurrentUserDataFromToken = async (req, res, _) => {
  try {
    const token = req.user.token;

    if (!token) {
      return res.status(401).json({
        status: 'unauthorized',
        code: 401,
        message: 'Not authorized',
      });
    }
    const user = await findUserByTokenInDB(token);
    return res.json({
      status: 'success',
      code: 200,
      data: {
        currentUser: {
          email: user.email,
          subscription: user.subscription,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Server error',
    });
  }
};

const updateUserSubscriptionStatus = async (req, res, next) => {
  try {
    const { value, error } = userSubscriptionReqBodySchema.validate(req.body);
    const { subscription } = value;

    if (error) {
      return res.status(400).json({ status: 'error', code: 400, message: error.message });
    }

    const userId = req.user.id;

    await updateKeyInDBForUserWithId({ subscription }, userId);
    return res.json({
      status: 'success',
      code: 200,
      message: `User's subscription changed successfully to ${subscription}.`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Server error',
    });
  }
};

const checkFileBeforeUpload = (err, req, res, next) => {
  // FILE SIZE ERROR
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: `Max file size ${MAX_AVATAR_FILE_SIZE_IN_BYTES / 1000}KB allowed!`,
    });
  }

  // INVALID FILE TYPE, message will return from fileFilter callback
  else if (err) {
    return res.status(415).json({ status: 'error', code: 415, message: err.message });
  }

  next(req, res, next);
};

const updateUserAvatar = async (req, res, _) => {
  try {
    // FILE NOT SELECTED
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'File is required! Please, add the image, if you want to update your avatar.',
      });
    }

    const { path: temporaryPath, filename } = req.file;
    const tempAvatarPath = path.join(TMP_DIR, filename);
    const optimizedAvatarPath = path.join(AVATARS_DIR, filename);

    await fs.rename(temporaryPath, tempAvatarPath, err => {
      if (err) {
        fs.unlink(temporaryPath)
          .then(() => {
            console.log('An error was encountered, the file has been deleted.');
            throw err;
          })
          .catch(err => {
            throw err;
          });
      }
    });

    await Jimp.read(tempAvatarPath)
      .then(imageToOptimize => {
        return imageToOptimize.resize(250, 250).quality(60).write(optimizedAvatarPath);
      })
      .catch(err => {
        throw err;
      });

    const userId = req.user.id;
    await updateKeyInDBForUserWithId({ avatarURL: optimizedAvatarPath }, userId);

    await fs.unlink(tempAvatarPath, err => {
      if (err) throw err;
    });

    return res.json({
      status: 'success',
      code: 200,
      message: 'New avatar added successfully.',
      avatarURL: optimizedAvatarPath,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Server error',
    });
  }
};

export {
  createUserIfNotExist,
  deleteUser,
  loginUser,
  logoutUser,
  getCurrentUserDataFromToken,
  updateUserSubscriptionStatus,
  checkFileBeforeUpload,
  updateUserAvatar,
};
