import { db } from '@/lib/db';
import type { Team } from '@prisma/client';
import { FC } from 'react';
import MangaInfo from './Manga';

interface MangaProps {
  team: Pick<Team, 'id'>;
}

const Manga: FC<MangaProps> = async ({ team }) => {
  const chapter = await db.chapter.findMany({
    distinct: ['mangaId'],
    where: {
      teamId: team.id,
    },
    take: 10,
    select: {
      id: true,
      manga: {
        select: {
          slug: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return (
    <MangaInfo
      initialContent={{
        data: chapter.map(({ manga }) => manga),
        lastCursor:
          chapter.length === 10 ? chapter[chapter.length - 1].id : undefined,
      }}
    />
  );
};

export default Manga;
