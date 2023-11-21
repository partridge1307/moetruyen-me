import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { vieRegex } from '../utils';

export const UserProfileEditValidator = z.object({
  avatar: z
    .string()
    .refine(
      (value) =>
        value.startsWith('blob') ||
        value.startsWith(process.env.NEXT_PUBLIC_IMG_DOMAIN!),
      'Ảnh không hợp lệ'
    ),
  banner: z
    .string()
    .refine(
      (value) =>
        value.startsWith('blob') ||
        value.startsWith(process.env.NEXT_PUBLIC_IMG_DOMAIN!),
      'Ảnh không hợp lệ'
    ),
  name: z
    .string()
    .min(5, 'Tối thiểu 5 kí tự')
    .max(32, 'Tối đa 30 kí tự')
    .refine(
      (value) => vieRegex.test(value),
      'Tên chỉ chấp nhận kí tự in hoa, in thường, gạch dưới, khoảng cách hoặc số'
    ),
  color: z
    .object({
      from: z.string(),
      to: z.string(),
    })
    .or(
      z.object({
        color: z.string(),
      })
    )
    .nullable(),
});
export type UserProfileEditPayload = z.infer<typeof UserProfileEditValidator>;

export const UserFormUpdateValidator = zfd.formData({
  avatar: zfd
    .file()
    .optional()
    .refine((file) => {
      if (file) {
        return ['image/jpg', 'image/png', 'image/jpeg', 'image/webp'].includes(
          file.type
        );
      } else return true;
    }, 'Chỉ nhận định dạng .jpg, .png, .jpeg')
    .refine((file) => {
      if (file) {
        return file.size < 4 * 1000 * 1000;
      } else return true;
    }, 'Ảnh phải nhỏ dưới 4MB'),
  banner: zfd
    .file()
    .optional()
    .refine((file) => {
      if (file) {
        return ['image/jpg', 'image/png', 'image/jpeg', 'image/webp'].includes(
          file.type
        );
      } else return true;
    }, 'Chỉ nhận định dạng .jpg, .png, .jpeg')
    .refine((file) => {
      if (file) {
        return file.size < 4 * 1000 * 1000;
      } else return true;
    }, 'Ảnh phải nhỏ dưới 4MB'),
  name: zfd.text(
    z
      .string()
      .min(5, 'Tối thiểu 5 kí tự')
      .max(32, 'Tối đa 32 kí tự')
      .refine(
        (value) => vieRegex.test(value),
        'Tên chỉ chấp nhận kí tự in hoa, in thường, gạch dưới, khoảng cách hoặc số'
      )
  ),
  color: zfd
    .json(
      z
        .object({ from: z.string(), to: z.string() })
        .or(z.object({ color: z.string() }))
    )
    .nullish()
    .optional(),
});

export const UserPasswordChangeValidator = z
  .object({
    oldPassword: z.string(),
    newPassword: z.string(),
    confirmNewPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmNewPassword, {
    message: 'Xác nhận mật khẩu phải giống mật khẩu mới',
    path: ['newPassword', 'confirmNewPassword'],
  });

export type UserPasswordChangePayload = z.infer<
  typeof UserPasswordChangeValidator
>;
