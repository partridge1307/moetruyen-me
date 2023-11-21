import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useMemo } from 'react';

export enum InfoEnum {
  manga = 'manga',
  chapter = 'chapter',
}

type infoProps<TData> = {
  initialContent: {
    data: TData[];
    lastCursor?: number;
  };
  type: keyof typeof InfoEnum;
};

export const useTeamInfo = <TData>({
  initialContent,
  type,
}: infoProps<TData>) => {
  const query = useInfiniteQuery({
    queryKey: ['team-infinite-query', type],
    queryFn: async ({ pageParam }) => {
      let query = `/api/team/info/${type}`;

      if (!!pageParam) {
        query = `${query}?cursor=${pageParam}`;
      }

      const { data } = await axios.get(query);
      return data as { data: TData[]; lastCursor?: number };
    },
    getNextPageParam: (lastPage) => lastPage.lastCursor ?? null,
    initialData: {
      pages: [initialContent],
      pageParams: [initialContent.lastCursor],
    },
  });

  const data = useMemo(() => {
    return (
      query.data?.pages.flatMap((page) => page.data) ?? initialContent.data
    );
  }, [initialContent.data, query.data?.pages]);

  return {
    data,
    query,
  };
};
