import { db } from './db';

export type Tags = {
  category: string;
  data: {
    id: number;
    name: string;
    description: string;
  }[];
};

export const tagGroupByCategory = () =>
  db.$queryRaw`SELECT "category", array_agg(json_build_object('id', "id", 'name', "name", 'description', "description")) AS data FROM "Tag" GROUP BY "category"` as Promise<
    Tags[]
  >;

export type View = {
  time: number;
  view: number;
  viewTimeCreatedAt: Date[];
}[];
export const dailyViewGroupByHour = (mangaId: number) =>
  db.$queryRaw`SELECT DATE_PART('hour', "createdAt") as time, COUNT("id") as view, array_agg("createdAt") as "viewTimeCreatedAt" FROM "DailyView" WHERE "mangaId" = ${mangaId} GROUP BY DATE_PART('hour', "createdAt")` as Promise<View>;

export const weeklyViewGroupByDay = (mangaId: number) =>
  db.$queryRaw`SELECT DATE_PART('day', "createdAt") as time, COUNT("id") as view, array_agg("createdAt") as "viewTimeCreatedAt" FROM "WeeklyView" WHERE "mangaId" = ${mangaId} GROUP BY DATE_PART('day', "createdAt")` as Promise<View>;
