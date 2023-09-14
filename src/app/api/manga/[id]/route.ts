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
      slug,
      image: img,
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
        image: true,
      },
    });

    let image: string;
    if (img instanceof File) {
      image = await UploadMangaImage(img, targetManga.id, targetManga.image);
    } else {
      image = img;
    }

    const userSlug = slug?.trim() ?? targetManga.slug;

    await db.manga.update({
      where: {
        id: targetManga.id,
      },
      data: {
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
