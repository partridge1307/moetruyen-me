import { buttonVariants } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { cn, formatTimeToNow } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowUpRightFromCircle,
  Edit,
  Info,
  LayoutList,
  LineChart,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FC } from 'react';

const MTEditor = dynamic(
  () => import('@/components/Editor/MoetruyenEditorOutput'),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 rounded-md animate-pulse dark:bg-zinc-900" />
    ),
  }
);
const Chart = dynamic(() => import('@/components/Chart'));

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
      slug: true,
      name: true,
      image: true,
      description: true,
      facebookLink: true,
      discordLink: true,
      isPublished: true,
      review: true,
      updatedAt: true,
      createdAt: true,
      _count: {
        select: {
          chapter: true,
        },
      },
    },
  });
  if (!manga) return notFound();

  return (
    <main className="container lg:w-3/4 mb-10 space-y-4">
      <Link
        href="/mangas"
        className={cn(buttonVariants({ variant: 'link' }), 'px-0 space-x-2')}
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Quay lại</span>
      </Link>

      <section className="p-3 rounded-md dark:bg-zinc-900/60">
        <Tabs defaultValue="info">
          <TabsList className="grid grid-cols-2 gap-4 dark:bg-zinc-800">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="w-5 h-5" /> Thông tin
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <LineChart className="w-5 h-5" /> Thống kê
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="thumbnail" className="text-lg font-medium">
                Ảnh bìa
              </label>
              <div
                id="thumbnail"
                className="relative"
                style={{ aspectRatio: 4 / 3 }}
              >
                <Image
                  fill
                  sizes="(max-width: 640px) 40vw, 60vw"
                  quality={40}
                  priority
                  src={manga.image}
                  alt={`${manga.name} Thumbnail`}
                  className="object-cover rounded-md"
                />
              </div>
            </div>

            <div>
              <label htmlFor="name" className="text-lg font-medium">
                Tên truyện
              </label>
              <h1 id="name" className="text-lg lg:text-xl font-semibold">
                {manga.name}
              </h1>
            </div>

            <dl className="flex items-center gap-2">
              <dt>Trạng thái:</dt>
              <dd>
                {manga.isPublished ? (
                  <span className="font-semibold text-green-400">Đã đăng</span>
                ) : (
                  <span className="font-semibold text-red-400">Chờ đăng</span>
                )}
              </dd>
            </dl>

            <div className="flex flex-wrap justify-between items-center">
              <dl className="flex items-center gap-2">
                <dt>Slug:</dt>
                <dd>{manga.slug}</dd>
              </dl>
              <dl className="flex items-center gap-2">
                <dt>{manga._count.chapter}</dt>
                <dd>Chapter</dd>
              </dl>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <Link
                href={`/mangas/${manga.id}/edit`}
                className={cn(buttonVariants(), 'gap-2 max-sm:col-span-2')}
              >
                <Edit className="w-5 h-5" />
                Chỉnh sửa
              </Link>
              <a
                href={`${process.env.MAIN_URL}/manga/${manga.slug}`}
                target="_blank"
                className={cn(buttonVariants(), 'gap-2')}
              >
                <ArrowUpRightFromCircle className="w-5 h-5" /> Manga
              </a>
              <Link
                href={`/mangas/${manga.id}/chapters`}
                className={cn(buttonVariants(), 'gap-2')}
              >
                <LayoutList className="w-5 h-5" /> Chapter
              </Link>
            </div>

            <div className="space-y-1">
              <label htmlFor="description" className="text-lg font-medium">
                Mô tả
              </label>
              <div id="description" className="p-1 rounded-md dark:bg-zinc-700">
                <MTEditor id={manga.id} content={manga.description} />
              </div>
            </div>

            <div>
              <label htmlFor="review" className="text-lg font-medium">
                Sơ lược
              </label>
              <p id="review" className="p-1 rounded-md dark:bg-zinc-700">
                {manga.review}
              </p>
            </div>

            {!!manga.discordLink ||
              (!!manga.facebookLink && (
                <div className="flex flex-wrap justify-between items-center">
                  {!!manga.facebookLink && (
                    <dl className="flex items-center gap-2">
                      <dt>FACEBOOK:</dt>
                      <dd>
                        <a
                          target="_blank"
                          href={manga.facebookLink}
                          className="text-blue-500"
                        >
                          LINK
                        </a>
                      </dd>
                    </dl>
                  )}

                  {!!manga.discordLink && (
                    <dl className="flex items-center gap-2">
                      <dt>DISCORD:</dt>
                      <dd>
                        <a
                          target="_blank"
                          href="_blank"
                          className="text-blue-500"
                        >
                          LINK
                        </a>
                      </dd>
                    </dl>
                  )}
                </div>
              ))}

            <div className="flex flex-wrap justify-between items-center">
              <dl className="flex items-center gap-2">
                <dt>Ngày tạo:</dt>
                <dd>
                  <time dateTime={manga.createdAt.toDateString()}>
                    {formatTimeToNow(new Date(manga.createdAt))}
                  </time>
                </dd>
              </dl>

              <dl className="flex items-center gap-2">
                <dt>Chỉnh lần cuối:</dt>
                <dd>
                  <time dateTime={manga.updatedAt.toDateString()}>
                    {formatTimeToNow(new Date(manga.updatedAt))}
                  </time>
                </dd>
              </dl>
            </div>
          </TabsContent>

          <Chart manga={manga} />
        </Tabs>
      </section>
    </main>
  );
};

export default page;
