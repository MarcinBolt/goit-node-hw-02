import Contact from './schemas/contact.schema.js';

const getAllContacts = async () => {
  return Contact.find();
};

const getContactById = id => {
  return Contact.findOne({ _id: id });
};

const createContact = ({ name, email, phone }) => {
  return Contact.create({ name, email, phone });
};

const updateContact = (id, fields) => {
  return Contact.findByIdAndUpdate({ _id: id }, fields, { new: true });
};

const removeContact = id => {
  return Contact.findByIdAndRemove({ _id: id });
};

export { getAllContacts, getContactById, createContact, updateContact, removeContact };
