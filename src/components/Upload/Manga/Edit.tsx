'use client';

import MangaAuthorSkeleton from '@/components/Skeleton/MangaAuthorSkeleton';
import MangaCoverSkeleton from '@/components/Skeleton/MangaCoverSkeleton';
import MangaImageSkeleton from '@/components/Skeleton/MangaImageSkeleton';
import MangaTagSkeleton from '@/components/Skeleton/MangaTagSkeleton';
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
import { Manga, MangaAuthor, Tag } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import MangaAltNameForm from './MangaAltNameFormField';
import MangaDescForm from './MangaDescFormField';
import MangaDiscForm from './MangaDiscFormField';
import MangaFBForm from './MangaFBFormField';
import MangaNameForm from './MangaNameFormField';
import MangaReviewForm from './MangaReviewFormField';
import MangaSlugForm from './MangaSlugFormField';

const MangaCoverFormField = dynamic(() => import('./MangaCoverFormField'), {
  ssr: false,
  loading: () => <MangaCoverSkeleton />,
});
const MangaImageFormField = dynamic(() => import('./MangaImageFormField'), {
  ssr: false,
  loading: () => <MangaImageSkeleton />,
});
const MangaTagForm = dynamic(() => import('./MangaTagFormField'), {
  ssr: false,
  loading: () => <MangaTagSkeleton />,
});
const MangaAuthorForm = dynamic(() => import('./MangaAuthorFormField'), {
  ssr: false,
  loading: () => <MangaAuthorSkeleton />,
});

interface EditMangaProps {
  manga: Pick<
    Manga,
    | 'id'
    | 'slug'
    | 'name'
    | 'altName'
    | 'cover'
    | 'image'
    | 'description'
    | 'review'
    | 'facebookLink'
    | 'discordLink'
  > & {
    author: MangaAuthor[];
    tags: Tag[];
  };
  tags: Tags[];
}

const EditManga: FC<EditMangaProps> = ({ manga, tags }) => {
  const { loginToast, notFoundToast, successToast, serverErrorToast } =
    useCustomToast();
  const router = useRouter();

  const form = useForm<MangaUploadPayload>({
    resolver: zodResolver(MangaUploadValidator),
    defaultValues: {
      cover: manga.cover ?? undefined,
      slug: manga.slug,
      name: manga.name,
      altName: manga.altName ?? [],
      image: manga.image,
      author: manga.author,
      tag: manga.tags,
      description: undefined,
      review: manga.review ?? '',
      facebookLink: manga.facebookLink ?? '',
      discordLink: manga.discordLink ?? '',
    },
  });

  const { mutate: Update, isLoading: isUpdatingManga } = useMutation({
    mutationFn: async (values: MangaUploadPayload) => {
      const {
        slug,
        cover,
        image,
        name,
        description,
        review,
        altName,
        author,
        tag,
        facebookLink,
        discordLink,
      } = values;

      const form = new FormData();

      if (!!cover) {
        if (cover.startsWith('blob')) {
          const blob = await fetch(cover).then((res) => res.blob());
          form.append('cover', blob);
        } else {
          form.append('cover', cover);
        }
      }

      if (image.startsWith('blob')) {
        const blob = await fetch(image).then((res) => res.blob());
        form.append('image', blob);
      } else {
        form.append('image', image);
      }

      !!slug && form.append('slug', slug);

      form.append('name', name);
      form.append('review', review);
      facebookLink && form.append('facebookLink', facebookLink);
      discordLink && form.append('discordLink', discordLink);

      form.append('description', JSON.stringify(description));

      altName.map((name) => form.append('altName', name));
      author.map((a) => form.append('author', JSON.stringify(a)));
      tag.map((t) => form.append('tag', JSON.stringify(t)));

      const { data } = await axios.post(`/api/manga/${manga.id}/edit`, form);

      return data;
    },
    onError: (e) => {
      if (e instanceof AxiosError) {
        if (e.response?.status === 401) return loginToast();
        if (e.response?.status === 404) return notFoundToast();
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
      router.push(`/mangas/${manga.id}`);
      router.refresh();

      return successToast();
    },
  });

  function onSubmitHandler(values: MangaUploadPayload) {
    const payload: MangaUploadPayload = {
      ...values,
      description: values.description ?? manga.description,
    };

    Update(payload);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <MangaCoverFormField form={form} />

        <MangaImageFormField form={form} />

        <MangaNameForm form={form} />

        <MangaSlugForm form={form} />

        <MangaAltNameForm form={form} />

        <MangaAuthorForm form={form} existAuthors={manga.author} />

        <MangaTagForm form={form} tag={tags} existTags={manga.tags} />

        <MangaDescForm form={form} initialContent={manga.description} />

        <MangaReviewForm form={form} />

        <MangaFBForm form={form} />

        <MangaDiscForm form={form} />

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
            isLoading={isUpdatingManga}
            disabled={isUpdatingManga}
          >
            Cập nhật
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditManga;
