import { getAuthSession } from '@/lib/auth';
import { UploadMangaImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { normalizeText } from '@/lib/utils';
import { MangaFormValidator } from '@/lib/validators/manga';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { ZodError } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const [user, existedManga] = await db.$transaction([
      db.user.findUniqueOrThrow({
        where: {
          id: session.user.id,
        },
        select: {
          id: true,
          verified: true,
        },
      }),
      db.manga.findFirst({
        where: {
          creatorId: session.user.id,
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (!user.verified && existedManga)
      return new Response('Need verify', { status: 400 });

    const {
      cover: c,
      image: img,
      name,
      slug,
      description,
      review,
      altName,
      author,
      tag,
      facebookLink,
      discordLink,
    } = MangaFormValidator.parse(await req.formData());

    if (slug && (await db.manga.findUnique({ where: { slug } }))) {
      return new Response('Existing Slug', { status: 406 });
    }

    const mangaCreated = await db.manga.create({
      data: {
        name,
        slug: randomUUID(),
        // @ts-ignore
        description,
        review,
        image: '',
        altName,
        facebookLink: !facebookLink ? null : facebookLink,
        discordLink: !discordLink ? null : discordLink,
        creatorId: user.id,
        tags: {
          connect: tag.map((t) => ({
            id: t.id,
          })),
        },
        author: {
          connectOrCreate: author.map((a) => ({
            where: { id: a.id },
            create: { name: a.name },
          })),
        },
      },
    });

    let coverPromise, imagePromise;
    if (!!c) {
      if (c instanceof File) {
        coverPromise = UploadMangaImage(c, mangaCreated.id, null, 'cover');
      } else coverPromise = c;
    }

    if (img instanceof File) {
      imagePromise = UploadMangaImage(img, mangaCreated.id, null, 'thumbnail');
    } else {
      imagePromise = img;
    }

    const [cover, image] = await Promise.all([coverPromise, imagePromise]);

    await db.manga.update({
      where: {
        id: mangaCreated.id,
      },
      data: {
        cover,
        image,
        slug:
          slug?.trim() ??
          `${normalizeText(mangaCreated.name)
            .toLowerCase()
            .slice(0, 32)
            .trim()
            .split(' ')
            .join('-')}-${mangaCreated.id}`,
      },
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(error.message, { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new Response('Duplicated manga', { status: 409 });
      }
      if (error.code === 'P2025') {
        return new Response('Not found', { status: 404 });
      }
    }
    return new Response('Something went wrong', { status: 500 });
  }
}
