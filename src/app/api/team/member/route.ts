import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { userId } = z.object({ userId: z.string() }).parse(await req.json());

    const team = await db.team.findUniqueOrThrow({
      where: {
        ownerId: session.user.id,
      },
    });

    await db.$transaction([
      db.team.update({
        where: {
          id: team.id,
        },
        data: {
          member: {
            disconnect: {
              id: userId,
            },
          },
        },
      }),
    ]);

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { userId } = z.object({ userId: z.string() }).parse(await req.json());

    const team = await db.team.findUniqueOrThrow({
      where: {
        ownerId: session.user.id,
      },
    });

    await db.team.update({
      where: {
        id: team.id,
      },
      data: {
        ownerId: userId,
      },
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        teamId: null,
      },
    });

    return new Response('OK');
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}
