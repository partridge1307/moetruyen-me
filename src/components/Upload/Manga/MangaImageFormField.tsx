'use client';

import { FC } from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/Form';
import Image from 'next/image';
import { ImagePlus } from 'lucide-react';
import type { MangaUploadPayload } from '@/lib/validators/manga';
import type { UseFormReturn } from 'react-hook-form';
import { AspectRatio } from '@/components/ui/AspectRatio';
import dynamic from 'next/dynamic';

const ImageCropModal = dynamic(() => import('@/components/ImageCropModal'), {
  ssr: false,
});

interface MangaImageFormFieldProps {
  form: UseFormReturn<MangaUploadPayload>;
}

const MangaImageFormField: FC<MangaImageFormFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="image"
      render={({ field }) => (
        <FormItem>
          <FormLabel
            className="after:content-['*'] after:text-red-500 after:ml-0.5"
            title="Xem trước ở tỉ lệ của Tiêu Điểm. Còn lại Ảnh sẽ tự fill vừa với khung"
          >
            Ảnh bìa
          </FormLabel>
          <FormMessage />
          <FormControl>
            <AspectRatio ratio={4 / 3}>
              {!!field.value ? (
                <Image
                  fill
                  sizes="40vw"
                  quality={40}
                  priority
                  src={field.value}
                  alt="Preview Image"
                  className="rounded-md border-2 object-cover hover:cursor-pointer dark:border-zinc-800"
                  onClick={(e) => {
                    e.preventDefault();

                    const target = document.getElementById(
                      'add-image-input'
                    ) as HTMLInputElement;
                    target.click();
                  }}
                />
              ) : (
                <div
                  role="button"
                  className="w-full h-full relative flex justify-center items-center hover:cursor-pointer rounded-md border-2 bg-background"
                  onClick={(e) => {
                    e.preventDefault();

                    const target = document.getElementById(
                      'add-image-input'
                    ) as HTMLInputElement;
                    target.click();
                  }}
                >
                  <ImagePlus className="w-8 h-8" />
                </div>
              )}
            </AspectRatio>
          </FormControl>
          <input
            id="add-image-input"
            type="file"
            accept=".jpg, .jpeg, .png"
            className="hidden"
            onChange={(e) => {
              if (
                e.target.files?.length &&
                e.target.files[0].size < 4 * 1000 * 1000
              ) {
                field.onChange(URL.createObjectURL(e.target.files[0]));

                const target = document.getElementById(
                  'crop-modal-button'
                ) as HTMLButtonElement;
                target.click();
                e.target.value = '';
              }
            }}
          />
          <ImageCropModal
            image={field.value}
            aspect={4 / 3}
            setImageCropped={(value) => field.onChange(value)}
          />
        </FormItem>
      )}
    />
  );
};

export default MangaImageFormField;
