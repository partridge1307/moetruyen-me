'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { ChapterUploadPayload } from '@/lib/validators/chapter';
import dynamic from 'next/dynamic';
import { FC, useEffect, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import ChapterImageAction from './components/ChapterImageAction';
import ChapterImageInput, {
  AddImageTypeEnum,
  ImageType,
} from './components/ChapterImageInput';

const DnDChapterImage = dynamic(() => import('@/components/DragAndDrop'), {
  ssr: false,
});

interface ChapterImageFormFieldProps {
  form: UseFormReturn<ChapterUploadPayload>;
  isUploading: boolean;
  initialImages?: ImageType[];
}

const ChapterImageFormField: FC<ChapterImageFormFieldProps> = ({
  form,
  isUploading,
  initialImages = [],
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<ImageType[]>(initialImages);
  const [inputType, setInputType] =
    useState<keyof typeof AddImageTypeEnum>('IMAGE');

  useEffect(() => {
    form.setValue('image', images);
  }, [form, images]);

  return (
    <FormField
      control={form.control}
      name="image"
      render={({ field }) => (
        <FormItem>
          <FormLabel
            title="Sẽ bỏ qua ảnh lớn hơn 4MB"
            className="after:content-['*'] after:ml-0.5 after:text-red-500"
          >
            Ảnh
          </FormLabel>
          <FormMessage />

          <ChapterImageAction
            hasImages={!!images.length}
            addImage={(type) => {
              setInputType(type);
              setTimeout(() => inputRef.current?.click(), 0);
            }}
            clearImage={() => setImages([])}
          >
            <DnDChapterImage
              isUpload={isUploading}
              items={images}
              setItems={setImages}
            />
          </ChapterImageAction>

          <FormControl>
            <ChapterImageInput
              ref={(ref) => {
                if (!ref) return;

                field.ref(ref);
                // @ts-ignore
                inputRef.current = ref;
              }}
              type={inputType}
              setType={setInputType}
              setImages={setImages}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default ChapterImageFormField;
