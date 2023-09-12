import ChapterUploadRules from '@/components/Rules/ChapterUploadRules';
import ChapterUploadSkeleton from '@/components/Skeleton/ChapterUploadSkeleton';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';

const ChapterUpload = dynamic(() => import('@/components/Upload/Chapter'), {
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

  const manga = await db.manga.findUnique({
    where: {
      id: +params.id,
      creatorId: session.user.id,
    },
    select: {
      id: true,
    },
  });
  if (!manga) return notFound();

  return (
    <main className="container lg:w-4/5 p-1 space-y-10 mb-10">
      <section className="p-3 rounded-md dark:bg-zinc-900/60">
        <ChapterUpload id={manga.id} />
      </section>

      <ChapterUploadRules />
    </main>
  );
};

export default page;
