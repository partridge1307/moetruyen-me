import ChapterUploadRules from '@/components/Rules/ChapterUploadRules';
import ChapterUploadSkeleton from '@/components/Skeleton/ChapterUploadSkeleton';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';

const ChapterEdit = dynamic(() => import('@/components/Upload/Chapter/Edit'), {
  ssr: false,
  loading: () => <ChapterUploadSkeleton />,
});

interface pageProps {
  params: {
    id: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const session = await getAuthSession();
  if (!session) return redirect(`${process.env.MAIN_URL}/sign-in`);

  const chapter = await db.chapter.findUnique({
    where: {
      id: +params.id,
      manga: {
        creatorId: session.user.id,
      },
    },
    select: {
      id: true,
      name: true,
      volume: true,
      chapterIndex: true,
      images: true,
      mangaId: true,
    },
  });
  if (!chapter) return notFound();

  return (
    <main className="container lg:w-4/5 p-1 space-y-10 mb-10">
      <section className="p-3 rounded-md dark:bg-zinc-900/60">
        <ChapterEdit chapter={chapter} />
      </section>

      <ChapterUploadRules />
    </main>
  );
};

export default page;
