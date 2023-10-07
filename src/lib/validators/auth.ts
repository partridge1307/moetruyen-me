import { z } from 'zod';

export const TwoFactorValidator = z.object({
  password: z.string(),
});
export type TwoFactorPayload = z.infer<typeof TwoFactorValidator>;

export const TOTPValidator = z.object({
  totp: z.string().min(6, 'OTP phải là 6 chữ số'),
});
export type TOTPPayload = z.infer<typeof TOTPValidator>;
