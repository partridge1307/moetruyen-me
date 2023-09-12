import { db } from '@/lib/db';
import { FC } from 'react';
import { TabsContent } from '@/components/ui/Tabs';
import Link from 'next/link';
import Image from 'next/image';

interface TeamMangaProps {
  teamId: number;
}

const TeamManga: FC<TeamMangaProps> = async ({ teamId }) => {
  const chapters = await db.chapter.findMany({
    distinct: ['mangaId'],
    where: {
      teamId,
      isPublished: true,
    },
    select: {
      manga: {
        select: {
          id: true,
          slug: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return (
    <TabsContent
      value="manga"
      className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-0 data-[state=active]:mt-2"
    >
      {chapters.map((chapter) => (
        <Link
          key={chapter.manga.id}
          href={`${process.env.MAIN_URL}/manga/${chapter.manga.slug}`}
        >
          <div className="relative" style={{ aspectRatio: 4 / 3 }}>
            <Image
              fill
              sizes="30vw"
              quality={40}
              priority
              src={chapter.manga.image}
              alt={`${chapter.manga.name} Thumbnail`}
              className="object-cover rounded-md"
            />
            <div className="absolute inset-0 flex justify-center items-end lg:items-center transition-opacity lg:opacity-0 lg:hover:opacity-100 dark:bg-zinc-900/50">
              <p className="lg:text-lg font-semibold max-sm:line-clamp-1">
                {chapter.manga.name}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </TabsContent>
  );
};

export default TeamManga;
