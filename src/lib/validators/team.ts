import type { SerializedEditorState, SerializedLexicalNode } from 'lexical';
import { ZodType, z } from 'zod';
import { zfd } from 'zod-form-data';
import { vieRegex } from '../utils';

export const TeamFormValidator = zfd.formData({
  cover: zfd
    .file()
    .or(zfd.text())
    .optional()
    .refine((value) => {
      if (!value) return true;
      if (value instanceof File) return value.size < 4 * 1000 * 1000;
      else return value.startsWith(`${process.env.NEXT_PUBLIC_IMG_DOMAIN}`);
    }, 'Tối đa 4MB')
    .refine((value) => {
      if (!value) return true;
      if (value instanceof File)
        return ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'].includes(
          value.type
        );
      else return true;
    }, 'Chỉ nhận ảnh có định dạng .jpg, .png, .jpeg'),
  image: zfd
    .file()
    .or(zfd.text())
    .refine((value) => {
      if (value instanceof File) {
        return value.size < 4 * 1000 * 1000;
      } else return value.startsWith(`${process.env.NEXT_PUBLIC_IMG_DOMAIN}`);
    }, 'Tối đa 4MB')
    .refine((value) => {
      if (value instanceof File)
        return ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'].includes(
          value.type
        );
      return true;
    }, 'Chỉ nhận ảnh có định dạng .jpg, .png, .jpeg'),
  name: zfd.text(
    z
      .string()
      .min(3, 'Tối thiểu 3 kí tự')
      .max(64, 'Tối đa 64 kí tự')
      .refine(
        (value) => vieRegex.test(value),
        'Chỉ nhận kí tự tiếng Việt, Alphanumeric, khoảng trống'
      )
  ),
  description: zfd.json(
    z.any() as ZodType<SerializedEditorState<SerializedLexicalNode>>
  ),
  plainTextDescription: zfd.text().optional(),
});

export const TeamValidator = z.object({
  image: z
    .string()
    .refine(
      (value) =>
        value.startsWith('blob') ||
        value.startsWith(process.env.NEXT_PUBLIC_IMG_DOMAIN!),
      'Ảnh không hợp lệ'
    ),
  cover: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      return (
        value.startsWith('blob') ||
        value.startsWith(process.env.NEXT_PUBLIC_IMG_DOMAIN!)
      );
    }, 'Ảnh không hợp lệ'),
  name: z
    .string()
    .min(3, 'Tối thiểu 3 kí tự')
    .max(64, 'Tối đa 64 kí tự')
    .refine(
      (value) => vieRegex.test(value),
      'Chỉ nhận kí tự tiếng Việt, Alphanumeric, khoảng trống'
    ),
  description: z.any() as ZodType<SerializedEditorState<SerializedLexicalNode>>,
  plainTextDescription: z.string().optional(),
});
export type TeamPayload = z.infer<typeof TeamValidator>;

export const TeamInfiniteQueryValidator = z.object({
  cursor: z.string().nullish().optional(),
});
