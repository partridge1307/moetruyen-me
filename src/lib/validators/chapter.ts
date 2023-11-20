import { z } from 'zod';
import { zfd } from 'zod-form-data';

export const ChapterUploadValidator = z.object({
  chapterIndex: z
    .number()
    .min(0, { message: 'Số thứ tự chapter phải lớn hơn 0' }),
  chapterName: z
    .string()
    .optional()
    .refine((value) => {
      if (value) {
        return value.length > 3 && value.length <= 256;
      } else return true;
    }, 'Tối thiểu 3 kí tự. Tối đa 256 kí tự'),
  volume: z.number().min(1, { message: 'Volume phải là số dương' }),
  image: z
    .object({
      src: z
        .string()
        .refine(
          (value) =>
            value.startsWith('blob') ||
            value.startsWith(process.env.NEXT_PUBLIC_IMG_DOMAIN!),
          'Ảnh không hợp lệ'
        ),
      name: z.string(),
    })
    .array()
    .refine((values) => values.length >= 1, 'Tối thiểu 1 ảnh'),
});
export type ChapterUploadPayload = z.infer<typeof ChapterUploadValidator>;

export const ChapterFormUploadValidator = zfd.formData({
  images: zfd
    .repeatableOfType(
      zfd
        .file()
        .refine((file) => file.size < 4 * 1000 * 1000, 'Ảnh phải nhỏ hơn 4MB')
        .refine(
          (file) =>
            ['image/jpg', 'image/png', 'image/jpeg'].includes(file.type),
          'Chỉ nhận định dạng .jpg, .png, .jpeg'
        )
    )
    .refine((files) => files.length >= 1, 'Tối thiểu 1 ảnh'),
  volume: zfd.numeric(z.number().min(1, 'Số volume phải lớn hơn 0')),
  chapterIndex: zfd.numeric(z.number().min(0, 'Số thứ tự phải lớn hơn 0')),
  chapterName: zfd
    .text(z.string().min(3, 'Tối thiểu 3 kí tự').max(125, 'Tối đa 125 kí tự'))
    .optional(),
});

export const ChapterFormEditValidator = zfd.formData({
  images: zfd
    .repeatableOfType(
      zfd
        .text()
        .refine(
          (image) =>
            image.startsWith(process.env.NEXT_PUBLIC_IMG_DOMAIN!) ||
            Number(image) >= 0,
          'Invalid Images'
        )
    )
    .refine((files) => files.length >= 1, 'Tối thiểu 1 ảnh'),
  files: zfd.repeatableOfType(
    zfd
      .file()
      .refine((file) => file.size < 4 * 1000 * 1000, 'Ảnh phải nhỏ hơn 4MB')
      .refine(
        (file) => ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type),
        'Định dạng ảnh không hợp lệ'
      )
  ),
  volume: zfd.numeric(z.number().min(1, 'Volume phải lớn hơn 0')),
  chapterName: zfd
    .text(z.string().min(3, 'Tối thiểu 3 kí tự').max(125, 'Tối đa 125 kí tự'))
    .optional(),
  chapterIndex: zfd.numeric(z.number().min(0, 'Số thứ tự phải lớn hơn 0')),
});
