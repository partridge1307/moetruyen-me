'use client';

import ChapterImageSkeleton from '@/components/Skeleton/ChapterImageSkeleton';
import ChapterIndexSkeleton from '@/components/Skeleton/ChapterIndexSkeleton';
import { Button } from '@/components/ui/Button';
import { Form } from '@/components/ui/Form';
import { Progress } from '@/components/ui/Progress';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import {
  ChapterUploadValidator,
  type ChapterUploadPayload,
} from '@/lib/validators/chapter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import ChapterNameForm from './ChapterNameFormField';
import ChapterVolumeFormField from './ChapterVolumeFormField';

const ChapterIndexForm = dynamic(() => import('./ChapterIndexFormField'), {
  ssr: false,
  loading: () => <ChapterIndexSkeleton />,
});
const ChapterImageFormField = dynamic(() => import('./ChapterImageFormField'), {
  ssr: false,
  loading: () => <ChapterImageSkeleton />,
});

const ChapterUpload = ({ id }: { id: number }) => {
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const router = useRouter();
  const [uploadProgress, setUploadProgres] = useState<number | null>(null);

  const form = useForm<ChapterUploadPayload>({
    resolver: zodResolver(ChapterUploadValidator),
    defaultValues: {
      chapterIndex: 0,
      chapterName: '',
      volume: 1,
      image: undefined,
    },
  });

  const { mutate: upload, isLoading: isChapterUpload } = useMutation({
    mutationFn: async (values: ChapterUploadPayload) => {
      const { chapterIndex, chapterName, image, volume } = values;

      const form = new FormData();
      for (const img of image) {
        const blob = await fetch(img.src).then((res) => res.blob());
        form.append('images', blob, img.name);
      }

      form.append('chapterIndex', `${chapterIndex}`);
      form.append('volume', `${volume}`);
      !!chapterName && form.append('chapterName', chapterName);

      await axios.post(`/api/chapter/${id}`, form, {
        onUploadProgress(progressEvent) {
          const percentCompleted = Math.floor(
            (progressEvent.loaded * 100) / progressEvent.total!
          );
          setUploadProgres(percentCompleted);
        },
      });
    },
    onError: (e) => {
      setUploadProgres(null);

      if (e instanceof AxiosError) {
        if (e.response?.status === 401) return loginToast();
        if (e.response?.status === 404) return notFoundToast();
        if (e.response?.status === 403)
          return toast({
            title: 'Trùng lặp STT',
            description:
              'Đã có chapter trùng lặp STT này rồi. Vui lòng thử lại',
            variant: 'destructive',
          });
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.push(`/mangas/${id}/chapters`);
      router.refresh();
      setUploadProgres(null);

      return successToast();
    },
  });

  const onSubmitHandler = (values: ChapterUploadPayload) => {
    upload(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <ChapterIndexForm form={form} />

        <ChapterNameForm form={form} />

        <ChapterVolumeFormField form={form} />

        <ChapterImageFormField form={form} isUploading={isChapterUpload} />

        {!!uploadProgress &&
          (uploadProgress >= 100 ? (
            <p className="text-center">Đang gửi đến Server...</p>
          ) : (
            <Progress value={uploadProgress} />
          ))}

        <div className="flex flex-wrap justify-end items-center gap-8">
          <Button
            type="button"
            tabIndex={0}
            variant={'destructive'}
            onClick={() => router.back()}
          >
            Quay lại
          </Button>
          <Button
            type="submit"
            tabIndex={1}
            isLoading={isChapterUpload}
            disabled={isChapterUpload}
          >
            Đăng
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ChapterUpload;
