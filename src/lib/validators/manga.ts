import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';
import { ZodType, z } from 'zod';
import { zfd } from 'zod-form-data';
import { disRegex, fbRegex, vieRegex } from '../utils';

export const authorInfo = z.object({
  id: z.number(),
  name: z.string(),
});
export type authorInfoProps = z.infer<typeof authorInfo>;

export const tagInfo = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
});
export type tagInfoProps = z.infer<typeof tagInfo>;

export const MangaUploadValidator = z.object({
  cover: z
    .string()
    .optional()
    .refine((value) => {
      if (value) {
        return (
          value.startsWith('blob') ||
          value.startsWith('https://i.moetruyen.net')
        );
      } else return true;
    }, 'Ảnh bìa không hợp lệ'),
  image: z
    .string()
    .refine(
      (value) =>
        value.startsWith('blob') || value.startsWith('https://i.moetruyen.net'),
      'Ảnh không hợp lệ'
    ),
  name: z
    .string()
    .min(3, { message: 'Tối thiểu 3 kí tự' })
    .max(256, { message: 'Tối đa 256 kí tự' })
    .refine(
      (value) => vieRegex.test(value),
      'Tên chỉ chấp nhận kí tự latin, kí tự đặc biệt phổ thông'
    ),
  altName: z
    .array(z.string().max(512, 'Tối đa 512 kí tự'))
    .max(5, 'Tối đa 5 tên'),
  slug: z
    .string()
    .optional()
    .refine((value) => {
      if (value) {
        return value.length <= 32 && /[a-z0-9-]/.test(value);
      } else return true;
    }, 'Tối đa 32 kí tự. Kí tự thuộc alphanumeric, dấu gạch ngang'),
  description: z.any() as ZodType<SerializedEditorState<SerializedLexicalNode>>,
  review: z.string().min(5, 'Tối thiểu 5 kí tự').max(256, 'Tối đa 256 kí tự'),
  author: z.array(authorInfo).min(1, { message: 'Tối thiểu một tác giả' }),
  tag: z.array(tagInfo).min(1, { message: 'Tối thiểu có một thể loại' }),
  facebookLink: z
    .string()
    .optional()
    .refine((link) => {
      if (link) {
        return fbRegex.test(link);
      } else return true;
    }, 'Chỉ chấp nhận link Page hoặc Profile'),
  discordLink: z
    .string()
    .optional()
    .refine((link) => {
      if (link) {
        return disRegex.test(link);
      } else return true;
    }, 'Chỉ chấp nhận link Invite'),
});
export type MangaUploadPayload = z.infer<typeof MangaUploadValidator>;

export const MangaFormValidator = zfd.formData({
  cover: zfd
    .file()
    .or(zfd.text())
    .optional()
    .refine((file) => {
      if (!file) return true;

      if (file instanceof File) {
        return file.size < 4 * 1000 * 1000;
      } else return file.startsWith(`${process.env.NEXT_PUBLIC_IMG_DOMAIN}`);
    }, 'Tối đa 4MB')
    .refine((file) => {
      if (!file) return true;

      if (file instanceof File) {
        return ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'].includes(
          file.type
        );
      } else return file.startsWith(`${process.env.NEXT_PUBLIC_IMG_DOMAIN}`);
    }, 'Chỉ nhận ảnh có định dạng .jpg, .png, .jpeg'),
  image: zfd
    .file()
    .refine((file) => file.size < 4 * 1000 * 1000, 'Tối đa 4MB')
    .refine(
      (file) =>
        ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'].includes(
          file.type
        ),
      'Chỉ nhận ảnh có định dạng .jpg, .png, .jpeg'
    )
    .or(
      zfd
        .text()
        .refine(
          (endpoint) =>
            endpoint.startsWith(`${process.env.NEXT_PUBLIC_IMG_DOMAIN}`),
          'Ảnh có đường dẫn không hợp lệ'
        )
    ),
  name: zfd.text(
    z
      .string()
      .min(3, 'Tối thiểu 3 kí tự')
      .max(256, 'Tối đa 256 kí tự')
      .refine(
        (value) => vieRegex.test(value),
        'Tên chỉ chấp nhận kí tự latin, kí tự đặc biệt phổ thông'
      )
  ),
  slug: zfd
    .text(
      z
        .string()
        .max(32, 'Tối đa 32 kí tự')
        .refine((value) => /[a-z0-9-]/.test(value), 'Không hợp lệ')
    )
    .optional(),
  description: zfd.json(
    z.any() as ZodType<SerializedEditorState<SerializedLexicalNode>>
  ),
  review: zfd.text(
    z.string().min(5, 'Tối thiểu 5 kí tự').max(256, 'Tối đa 256 kí tự')
  ),
  altName: zfd
    .repeatableOfType(zfd.text(z.string().max(512, 'Tối đa 512 kí tự')))
    .refine((values) => values.length < 6, 'Tối đa 5 tên'),
  author: zfd.repeatableOfType(zfd.json(authorInfo)),
  tag: zfd.repeatableOfType(zfd.json(tagInfo)),
  facebookLink: zfd.text(
    z
      .string()
      .optional()
      .refine((link) => {
        if (link) {
          return fbRegex.test(link);
        } else return true;
      }, 'Chỉ chấp nhận link Page hoặc Profile')
  ),
  discordLink: zfd.text(
    z
      .string()
      .optional()
      .refine((link) => {
        if (link) {
          return disRegex.test(link);
        } else return true;
      }, 'Chỉ chấp nhận link Invite')
  ),
});
