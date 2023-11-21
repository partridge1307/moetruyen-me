import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { TeamInfiniteQueryValidator } from '@/lib/validators/team';
import { Prisma } from '@prisma/client';

const getMangas = ({ teamId, cursor }: { teamId: number; cursor?: number }) => {
  const paginationProps: Prisma.ChapterFindManyArgs = {};

  if (!!cursor) {
    paginationProps.skip = 1;
    paginationProps.cursor = {
      id: cursor,
    };
  }

  return db.chapter.findMany({
    ...paginationProps,
    distinct: ['mangaId'],
    where: {
      teamId,
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
};

export async function GET(req: Request) {
  const url = new URL(req.url);

  try {
    const { cursor: userCursor } = TeamInfiniteQueryValidator.parse({
      cursor: url.searchParams.get('cursor'),
    });

    const cursor = userCursor ? parseInt(userCursor) : undefined;

    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const user = await db.user.findUniqueOrThrow({
      where: {
        id: session.user.id,
      },
      select: {
        teamId: true,
      },
    });
    if (!user.teamId) return new Response('Not found', { status: 404 });

    const chapter = await getMangas({ teamId: user.teamId, cursor });

    return new Response(
      JSON.stringify({
        data: chapter.map(({ manga }) => manga),
        lastCursor:
          chapter.length === 10 ? chapter[chapter.length - 1].id : undefined,
      })
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025')
        return new Response('Not found', { status: 404 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}
