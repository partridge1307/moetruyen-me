'use client';

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
import { Button } from '@/components/ui/Button';
import { Form } from '@/components/ui/Form';
import MangaAltNameForm from './MangaAltNameFormField';
import MangaDescForm from './MangaDescFormField';
import MangaDiscForm from './MangaDiscFormField';
import MangaFBForm from './MangaFBFormField';
import MangaNameForm from './MangaNameFormField';
import MangaReviewForm from './MangaReviewFormField';
import MangaImageFormField from './MangaImageFormField';
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

interface EditMangaProps {
  manga: Pick<
    Manga,
    | 'id'
    | 'slug'
    | 'name'
    | 'altName'
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
      slug: manga.slug,
      name: manga.name,
      altName: manga.altName ?? '',
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

      slug && form.append('slug', slug);

      if (image.startsWith('blob')) {
        const blob = await fetch(image).then((res) => res.blob());
        form.append('image', blob);
      } else {
        form.append('image', image);
      }

      form.append('name', name);
      form.append('description', JSON.stringify(description));
      form.append('review', review);
      altName && form.append('altName', altName);
      facebookLink && form.append('facebookLink', facebookLink);
      discordLink && form.append('discordLink', discordLink);
      author.map((a) => form.append('author', JSON.stringify(a)));
      tag.map((t) => form.append('tag', JSON.stringify(t)));

      const { data } = await axios.patch(`/api/manga/${manga.id}`, form);

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

        <Button
          type="submit"
          isLoading={isUpdatingManga}
          disabled={isUpdatingManga}
          className="w-full"
        >
          Cập nhật
        </Button>
      </form>
    </Form>
  );
};

export default EditManga;
