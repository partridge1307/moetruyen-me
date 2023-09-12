import { socketServer } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { EditChapterImage, UploadChapterImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { signPublicToken } from '@/lib/jwt';
import { getImagesBase64 } from '@/lib/plaiceholder';
import {
  ChapterFormEditValidator,
  ChapterFormUploadValidator,
} from '@/lib/validators/chapter';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { images, volume, chapterIndex, chapterName } =
      ChapterFormUploadValidator.parse(await req.formData());

    const [manga, user] = await db.$transaction([
      db.manga.findUniqueOrThrow({
        where: {
          id: +context.params.id,
          creatorId: session.user.id,
        },
        select: {
          id: true,
          name: true,
        },
      }),
      db.user.findUniqueOrThrow({
        where: {
          id: session.user.id,
        },
        select: {
          memberOnTeam: true,
        },
      }),
    ]);

    let index;
    if (chapterIndex === 0) {
      index = (
        await db.chapter.findFirst({
          where: {
            mangaId: manga.id,
          },
          orderBy: {
            chapterIndex: 'desc',
          },
          select: {
            chapterIndex: true,
          },
        })
      )?.chapterIndex;

      if (!index) index = 1;
      else index = Math.floor(++index);
    } else {
      index = chapterIndex;

      if (
        await db.chapter.findFirst({
          where: {
            mangaId: manga.id,
            chapterIndex: index,
          },
          select: {
            id: true,
          },
        })
      )
        return new Response('Forbidden', { status: 403 });
    }

    const uploadedImages = await UploadChapterImage(images, manga.id, index);
    const blurImages = await getImagesBase64(uploadedImages);

    if (user.memberOnTeam) {
      await db.chapter.create({
        data: {
          chapterIndex: index,
          name: chapterName,
          volume,
          images: uploadedImages,
          blurImages,
          manga: {
            connect: { id: manga.id },
          },
          team: {
            connect: { id: user.memberOnTeam.teamId },
          },
        },
      });
    } else {
      await db.chapter.create({
        data: {
          chapterIndex: index,
          name: chapterName,
          volume,
          images: uploadedImages,
          blurImages,
          manga: {
            connect: { id: manga.id },
          },
        },
      });
    }

    return new Response('OK');
  } catch (error) {
    if (error instanceof ZodError)
      return new Response('Invalid', { status: 422 });
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new Response('Not found', { status: 404 });
      }
    }
    return new Response('Something went wrong', { status: 500 });
  }
}

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { images, chapterIndex, chapterName, volume } =
      ChapterFormEditValidator.parse(await req.formData());

    const chapter = await db.chapter.findUniqueOrThrow({
      where: {
        manga: {
          creatorId: session.user.id,
        },
        id: +context.params.id,
      },
      select: {
        mangaId: true,
        images: true,
      },
    });

    const edittedImages = (
      await EditChapterImage(
        images,
        chapter.images,
        chapter.mangaId,
        chapterIndex
      )
    )
      .sort((a, b) => a.index - b.index)
      .map((img) => img.image);
    const blurImages = await getImagesBase64(edittedImages);

    await db.chapter.update({
      where: {
        id: +context.params.id,
      },
      data: {
        chapterIndex,
        name: chapterName,
        volume,
        images: edittedImages,
        blurImages,
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

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const [target, channel] = await db.$transaction([
      db.chapter.findUniqueOrThrow({
        where: {
          id: +context.params.id,
          manga: {
            creatorId: session.user.id,
          },
        },
        select: {
          id: true,
          isPublished: true,
          manga: {
            select: {
              id: true,
              name: true,
              isPublished: true,
            },
          },
        },
      }),
      db.discordChannel.findUnique({
        where: {
          userId: session.user.id,
        },
        select: {
          channelId: true,
          roleId: true,
        },
      }),
    ]);

    if (target.isPublished)
      return new Response('Already published', { status: 409 });

    if (!target.manga.isPublished)
      return new Response('Manga must publish first', { status: 406 });

    const [, usersFollow] = await db.$transaction([
      db.chapter.update({
        where: {
          id: target.id,
        },
        data: {
          isPublished: true,
        },
      }),
      db.mangaFollow.findMany({
        where: {
          mangaId: target.manga.id,
        },
        select: {
          userId: true,
        },
      }),
    ]);

    await db.notify.createMany({
      data: usersFollow.map((user) => ({
        type: 'FOLLOW',
        toUserId: user.userId,
        content: `${target.manga.name} đã ra Chapter mới rồi đó`,
        endPoint: `/chapter/${target.id}`,
      })),
    });

    if (channel) {
      const token = signPublicToken({
        id: target.id,
        channelId: channel.channelId,
        roleId: channel.roleId,
      });

      fetch(`${socketServer}/api/v1/server`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

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
