import { db } from '@/lib/db';
import { dailyViewGroupByHour, weeklyViewGroupByDay } from '@/lib/query';
import { filterView } from '@/lib/utils';
import type { Manga } from '@prisma/client';
import { FC } from 'react';
import { getDay, getHours } from 'date-fns';
import { TabsContent } from '@/components/ui/Tabs';
import dynamic from 'next/dynamic';

const DailyView = dynamic(() => import('@/components/Chart/Daily'), {
  ssr: false,
});
const WeeklyView = dynamic(() => import('@/components/Chart/Weekly'), {
  ssr: false,
});

interface indexProps {
  manga: Pick<Manga, 'id'>;
}

const index: FC<indexProps> = async ({ manga }) => {
  const {
    filteredDailyView,
    filteredWeeklyView,
    highestDailyView,
    highestWeeklyView,
  } = await Promise.all([
    dailyViewGroupByHour(manga.id),
    weeklyViewGroupByDay(manga.id),
    db.chapter.findFirst({
      where: {
        mangaId: manga.id,
      },
      orderBy: {
        dailyView: {
          _count: 'desc',
        },
      },
      select: {
        _count: {
          select: {
            dailyView: true,
          },
        },
        chapterIndex: true,
        volume: true,
        name: true,
      },
    }),
    db.chapter.findFirst({
      where: {
        mangaId: manga.id,
      },
      orderBy: {
        weeklyView: {
          _count: 'desc',
        },
      },
      select: {
        _count: {
          select: {
            weeklyView: true,
          },
        },
        chapterIndex: true,
        volume: true,
        name: true,
      },
    }),
  ]).then(([dailyView, weeklyView, highestDailyView, highestWeeklyView]) => {
    const filteredDailyView = filterView({
      target: dailyView.map((dv) => ({
        time: getHours(dv.viewTimeCreatedAt[0]),
        view: dv.view,
      })),
      timeRange: [0, 1, 3, 6, 12, 22],
      currentTime: new Date(Date.now()).getHours(),
    });
    const filteredWeeklyView = filterView({
      target: weeklyView.map((wv) => ({
        time: getDay(wv.viewTimeCreatedAt[0]),
        view: wv.view,
      })),
      timeRange: [0, 1, 3, 5, 7],
      currentTime: new Date(Date.now()).getDay(),
    });

    return {
      filteredDailyView,
      filteredWeeklyView,
      highestDailyView,
      highestWeeklyView,
    };
  });

  return (
    <TabsContent value="analytics" className="space-y-10">
      <div className="space-y-4">
        <label htmlFor="daily" className="text-lg lg:text-xl font-semibold">
          Ngày
        </label>

        <div id="daily" className="space-y-6">
          {!!highestDailyView && (
            <div className="space-y-1">
              <label htmlFor="highestDailyView">
                Chapter nhiều lượt xem nhất
              </label>
              <dl
                id="highestDailyView"
                className="p-2 rounded-md dark:bg-orange-700"
              >
                <dt className="flex items-center gap-2">
                  <p className="flex items-center gap-1">
                    <span>Vol.</span> {highestDailyView.volume}
                    <span>Ch.</span> {highestDailyView.chapterIndex}
                  </p>
                  {!!highestDailyView.name && <p>{highestDailyView.name}</p>}
                </dt>
                <dd className="text-sm">
                  {highestDailyView._count.dailyView} Lượt xem
                </dd>
              </dl>
            </div>
          )}

          <div className="space-y-1">
            <p>Biểu đồ</p>
            <DailyView filteredView={filteredDailyView} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label htmlFor="weekly" className="text-lg lg:text-xl font-semibold">
          Tuần
        </label>

        <div id="weekly" className="space-y-6">
          {!!highestWeeklyView && (
            <div className="space-y-1">
              <label htmlFor="highestWeeklyView">
                Chapter nhiều lượt xem nhất
              </label>
              <dl
                id="highestWeeklyView"
                className="p-2 rounded-md dark:bg-orange-700"
              >
                <dt className="flex items-center gap-2">
                  <p className="flex items-center gap-1">
                    <span>Vol.</span> {highestWeeklyView.volume}
                    <span>Ch.</span> {highestWeeklyView.chapterIndex}
                  </p>
                  {!!highestWeeklyView.name && <p>{highestWeeklyView.name}</p>}
                </dt>
                <dd className="text-sm">
                  {highestWeeklyView._count.weeklyView} Lượt xem
                </dd>
              </dl>
            </div>
          )}

          <div className="space-y-1">
            <p>Biểu đồ</p>
            <WeeklyView filteredView={filteredWeeklyView} />
          </div>
        </div>
      </div>
    </TabsContent>
  );
};

export default index;
