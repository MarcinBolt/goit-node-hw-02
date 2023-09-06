import { nanoid } from 'nanoid';

export const createEmailVerificationToken = async () => await nanoid();
