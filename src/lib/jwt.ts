import { sign } from 'jsonwebtoken';

export const signPublicToken = (payload: object, expiresIn: string = '15m') =>
  sign({ ...payload }, process.env.PUBLIC_KEY!, { expiresIn });
