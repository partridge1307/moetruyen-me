import { sign } from 'jsonwebtoken';

export const signPublicToken = (payload: object) =>
  sign({ ...payload }, process.env.BOT_KEY!, {
    issuer: 'Moetruyen',
    expiresIn: 60 * 15,
  });
