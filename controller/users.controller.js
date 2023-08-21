import {
  findUserByEmailInDB,
  findUserByTokenInDB,
  createUserInDB,
  updateKeyInDBForUserWithId,
} from '../service/users.service.js';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import bCrypt from 'bcryptjs';
import 'dotenv/config';

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
      return res.status(400).json({ message: error.message });
    }

    const toLowerCaseEmail = email.toLowerCase();
    const user = await findUserByEmail(toLowerCaseEmail);

    if (user) {
      return res.status(409).json({
        status: 'Error',
        code: 409,
        message: 'Email in use',
        data: 'Conflict',
      });
    }

    const hashedPassword = await hashPassword(password);
    createUserInDB(toLowerCaseEmail, hashedPassword);
    res.status(201).json({
      status: 'Created',
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

const loginUser = async (req, res, _) => {
  try {
    const { value, error } = userReqBodySchema.validate(req.body);
    const { email, password } = value;

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const toLowerCaseEmail = email.toLowerCase();
    const user = await findUserByEmail(toLowerCaseEmail);
    const id = user.id;
    const isPasswordValid = await passwordValidator(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'Unauthorized',
        code: 401,
        message: 'Email or password is wrong',
        data: 'Unauthorized',
      });
    }

    const payload = { id };
    const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });
    await updateKeyInDBForUserWithId({ token }, id);

    return res.json({
      status: 'Success',
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
      status: 'Error',
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
        status: 'Unauthorized',
        code: 401,
        message: 'Not authorized',
      });
    }

    const user = await findUserByTokenInDB(token);
    const id = user.id;
    token = null;
    await updateKeyInDBForUserWithId({ token }, id);
    return res.json({
      status: 'Success',
      code: 200,
      message: 'User successfully logged out',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'Error',
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
        status: 'Unauthorized',
        code: 401,
        message: 'Not authorized',
      });
    }
    const user = await findUserByTokenInDB(token);
    return res.json({
      status: 'Success',
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
      status: 'Error',
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
      return res.status(400).json({ message: error.message });
    }

    const userId = req.user.id;

    await updateKeyInDBForUserWithId({ subscription }, userId);
    return res.json({
      status: 'Success',
      code: 200,
      message: `User's subscription changed successfully to ${subscription}.`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 'Error',
      code: 500,
      message: 'Server error',
    });
  }
};

export {
  findUserByEmail,
  createUserIfNotExist,
  loginUser,
  logoutUser,
  getCurrentUserDataFromToken,
  updateUserSubscriptionStatus,
};
