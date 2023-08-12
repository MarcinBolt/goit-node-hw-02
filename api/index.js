import {
  get,
  getById,
  create,
  update,
  updateStatusContact,
  remove,
} from '../controller/contacts.controller.js';
import express from 'express';

const router = express.Router();

router.get('/contacts', get);

router.get('/contacts/:id', getById);

router.post('/contacts', create);

router.put('/contacts/:id', update);

router.patch('/contacts/:id/favorite', updateStatusContact);

router.delete('/contacts/:id', remove);

export default router;
