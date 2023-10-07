import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { signPublicToken } from '@/lib/jwt';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const user = await db.user.findUniqueOrThrow({
      where: {
        id: session.user.id,
        account: {
          some: {
            provider: 'discord',
          },
        },
      },
      select: {
        account: {
          select: {
            providerAccountId: true,
          },
        },
      },
    });

    const result = await fetch(`${process.env.BOT_SERVER}/discord/server`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: user.account[0].providerAccountId }),
    });

    if (result.status !== 200) {
      if (result.status === 404)
        return new Response('Not found any servers', { status: 409 });
      else
        return new Response('Could not communicate with bot server', {
          status: 503,
        });
    }

    return new Response(JSON.stringify(await result.json()));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025')
        return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { id } = z
      .object({
        id: z.string(),
      })
      .parse(await req.json());

    const user = await db.user.findUniqueOrThrow({
      where: {
        id: session.user.id,
        account: {
          some: {
            provider: 'discord',
          },
        },
      },
      select: {
        account: {
          select: {
            providerAccountId: true,
          },
        },
      },
    });

    const result = await fetch(`${process.env.BOT_SERVER}/discord/channel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.account[0].providerAccountId,
        serverId: id,
      }),
    });

    if (result.status !== 200) {
      if (result.status === 404)
        return new Response('Not found any servers', { status: 409 });
      else
        return new Response('Could not communicate with bot server', {
          status: 503,
        });
    }

    return new Response(JSON.stringify(await result.json()));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025')
        return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}

const infoValidator = z.object({
  id: z.string(),
  name: z.string(),
});

export async function PUT(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { server, channel, role } = z
      .object({
        server: infoValidator,
        channel: infoValidator,
        role: infoValidator.optional().nullish(),
      })
      .parse(await req.json());

    const user = await db.user.findUniqueOrThrow({
      where: {
        id: session.user.id,
        account: {
          some: {
            provider: 'discord',
          },
        },
      },
      select: {
        id: true,
        account: {
          select: {
            providerAccountId: true,
          },
        },
      },
    });

    const createdDiscordChannel = await db.discordChannel.create({
      data: {
        userId: user.id,
        serverId: server.id,
        serverName: server.name,
        channelId: channel.id,
        channelName: channel.name,
        roleId: role?.id,
        roleName: role?.name,
      },
    });

    const jwtKey = signPublicToken({
      userId: user.account[0].providerAccountId,
      server: {
        id: createdDiscordChannel.serverId,
        name: createdDiscordChannel.serverName,
      },
      channel: {
        id: createdDiscordChannel.channelId,
        name: createdDiscordChannel.channelName,
      },
      ...(!!createdDiscordChannel.roleId &&
        !!createdDiscordChannel.roleName && {
          role: {
            id: createdDiscordChannel.roleId,
            name: createdDiscordChannel.roleName,
          },
        }),
    });

    const result = await fetch(`${process.env.BOT_SERVER}/discord/setup`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwtKey}`,
      },
    });

    if (result.status !== 200) {
      if (result.status === 401) throw new Error('Unauthozied jwt');
      if (result.status === 403)
        return new Response('Could not found target channel', { status: 403 });

      return new Response('Something went wrong with Bot server', {
        status: 503,
      });
    }

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025')
        return new Response('Not found', { status: 404 });
      if (error.code === 'P2002')
        return new Response('Existed notify discord', { status: 406 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    await db.$transaction([
      db.discordChannel.findUniqueOrThrow({
        where: {
          userId: session.user.id,
        },
      }),
      db.discordChannel.delete({
        where: {
          userId: session.user.id,
        },
      }),
    ]);

    return new Response('OK');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025')
        return new Response('not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
