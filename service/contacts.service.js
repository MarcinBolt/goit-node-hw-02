import Contact from './schemas/contact.schema.js';

const getAllContactsFromDB = async () => await Contact.find();

const getCurrentUserContactsFromDB = async owner => await Contact.find({ owner });

const getCurrentUserContactByIdFromDB = async (owner, id) =>
  await Contact.findOne({ _id: id, owner });

const createContactInDB = async ({ name, email, phone, owner }) =>
  await Contact.create({ name, email, phone, owner });

const updateCurrentUserContactInDB = async (id, { name, email, phone, favorite, owner }) => {
  const contact = await Contact.findOne({ _id: id, owner });
  if (!contact) {
    return null;
  }
  return await Contact.findByIdAndUpdate({ _id: id }, { name, email, phone, favorite, owner }, { new: true });
};

const removeCurrentUserContactFromDB = async (id, {owner}) => {
const contact = await Contact.findOne({ _id: id, owner });
if (!contact) {
  return null;
}

  return await Contact.findByIdAndRemove({ _id: id });
};

export {
  getAllContactsFromDB,
  getCurrentUserContactsFromDB,
  getCurrentUserContactByIdFromDB,
  createContactInDB,
  updateCurrentUserContactInDB,
  removeCurrentUserContactFromDB,
};
