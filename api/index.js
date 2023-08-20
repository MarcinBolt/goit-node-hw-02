// import {
//   getUserContactsList,
//   getContactById,
//   createContact,
//   updateContact,
//   updateStatusContact,
//   removeContact,
// } from '../controller/contacts.controller.js';
// import express from 'express';
// import jwt from 'jsonwebtoken';
// import passport from 'passport';
// import auth from './user.auth.js';
// import User from '../service/schemas/user.schema.js';
// import 'dotenv/config';
// import {
//   createUser,
//   findUserById,
//   // findUserByEmail,
//   passwordValidator,
// } from '../service/users.service.js';
import '../routes/users.routes.js';
import '../routes/contacts.routes.js'

// const SECRET = process.env.SECRET;
// const router = express.Router();

// const auth = (req, res, next) => {
//   passport.authenticate('jwt', { session: false }, (err, user) => {
//     if (!user || err) {
//       return res.status(401).json({
//         status: 'error',
//         code: 401,
//         message: 'Unauthorized',
//         data: 'Unauthorized',
//       });
//     }
//     req.user = user;
//     next();
//   })(req, res, next);
// };

// router.post('/users/signup', async (req, res, next) => {
//   const { email, password } = req.body;
//   const toLowerCaseEmail = email.toLowerCase();
//   const user = await User.findOne({ email: toLowerCaseEmail });
//   if (user) {
//     return res.status(409).json({
//       status: 'Error',
//       code: 409,
//       message: 'Email in use',
//       data: 'Conflict',
//     });
//   }
//   try {
//     createUser(toLowerCaseEmail, password);
//     res.status(201).json({
//       status: 'Created',
//       code: 201,
//       data: {
//         user: {
//           email: toLowerCaseEmail,
//           subscription: 'starter',
//         },
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// router.post('/users/login', async (req, res, next) => {
//   const { email, password } = req.body;
//   const toLowerCaseEmail = email.toLowerCase();
//   const user = await User.findOne({ email: toLowerCaseEmail });

//   if (!user || !passwordValidator(password, user.password)) {
//     return res.status(401).json({
//       status: 'Unauthorized',
//       code: 401,
//       message: 'Email or password is wrong',
//       data: 'Unauthorized',
//     });
//   }

//   const payload = {
//     id: user.id,
//     email: user.email,
//     subscription: user.subscription,
//   };

//   const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });
//   user.token = token;
//   await user.save();
//   res.json({
//     status: 'Success',
//     code: 200,
//     data: {
//       token,
//       user: {
//         email: user.email,
//         subscription: user.subscription,
//       },
//     },
//   });
// });

// router.get('/users/logout', auth, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const user = await findUserById(userId);
//     if (!user) {
//       return res.status(401).json({ message: 'Not authorized' });
//     }
//     user.token = null;
//     await user.save();
//     return res.status(204).end();
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// });

// router.get('/list', auth, (req, res, next) => {
//   const { email } = req.user;
//   res.json({
//     status: 'Success',
//     code: 200,
//     data: {
//       message: `Authorization was successful: ${email}`,
//     },
//   });
// });

// router.get('/contacts', auth, getUserContactsList);

// router.get('/contacts/:id', getContactById);

// router.post('/contacts', createContact);

// router.put('/contacts/:id', updateContact);

// router.patch('/contacts/:id/favorite', updateStatusContact);

// router.delete('/contacts/:id', removeContact);

// export default router;
