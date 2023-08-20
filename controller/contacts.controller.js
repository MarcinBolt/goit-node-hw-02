import {
  getCurrentUserContactsFromDB,
  getCurrentUserContactByIdFromDB,
  createContactInDB,
  updateCurrentUserContactInDB,
  removeCurrentUserContactFromDB,
} from '../service/contacts.service.js';
import Joi from 'joi';

const contactReqBodySchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  phone: Joi.string().min(6).max(20).required(),
});

const favoriteReqBodySchema = Joi.object({
  favorite: Joi.boolean().required(),
});

const getUserContactsList = async (req, res, next) => {
  try {
    const owner = req.user.id;
    const contacts = await getCurrentUserContactsFromDB(owner);
    return res.json({
      status: 'success',
      code: 200,
      data: {
        contacts,
      },
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const getContactById = async (req, res, next) => {
  const contactId = req.params.id;
  const owner = req.user.id;
  try {
    const contact = await getCurrentUserContactByIdFromDB(owner, contactId);
    if (contact) {
      res.json({
        status: 'success',
        code: 200,
        data: { contact },
      });
    } else {
      res.status(404).json({
        status: 'error',
        code: 404,
        message: `Not found contact id: ${contactId}`,
        data: 'Not Found',
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const createContact = async (req, res, next) => {
  const { value, error } = contactReqBodySchema.validate(req.body);
  const { name, email, phone } = value;
  const owner = req.user.id;

  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  try {
    const contact = await createContactInDB({ name, email, phone, owner });

    res.status(201).json({
      status: 'success',
      code: 201,
      data: { createdContact: contact },
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const updateContact = async (req, res, next) => {
  const { value, error } = contactReqBodySchema.validate(req.body);
  const { name, email, phone } = value;
  const { id } = req.params;
  const owner = req.user.id;

  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  try {
    const contact = await updateCurrentUserContactInDB(id, { name, email, phone, owner });
    if (contact) {
      res.json({
        status: 'success',
        code: 200,
        data: { updatedContact: contact },
      });
    } else {
      res.status(404).json({
        status: 'error',
        code: 404,
        message: `Not found contact id: ${id}`,
        data: 'Not Found',
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const updateStatusContact = async (req, res, next) => {
  const { value, error } = favoriteReqBodySchema.validate(req.body);
  const { favorite } = value;
  const { id } = req.params;
  const owner = req.user.id;

  if (error) {
    res.status(400).json({ message: 'missing field favorite' });
    return;
  }

  try {
    const result = await updateCurrentUserContactInDB(id, { owner, favorite });
    if (result) {
      res.json({
        status: 'Success',
        code: 200,
        data: { updatedContact: result },
      });
    } else {
      res.status(404).json({
        status: 'error',
        code: 404,
        message: `Not found contact id: ${id}`,
        data: 'Not Found',
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const removeContact = async (req, res, next) => {
  const { id } = req.params;
  const owner = req.user.id;

  try {
    const result = await removeCurrentUserContactFromDB(id, { owner });
    if (result) {
      res.json({
        status: 'success',
        code: 200,
        data: { deletedContact: result },
      });
    } else {
      res.status(404).json({
        status: 'error',
        code: 404,
        message: `Not found contact id: ${id}`,
        data: 'Not Found',
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

export {
  getUserContactsList,
  getContactById,
  createContact,
  updateContact,
  updateStatusContact,
  removeContact,
};
