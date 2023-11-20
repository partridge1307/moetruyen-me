import { getAuthSession } from '@/lib/auth';
import { EditChapterImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { ChapterFormEditValidator } from '@/lib/validators/chapter';
import { Prisma } from '@prisma/client';
import { fileTypeFromBuffer } from 'file-type';
import { ZodError } from 'zod';

const asyncEditChapter = async (
  images: string[],
  files: File[],
  dbImages: string[],
  mangaId: number,
  chapterId: number
) => {
  try {
    const promises = images.map(async (image) => {
      if (image.startsWith(process.env.NEXT_PUBLIC_IMG_DOMAIN!)) return image;

      const file = files.shift();
      if (!file) return;

      const type = await fileTypeFromBuffer(await file.arrayBuffer());
      if (!type) return;

      if (['image/png', 'image/jpeg', 'image/jpg'].includes(type.mime))
        return file;
    });

    const imagesWithFiles = (await Promise.all(promises)).filter(Boolean) as (
      | string
      | File
    )[];

    const edittedImages = await EditChapterImage(
      imagesWithFiles,
      dbImages,
      mangaId,
      chapterId
    );

    await db.chapter.update({
      where: {
        id: chapterId,
      },
      data: {
        images: edittedImages,
        progress: 'SUCCESS',
      },
    });
  } catch (error) {
    await db.chapter.update({
      where: {
        id: chapterId,
      },
      data: {
        progress: 'ERROR',
      },
    });
  }
};

export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { images, files, chapterIndex, chapterName, volume } =
      ChapterFormEditValidator.parse(await req.formData());

    const chapter = await db.chapter.findUniqueOrThrow({
      where: {
        manga: {
          creatorId: session.user.id,
        },
        id: +context.params.id,
      },
      select: {
        id: true,
        mangaId: true,
        images: true,
      },
    });

    asyncEditChapter(
      images,
      files,
      chapter.images,
      chapter.mangaId,
      chapter.id
    );

    await db.chapter.update({
      where: {
        id: +context.params.id,
      },
      data: {
        chapterIndex,
        name: chapterName,
        volume,
        progress: 'EDITTING',
      },
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(error.message, { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new Response('Not found', { status: 404 });
      }
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
