import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id } = z
      .object({
        id: z.string(),
      })
      .parse(await req.json());

    const team = await db.user
      .findUniqueOrThrow({
        where: {
          id: session.user.id,
        },
      })
      .team({
        where: {
          ownerId: session.user.id,
          member: {
            some: {
              id,
            },
          },
        },
      });
    if (!team) return new Response('Not found', { status: 401 });
    if (id === team.ownerId) return new Response('Forbidden', { status: 403 });

    await db.$transaction([
      db.team.update({
        where: {
          id: team.id,
          ownerId: session.user.id,
        },
        data: {
          ownerId: id,
        },
      }),
      db.notify.create({
        data: {
          type: 'SYSTEM',
          content: 'Bạn đã trở thành chủ nhóm',
          endPoint: `${process.env.MAIN_URL}/team/${team.id}`,
          toUserId: id,
        },
      }),
    ]);

    return new Response('OK');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025')
        return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
