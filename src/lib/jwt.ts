import { sign } from 'jsonwebtoken';

export const signPublicToken = (payload: object) =>
  sign({ ...payload }, process.env.PUBLIC_KEY!, { expiresIn: '15m' });
