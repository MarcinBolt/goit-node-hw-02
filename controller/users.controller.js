import multer from 'multer';
import {
  findUserByEmailInDB,
  findUserByTokenInDB,
  createUserInDB,
  updateKeyInDBForUserWithId,
  deleteUserFromDB,
} from '../service/users.service.js';
import { AVATARS_DIR, TMP_DIR, MAX_AVATAR_FILE_SIZE_IN_BYTES } from '../helpers/globalVariables.js';
import { hashPassword, passwordValidator } from '../helpers/passwordHandling.js';
import { generateAvatarFromEmail } from '../helpers/gravatar.js';
import { optimizeImageAndSaveItToPath } from '../helpers/imageOptimizer.js';
import { moveFileFromOldToNewPath } from '../helpers/fileRelocator.js';
import { removeFile } from '../helpers/removeFile.js';
import { createToken } from '../helpers/createToken.js';
import { userReqBodySchema, userSubscriptionReqBodySchema } from '../helpers/joiSchemas.js';
import { createFilePath } from '../helpers/createFilePath.js';

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

    const normalizedEmail = email.toLowerCase();
    const user = await findUserByEmail(normalizedEmail);

    if (user) {
      return res.status(409).json({
        status: 'error',
        code: 409,
        message: 'Email in use',
        data: 'Conflict',
      });
    }

    const avatarURL = generateAvatarFromEmail(normalizedEmail);
    const hashedPassword = await hashPassword(password);
    createUserInDB(normalizedEmail, hashedPassword, avatarURL);
    res.status(201).json({
      status: 'created',
      code: 201,
      data: {
        user: {
          email: normalizedEmail,
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
    const userIdFromReqAuthorizedToken = req.user.id;

    if (error) {
      return res.status(400).json({ status: 'error', code: 400, message: error.message });
    }

    const normalizedEmail = email.toLowerCase();
    const userFromDB = await findUserByEmail(normalizedEmail);
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

    deleteUserFromDB(normalizedEmail);

    res.status(200).json({
      status: 'deleted',
      code: 200,
      data: {
        deletedUser: {
          email: normalizedEmail,
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

    const normalizedEmail = email.toLowerCase();
    const user = await findUserByEmail(normalizedEmail);

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
    const token = createToken(payload, '1h');
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
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: `Max file size ${MAX_AVATAR_FILE_SIZE_IN_BYTES / 1000}KB allowed!`,
    });
  } else if (err) {
    return res.status(415).json({ status: 'error', code: 415, message: err.message });
  }
  next(req, res, next);
};

const updateUserAvatar = async (req, res, _) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'File is required! Please, add the image, if you want to update your avatar.',
      });
    }

    const { path: fileFromReqLocatedInAvatarsPath, filename } = req.file;
    const tempAvatarPath = createFilePath(TMP_DIR, filename);
    const optimizedAvatarPath = createFilePath(AVATARS_DIR, filename);

    await moveFileFromOldToNewPath(fileFromReqLocatedInAvatarsPath, tempAvatarPath);
    await optimizeImageAndSaveItToPath(tempAvatarPath, optimizedAvatarPath);
    removeFile(tempAvatarPath);

    const userId = req.user.id;
    await updateKeyInDBForUserWithId({ avatarURL: optimizedAvatarPath }, userId);

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
