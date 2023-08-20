import Contact from './schemas/contact.schema.js';

const getAllContactsFromDB = async () => Contact.find();

const getContactByIdFromDB = id => Contact.findOne({ _id: id });

const createContactInDB = ({ name, email, phone, owner }) =>
  Contact.create({ name, email, phone, owner });

const updateContactInDB = (id, fields) =>
  Contact.findByIdAndUpdate({ _id: id }, fields, { new: true });

const removeContactFromDB = id => Contact.findByIdAndRemove({ _id: id });

export {
  getAllContactsFromDB,
  getContactByIdFromDB,
  createContactInDB,
  updateContactInDB,
  removeContactFromDB,
};
