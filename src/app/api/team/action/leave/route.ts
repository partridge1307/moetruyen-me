import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function POST() {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const team = await db.user
      .findUniqueOrThrow({
        where: {
          id: session.user.id,
        },
      })
      .team({
        where: {
          ownerId: { not: session.user.id },
          member: {
            some: {
              id: session.user.id,
            },
          },
        },
      });
    if (!team) return new Response('Not found', { status: 404 });

    await db.team.update({
      where: {
        id: team.id,
      },
      data: {
        member: {
          disconnect: {
            id: session.user.id,
          },
        },
      },
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025')
        return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
