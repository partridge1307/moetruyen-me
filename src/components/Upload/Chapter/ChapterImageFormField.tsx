'use client';

import { Button } from '@/components/ui/Button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { ChapterUploadPayload } from '@/lib/validators/chapter';
import classes from '@/styles/mantine/dropzone.module.css';
import { Dropzone } from '@mantine/dropzone';
import '@mantine/dropzone/styles.layer.css';
import type JSZip from 'jszip';
import {
  ArrowUpFromLine,
  CircleOff,
  FileArchive,
  Loader,
  PlusCircle,
  Trash,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

const DnDChapterImage = dynamic(() => import('@/components/DragAndDrop'), {
  ssr: false,
});

interface ChapterImageFormFieldProps {
  form: UseFormReturn<ChapterUploadPayload>;
  isUploading: boolean;
  initialImages?: { src: string; name: string }[];
}

const ChapterImageFormField: FC<ChapterImageFormFieldProps> = ({
  form,
  isUploading,
  initialImages = [],
}) => {
  const zipInputFef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const jszipRef = useRef<JSZip>(null);
  const [isMounted, setMounted] = useState(false);

  const [images, setImages] =
    useState<{ src: string; name: string }[]>(initialImages);

  useEffect(() => {
    form.setValue('image', images);
  }, [form, images]);

  const initJSZip = useCallback(async () => {
    const jszip = (await import('jszip')).default;
    // @ts-expect-error
    jszipRef.current = jszip;
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') setMounted(true);
  }, []);

  useEffect(() => {
    const init = async () => {
      await initJSZip();
    };

    if (isMounted) {
      init();
    }
  }, [initJSZip, isMounted]);

  return (
    <>
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

            {!!images.length ? (
              <>
                <div className="flex flex-wrap items-center gap-4">
                  <Button
                    type="button"
                    className="flex items-center justify-center gap-1"
                    onClick={(e) => {
                      e.preventDefault();

                      imageInputRef.current?.click();
                    }}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Thêm ảnh
                  </Button>
                  <Button
                    type="button"
                    variant={'destructive'}
                    className="flex items-center justify-center gap-1"
                    onClick={(e) => {
                      e.preventDefault();
                      setImages([]);
                    }}
                  >
                    <Trash className="w-4 h-4" />
                    Xóa toàn bộ
                  </Button>
                </div>

                <div className="max-sm:w-3/4 pt-6">
                  <DnDChapterImage
                    isUpload={isUploading}
                    items={images}
                    setItems={setImages}
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-wrap items-center space-x-6">
                <Button
                  type="button"
                  className="space-x-2"
                  onClick={(e) => {
                    e.preventDefault();

                    imageInputRef.current?.click();
                  }}
                >
                  <PlusCircle className="w-5 h-5" />
                  Thêm ảnh
                </Button>

                <Button
                  type="button"
                  className="space-x-2"
                  onClick={(e) => {
                    e.preventDefault();

                    zipInputFef.current?.click();
                  }}
                >
                  <FileArchive className="w-5 h-5" />
                  Tải ảnh từ file zip
                </Button>
              </div>
            )}

            <FormControl>
              <input
                ref={(e) => {
                  field.ref(e);
                  // @ts-ignore
                  imageInputRef.current = e;
                }}
                multiple
                type="file"
                accept="image/jpg, image/png, image/jpeg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    let arr: {
                      src: string;
                      name: string;
                    }[] = [];

                    for (let i = 0; i < e.target.files.length; i++) {
                      if (e.target.files.item(i)!.size > 4 * 1000 * 1000) {
                        continue;
                      }

                      const imageUrl = URL.createObjectURL(
                        e.target.files.item(i)!
                      );
                      arr.push({
                        src: imageUrl,
                        name: e.target.files.item(i)!.name,
                      });
                    }
                    e.target.value = '';
                    setImages((prev) => [...prev, ...arr]);
                  }
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <input
        ref={zipInputFef}
        type="file"
        accept="application/zip"
        className="hidden"
        onChange={async (e) => {
          if (e.target.files?.length) {
            if (!jszipRef.current) return;

            const blobFiles = await jszipRef.current
              .loadAsync(e.target.files[0])
              .then(
                async (zip) =>
                  await Promise.all(
                    Object.keys(zip.files)
                      .filter(
                        (file) =>
                          file.endsWith('.jpg') ||
                          file.endsWith('.jpeg') ||
                          file.endsWith('.png')
                      )
                      .map(async (fileName) => ({
                        name: fileName,
                        blob: new Blob(
                          [await zip.files[fileName].async('blob')],
                          {
                            type: `image/${
                              fileName.split('.').pop() ?? 'jpeg'
                            }`,
                          }
                        ),
                      }))
                  )
              );

            setImages(
              blobFiles
                .filter((file) => file.blob.size < 4 * 1000 * 1000)
                .map((file) => ({
                  name: file.name,
                  src: URL.createObjectURL(file.blob),
                }))
            );
            e.target.value = '';
          }
        }}
      />

      <Dropzone.FullScreen
        active
        multiple
        maxSize={4000000}
        accept={['image/png', 'image/jpeg', 'image/jpg', 'application/zip']}
        classNames={classes}
        onDrop={async (files) => {
          if (files.some((file) => file.type === 'application/zip')) {
            if (!jszipRef.current) return;

            const zipFiles = files.filter(
              (file) => file.type === 'application/zip'
            );

            const blobFiles = await jszipRef.current
              .loadAsync(zipFiles[0])
              .then(
                async (zip) =>
                  await Promise.all(
                    Object.keys(zip.files)
                      .filter(
                        (file) =>
                          file.endsWith('.jpg') ||
                          file.endsWith('.jpeg') ||
                          file.endsWith('.png')
                      )
                      .map(async (fileName) => ({
                        name: fileName,
                        blob: new Blob(
                          [await zip.files[fileName].async('blob')],
                          {
                            type: `image/${
                              fileName.split('.').pop() ?? 'jpeg'
                            }`,
                          }
                        ),
                      }))
                  )
              );

            setImages(
              blobFiles
                .filter((file) => file.blob.size < 4 * 1000 * 1000)
                .map((file) => ({
                  name: file.name,
                  src: URL.createObjectURL(file.blob),
                }))
            );
          } else {
            const blobImages = files.map((file) => ({
              name: file.name,
              src: URL.createObjectURL(file),
            }));

            setImages(blobImages);
          }
        }}
      >
        <Dropzone.Accept>
          <div className="flex items-center gap-2 dark:text-white">
            <ArrowUpFromLine className="w-6 h-6" />
            <p>Kéo ảnh vào khu vực này</p>
          </div>
        </Dropzone.Accept>

        <Dropzone.Reject>
          <div className="flex items-center gap-2 text-red-500">
            <CircleOff className="w-6 h-6 text-red-500" />
            <p>Ảnh không hợp lệ</p>
          </div>
        </Dropzone.Reject>

        <Dropzone.Idle>
          <div className="flex items-center gap-2 dark:text-white">
            <Loader className="w-6 h-6 animate-spin" />
            <p>Đang nhận ảnh</p>
          </div>
        </Dropzone.Idle>
      </Dropzone.FullScreen>
    </>
  );
};

export default ChapterImageFormField;
