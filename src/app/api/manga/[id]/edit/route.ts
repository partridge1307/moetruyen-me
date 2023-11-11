import { getAuthSession } from '@/lib/auth';
import { UploadMangaImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { MangaFormValidator } from '@/lib/validators/manga';
import { Prisma } from '@prisma/client';

export async function POST(req: Request, context: { params: { id: string } }) {
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
    if (!!c || typeof c !== 'undefined') {
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
