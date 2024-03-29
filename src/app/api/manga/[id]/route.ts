import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const target = await db.manga.findUniqueOrThrow({
      where: {
        id: +context.params.id,
        creatorId: session.user.id,
      },
      select: {
        id: true,
        isPublished: true,
        _count: {
          select: {
            chapter: true,
          },
        },
      },
    });

    if (target._count.chapter < 1)
      return new Response('Must have at least 1 chapter', { status: 406 });
    if (target.isPublished)
      return new Response('Already published', { status: 409 });

    await db.manga.update({
      where: {
        id: target.id,
      },
      data: {
        isPublished: true,
        view: {
          connectOrCreate: {
            where: { mangaId: target.id },
            create: { totalView: 0 },
          },
        },
      },
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}

export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const manga = await db.manga.findUniqueOrThrow({
      where: {
        id: +context.params.id,
        canPin: true,
        isPublished: true,
      },
      select: {
        id: true,
        chapter: {
          where: {
            isPublished: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });

    if (!manga.chapter.length)
      return new Response('Need at least 1 chapter', { status: 406 });

    const currentDate = new Date(Date.now());
    const chapterDate = manga.chapter[0].createdAt;
    chapterDate.setDate(chapterDate.getDate() + 2);

    if (chapterDate.getTime() < currentDate.getTime())
      return new Response('Exceed date', { status: 405 });

    const pinnedManga = await db.mangaPin.findUnique({
      where: {
        mangaId: manga.id,
      },
    });
    if (pinnedManga && pinnedManga.chapterId === manga.chapter[0].id)
      return new Response('Duplicate pin', { status: 409 });

    await db.mangaPin.upsert({
      where: {
        mangaId: manga.id,
      },
      update: {
        chapterId: manga.chapter[0].id,
        createdAt: new Date(Date.now()),
      },
      create: {
        mangaId: manga.id,
        chapterId: manga.chapter[0].id,
      },
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new Response('Not found', { status: 404 });
      }
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
