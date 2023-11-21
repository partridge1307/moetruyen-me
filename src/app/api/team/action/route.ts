import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id, type } = z
      .object({
        id: z.string(),
        type: z.enum(['APPROVE', 'DENY']),
      })
      .parse(await req.json());

    const team = await db.team.findUniqueOrThrow({
      where: {
        ownerId: session.user.id,
      },
      select: {
        id: true,
        name: true,
      },
    });

    const joinRequest = await db.teamJoinRequest.findUniqueOrThrow({
      where: {
        teamId_userId: {
          teamId: team.id,
          userId: id,
        },
      },
      select: {
        user: {
          select: {
            teamId: true,
          },
        },
      },
    });

    if (!!joinRequest.user.teamId) {
      await db.teamJoinRequest.delete({
        where: {
          teamId_userId: {
            teamId: team.id,
            userId: id,
          },
        },
      });

      if (joinRequest.user.teamId === team.id)
        return new Response('Forbidden', { status: 403 });

      return new Response('Forbidden', { status: 406 });
    }

    if (type === 'APPROVE') {
      await db.$transaction([
        db.team.update({
          where: {
            id: team.id,
          },
          data: {
            teamJoinRequest: {
              delete: {
                teamId_userId: {
                  teamId: team.id,
                  userId: id,
                },
              },
            },
            member: {
              connect: {
                id,
              },
            },
          },
        }),
        db.notify.create({
          data: {
            type: 'SYSTEM',
            content: `Bạn đã gia nhập Team ${team.name}`,
            endPoint: `${process.env.MAIN_URL}/team/${team.id}`,
            toUserId: id,
          },
        }),
      ]);
    } else {
      await db.$transaction([
        db.teamJoinRequest.delete({
          where: {
            teamId_userId: {
              teamId: team.id,
              userId: id,
            },
          },
        }),
        db.notify.create({
          data: {
            type: 'SYSTEM',
            content: `Bạn đã bị từ chối bởi Team ${team.name}`,
            endPoint: `${process.env.MAIN_URL}/team/${team.id}`,
            toUserId: id,
          },
        }),
      ]);
    }

    return new Response('OK');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025')
        return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
