import { db } from '@/lib/db';
import { FC } from 'react';
import { TabsContent } from '@/components/ui/Tabs';
import Image from 'next/image';
import Link from 'next/link';

interface TeamChapterProps {
  teamId: number;
}

const TeamChapter: FC<TeamChapterProps> = async ({ teamId }) => {
  const mangas = await db.manga.findMany({
    where: {
      chapter: {
        some: { teamId },
      },
      isPublished: true,
    },
    select: {
      id: true,
      slug: true,
      image: true,
      name: true,
      chapter: {
        select: {
          id: true,
          volume: true,
          chapterIndex: true,
          name: true,
          createdAt: true,
        },
      },
    },
  });

  return (
    <TabsContent
      value="chapter"
      className="space-y-10 mt-0 data-[state=active]:mt-2"
    >
      {mangas.map((manga) => (
        <div
          key={manga.id}
          className="grid grid-cols-[.5fr_1fr] lg:grid-cols-[.4fr_1fr] gap-2 lg:gap-4 lg:p-1"
        >
          <Link
            href={`${process.env.MAIN_URL}/manga/${manga.slug}`}
            className="relative block"
            style={{ aspectRatio: 4 / 3 }}
          >
            <Image
              fill
              sizes="30vw"
              quality={40}
              priority
              src={manga.image}
              alt={`${manga.name} Thumbnail`}
              className="object-cover rounded-md"
            />
          </Link>

          <div className="space-y-1">
            <Link
              href={`${process.env.MAIN_URL}/manga/${manga.slug}`}
              className="text-lg lg:text-xl font-semibold"
            >
              {manga.name}
            </Link>

            <ul className="space-y-2 lg:space-y-3 max-h-72 overflow-auto scrollbar dark:scrollbar--dark">
              {manga.chapter.map((chapter) => (
                <li key={chapter.id}>
                  <Link
                    href={`${process.env.MAIN_URL}/chapter/${chapter.id}`}
                    className="block p-1 lg:p-2 rounded-md transition-colors dark:bg-zinc-800 hover:dark:bg-zinc-800/80"
                  >
                    <p>
                      <span>Vol. {chapter.volume}</span>{' '}
                      <span>Ch. {chapter.chapterIndex}</span>
                    </p>
                    {!!chapter.name && (
                      <p className="line-clamp-1"> - {chapter.name}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </TabsContent>
  );
};

export default TeamChapter;
