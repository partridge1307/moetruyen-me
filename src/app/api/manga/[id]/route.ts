import { getAuthSession } from '@/lib/auth';
import { UploadMangaImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { MangaFormValidator } from '@/lib/validators/manga';
import { Prisma } from '@prisma/client';

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const {
      cover: c,
      image: img,
      slug,
      name,
      description,
      review,
      altName,
      author,
      tag,
      facebookLink,
      discordLink,
    } = MangaFormValidator.parse(await req.formData());

    const targetManga = await db.manga.findUniqueOrThrow({
      where: {
        id: +context.params.id,
        creatorId: session.user.id,
      },
      select: {
        id: true,
        slug: true,
        cover: true,
        image: true,
      },
    });

    let coverPromise, imagePromise;
    if (c) {
      if (c instanceof File) {
        coverPromise = UploadMangaImage(
          c,
          targetManga.id,
          targetManga.cover,
          'cover'
        );
      } else coverPromise = c;
    }

    if (img instanceof File) {
      imagePromise = UploadMangaImage(
        img,
        targetManga.id,
        targetManga.image,
        'thumbnail'
      );
    } else {
      imagePromise = img;
    }

    const [cover, image] = await Promise.all([coverPromise, imagePromise]);

    const userSlug = slug?.trim() ?? targetManga.slug;

    await db.manga.update({
      where: {
        id: targetManga.id,
      },
      data: {
        cover,
        image,
        slug: userSlug,
        name,
        description: { ...description },
        review,
        altName,
        facebookLink: !facebookLink ? null : facebookLink,
        discordLink: !discordLink ? null : discordLink,
        tags: {
          connect: tag.map((t) => ({ id: t.id })),
        },
        author: {
          connectOrCreate: author.map((a) => ({
            where: { id: a.id },
            create: { name: a.name },
          })),
        },
      },
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new Response('Not found', { status: 404 });
      }
      if (error.code === 'P2002') {
        return new Response('Existing Slug', { status: 406 });
      }
    }

    return new Response('Something went wrong', { status: 500 });
  }
}

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
