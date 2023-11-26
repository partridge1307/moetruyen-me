import { getAuthSession } from '@/lib/auth';
import { DeleteChapterImages, UploadChapterImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { signPublicToken } from '@/lib/jwt';
import { ChapterFormUploadValidator } from '@/lib/validators/chapter';
import { Prisma } from '@prisma/client';
import { fileTypeFromBuffer } from 'file-type';
import { ZodError } from 'zod';

const asyncUploadChapter = async (
  images: File[],
  mangaId: number,
  chapterId: number
) => {
  try {
    const promises = images
      .sort((a, b) => parseInt(a.name) - parseInt(b.name))
      .map(async (image) => {
        const type = await fileTypeFromBuffer(await image.arrayBuffer());
        if (!type) return;

        if (['image/png', 'image/jpeg', 'image/jpg'].includes(type?.mime)) {
          return image;
        }
      });

    const filteredFiles = (await Promise.all(promises)).filter(
      Boolean
    ) as File[];

    const uploadedImages = await UploadChapterImage(
      filteredFiles,
      mangaId,
      chapterId
    );
    await db.chapter.update({
      where: {
        id: chapterId,
      },
      data: {
        images: uploadedImages,
        progress: 'SUCCESS',
      },
    });
  } catch (error) {
    await Promise.all([
      db.chapter.update({
        where: {
          id: chapterId,
        },
        data: {
          progress: 'ERROR',
        },
      }),
      DeleteChapterImages({ mangaId, chapterId }),
    ]);
  }
};

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
          team: {
            select: {
              id: true,
            },
          },
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

    let createdChapter;
    if (user.team) {
      createdChapter = await db.chapter.create({
        data: {
          chapterIndex: index,
          name: chapterName,
          volume,
          images: [],
          manga: {
            connect: { id: manga.id },
          },
          team: {
            connect: { id: user.team.id },
          },
        },
      });
    } else {
      createdChapter = await db.chapter.create({
        data: {
          chapterIndex: index,
          name: chapterName,
          volume,
          images: [],
          manga: {
            connect: { id: manga.id },
          },
        },
      });
    }

    asyncUploadChapter(images, manga.id, createdChapter.id);

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

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const [chapter, channel] = await db.$transaction([
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
              followedBy: {
                select: {
                  id: true,
                },
              },
              creator: {
                select: {
                  followedBy: {
                    select: {
                      id: true,
                    },
                  },
                  team: {
                    where: {
                      follows: {
                        none: {
                          id: session.user.id,
                        },
                      },
                    },
                    select: {
                      follows: {
                        select: {
                          id: true,
                        },
                      },
                    },
                  },
                },
              },
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

    if (chapter.isPublished)
      return new Response('Already published', { status: 409 });

    const chapterFollowUsersId = [
      ...chapter.manga.followedBy.map((user) => user.id),
      ...chapter.manga.creator.followedBy.map((user) => user.id),
      ...(chapter.manga.creator.team
        ? chapter.manga.creator.team.follows.map((user) => user.id)
        : []),
    ];

    await db.$transaction([
      ...(!chapter.manga.isPublished
        ? [
            db.manga.update({
              where: {
                id: chapter.manga.id,
              },
              data: {
                isPublished: true,
                view: {
                  connectOrCreate: {
                    where: { mangaId: chapter.manga.id },
                    create: { totalView: 0 },
                  },
                },
              },
            }),
          ]
        : []),
      db.chapter.update({
        where: {
          id: chapter.id,
        },
        data: {
          isPublished: true,
        },
      }),
      db.notify.createMany({
        data: chapterFollowUsersId.map((toUserId) => ({
          type: 'FOLLOW',
          toUserId,
          content: `${chapter.manga.name} đã ra Chapter mới rồi đó`,
          endPoint: `${process.env.MAIN_URL}/chapter/${chapter.id}`,
        })),
        skipDuplicates: true,
      }),
    ]);

    if (channel) {
      const jwtKey = signPublicToken({
        data: {
          chapterId: chapter.id,
          channelId: channel.channelId,
          roleId: channel.roleId,
        },
      });

      const result = await fetch(
        `${process.env.BOT_SERVER}/api/private/notify`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${jwtKey}`,
          },
        }
      );

      if (result.status !== 200) {
        if (result.status === 401) throw new Error('Unauthozied jwt');
        if (result.status === 403)
          return new Response('Could not found target channel', {
            status: 403,
          });

        return new Response('Something went wrong with Bot server', {
          status: 503,
        });
      }
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
