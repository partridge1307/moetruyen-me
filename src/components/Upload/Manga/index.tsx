'use client';

import { Button } from '@/components/ui/Button';
import { Form } from '@/components/ui/Form';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { Tags } from '@/lib/query';
import {
  MangaUploadPayload,
  MangaUploadValidator,
} from '@/lib/validators/manga';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import MangaAltNameForm from './MangaAltNameFormField';
import MangaDescForm from './MangaDescFormField';
import MangaDiscForm from './MangaDiscFormField';
import MangaFBForm from './MangaFBFormField';
import MangaImageForm from './MangaImageFormField';
import MangaNameForm from './MangaNameFormField';
import MangaReviewForm from './MangaReviewFormField';
import MangaSlugForm from './MangaSlugFormField';
import MangaTagSkeleton from '@/components/Skeleton/MangaTagSkeleton';
import MangaAuthorSkeleton from '@/components/Skeleton/MangaAuthorSkeleton';

const MangaTagForm = dynamic(() => import('./MangaTagFormField'), {
  ssr: false,
  loading: () => <MangaTagSkeleton />,
});
const MangaAuthorForm = dynamic(() => import('./MangaAuthorFormField'), {
  ssr: false,
  loading: () => <MangaAuthorSkeleton />,
});

const MangaUpload = ({ tag }: { tag: Tags[] }) => {
  const router = useRouter();
  const {
    notFoundToast,
    loginToast,
    serverErrorToast,
    successToast,
    verifyToast,
  } = useCustomToast();

  const form = useForm<MangaUploadPayload>({
    resolver: zodResolver(MangaUploadValidator),
    defaultValues: {
      image: undefined,
      name: '',
      description: undefined,
      review: '',
      altName: '',
      author: [],
      tag: [],
      facebookLink: '',
      discordLink: '',
    },
  });

  const { mutate: Upload, isLoading: isUploadManga } = useMutation({
    mutationKey: ['upload-manga'],
    mutationFn: async (values: MangaUploadPayload) => {
      const {
        image,
        name,
        slug,
        description,
        review,
        altName,
        author,
        tag,
        facebookLink,
        discordLink,
      } = values;

      const form = new FormData();

      const blob = await fetch(image).then((res) => res.blob());
      form.append('image', blob);

      form.append('name', name);
      !!slug && form.append('slug', slug);
      form.append('description', JSON.stringify(description));
      form.append('review', review);
      altName && form.append('altName', altName);
      facebookLink && form.append('facebookLink', facebookLink);
      discordLink && form.append('discordLink', discordLink);
      author.map((a) => form.append('author', JSON.stringify(a)));
      tag.map((t) => form.append('tag', JSON.stringify(t)));

      const { data } = await axios.post('/api/manga', form);

      return data;
    },
    onError: (e) => {
      if (e instanceof AxiosError) {
        if (e.response?.status === 409)
          return toast({
            title: 'Trùng lặp manga',
            description: 'Bạn đã tạo manga này rồi',
            variant: 'destructive',
          });
        if (e.response?.status === 401) return loginToast();
        if (e.response?.status === 404) return notFoundToast();
        if (e.response?.status === 400) return verifyToast();
        if (e.response?.status === 406)
          return toast({
            title: 'Slug không hợp lệ',
            description: 'Slug đã tồn tại',
            variant: 'destructive',
          });
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.push('/mangas');
      router.refresh();

      return successToast();
    },
  });

  const onSubmitHandler = (values: MangaUploadPayload) => {
    Upload(values);
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitHandler)}
          className="space-y-6"
        >
          <MangaImageForm form={form} />

          <MangaNameForm form={form} />

          <MangaSlugForm form={form} />

          <MangaAltNameForm form={form} />

          <MangaAuthorForm form={form} />

          <MangaTagForm form={form} tag={tag} />

          <MangaDescForm form={form} />

          <MangaReviewForm form={form} />

          <MangaFBForm form={form} />

          <MangaDiscForm form={form} />

          <Button
            type="submit"
            isLoading={isUploadManga}
            disabled={isUploadManga}
            className="w-full"
          >
            Đăng
          </Button>
        </form>
      </Form>
    </>
  );
};

export default MangaUpload;
