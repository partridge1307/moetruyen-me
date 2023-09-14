import MangaUploadRules from '@/components/Rules/MangaUploadRules';
import MangaUploadSkeleton from '@/components/Skeleton/MangaUploadSkeleton';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { tagGroupByCategory } from '@/lib/query';
import dynamic from 'next/dynamic';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';

const EditManga = dynamic(() => import('@/components/Upload/Manga/Edit'), {
  ssr: false,
  loading: () => <MangaUploadSkeleton />,
});

interface pageProps {
  params: {
    id: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const sesison = await getAuthSession();
  if (!sesison) return redirect(`${process.env.MAIN_URL}/sign-in`);

  const [manga, tags] = await Promise.all([
    db.manga.findUnique({
      where: {
        id: +params.id,
        creatorId: sesison.user.id,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        altName: true,
        image: true,
        author: true,
        tags: true,
        description: true,
        review: true,
        facebookLink: true,
        discordLink: true,
      },
    }),
    tagGroupByCategory(),
  ]);
  if (!manga) return notFound();

  return (
    <main className="container lg:w-2/3 p-1 mb-10 space-y-10">
      <section className="p-3 rounded-md dark:bg-zinc-900/60">
        <EditManga manga={manga} tags={tags} />
      </section>

      <MangaUploadRules />
    </main>
  );
};

export default page;
