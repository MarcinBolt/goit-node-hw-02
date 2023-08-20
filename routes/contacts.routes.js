import express from 'express';
import auth from '../api/user.auth.js';
import {
  getUserContactsList,
  getContactById,
  createContact,
  updateContact,
  updateStatusContact,
  removeContact,
} from '../controller/contacts.controller.js';

const contactsRouter = express.Router();

contactsRouter.get('/contacts', auth, getUserContactsList);

contactsRouter.get('/contacts/:id', auth, getContactById);

contactsRouter.post('/contacts', auth, createContact);

contactsRouter.put('/contacts/:id', auth, updateContact);

contactsRouter.patch('/contacts/:id/favorite', auth, updateStatusContact);

contactsRouter.delete('/contacts/:id', auth, removeContact);

export default contactsRouter;
