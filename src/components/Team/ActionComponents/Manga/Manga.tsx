'use client';

import MangaImage from '@/components/Manga/MangaImage';
import { TabsContent } from '@/components/ui/Tabs';
import { useTeamInfo } from '@/hooks/use-team-info';
import { useIntersection } from '@mantine/hooks';
import type { Manga } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { FC, useEffect, useRef } from 'react';

type TManga = Pick<Manga, 'image' | 'name' | 'slug'>;

interface MangaInfoProps {
  initialContent: {
    data: TManga[];
    lastCursor?: number;
  };
}

const MangaInfo: FC<MangaInfoProps> = ({ initialContent }) => {
  const lastMangaRef = useRef(null);
  const { ref, entry } = useIntersection({
    root: lastMangaRef.current,
    threshold: 1,
  });

  const { data, query } = useTeamInfo<TManga>({
    initialContent,
    type: 'manga',
  });

  useEffect(() => {
    if (entry?.isIntersecting && query.hasNextPage) {
      query.fetchNextPage();
    }
  }, [entry?.isIntersecting, query]);

  return (
    <TabsContent
      value="manga"
      forceMount
      className="data-[state=inactive]:hidden p-2 pb-10 rounded-t-md bg-background/30"
    >
      {!data.length && <p>Team chưa có Manga</p>}

      <div className="grid md:grid-cols-4 gap-6">
        {data.map((manga, index) => {
          if (index === data.length - 1)
            return (
              <a
                ref={ref}
                key={`${manga.slug}-${index}`}
                href={`${process.env.NEXT_PUBLIC_IMG_DOMAIN}/manga/${manga.slug}`}
                className="block space-y-2 p-2 rounded-md transition-colors hover:bg-primary-foreground"
              >
                <MangaImage manga={manga} />
                <p className="text-xl font-semibold line-clamp-2">
                  {manga.name}
                </p>
              </a>
            );
          else
            return (
              <a
                key={`${manga.slug}-${index}`}
                href={`${process.env.NEXT_PUBLIC_IMG_DOMAIN}/manga/${manga.slug}`}
                className="block space-y-2 p-2 rounded-md transition-colors hover:bg-primary-foreground"
              >
                <MangaImage manga={manga} />
                <p className="text-xl font-semibold line-clamp-2">
                  {manga.name}
                </p>
              </a>
            );
        })}
      </div>

      {query.isFetchingNextPage && (
        <Loader2 className="w-10 h-10 animate-spin" />
      )}
    </TabsContent>
  );
};

export default MangaInfo;
