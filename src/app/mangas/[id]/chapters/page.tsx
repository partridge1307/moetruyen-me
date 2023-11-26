import PublishAllButton from '@/components/Chapter/PublishAllButton';
import TableSkeleton from '@/components/Skeleton/TableSkeleton';
import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { ArrowLeft, UploadCloud } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';

const ChapterTable = dynamic(() => import('@/components/Table/Chapter'), {
  ssr: false,
  loading: () => <TableSkeleton />,
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
      name: true,
      chapter: {
        select: {
          id: true,
          volume: true,
          chapterIndex: true,
          name: true,
          images: true,
          isPublished: true,
          mangaId: true,
          progress: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!manga) return notFound();

  return (
    <main className="container max-sm:px-2 mb-10 space-y-5">
      <section className="space-y-0.5">
        <Link
          href="/mangas"
          className={cn(buttonVariants({ variant: 'link' }), 'px-0 space-x-2')}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </Link>

        <h1 className="text-2xl font-semibold">{manga.name}</h1>
      </section>

      <section className="p-3 rounded-md dark:bg-zinc-900/60">
        {!manga.chapter.length && (
          <div className="h-96 flex flex-col space-y-2 justify-center items-center">
            <p className="text-center">
              Bạn chưa có Chapter nào. Hãy upload Chapter ngay thôi nhé
            </p>
            <Link
              href={`/chapters/${params.id}/upload`}
              className={cn(buttonVariants(), 'space-x-2')}
            >
              <UploadCloud className="w-5 h-5" />
              <span>Thêm chapter</span>
            </Link>
          </div>
        )}

        {!!manga.chapter.length && (
          <div className="flex flex-col">
            <div className="self-end flex items-center space-x-6">
              <PublishAllButton mangaId={+params.id} />
              <Link
                href={`/chapters/${params.id}/upload`}
                className={cn(buttonVariants(), 'space-x-2')}
              >
                <UploadCloud className="w-5 h-5" />
                <span>Thêm chapter</span>
              </Link>
            </div>

            <ChapterTable
              data={manga.chapter.sort(
                (a, b) => b.chapterIndex - a.chapterIndex
              )}
            />
          </div>
        )}
      </section>
    </main>
  );
};

export default page;
