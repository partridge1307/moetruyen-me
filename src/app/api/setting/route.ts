import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const account = await db.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'discord',
      },
      select: {
        providerAccountId: true,
      },
    });
    if (!account) return new Response('Not found', { status: 404 });

    const data = await fetch(
      `${process.env.SOCKET_URL}/api/v1/server/${account.providerAccountId}`
    ).then((res) => res.json());

    return new Response(JSON.stringify(data));
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { server, channel, role } = z
      .object({
        server: z.object({ id: z.string(), name: z.string() }),
        channel: z.object({ id: z.string(), name: z.string() }),
        role: z.object({ id: z.string(), name: z.string() }).optional(),
      })
      .parse(await req.json());

    const user = await db.user.findUniqueOrThrow({
      where: {
        id: session.user.id,
      },
      select: {
        discordChannel: true,
        account: {
          select: {
            providerAccountId: true,
          },
        },
      },
    });
    if (!user.account.length) return new Response('Not found', { status: 404 });

    const res = await fetch(
      `${process.env.SOCKET_URL}/api/v1/server/${channel.id}/${user.account[0].providerAccountId}`,
      {
        method: 'POST',
      }
    );
    if (!res.ok) {
      if (res.status === 404) return new Response('Not found', { status: 404 });
      if (res.status === 422) return new Response('Invalid', { status: 422 });
      return new Response('Something went wrong', { status: 500 });
    }

    if (user.discordChannel) {
      await db.$transaction([
        db.discordChannel.deleteMany({
          where: {
            userId: session.user.id,
          },
        }),
        db.discordChannel.create({
          data: {
            userId: session.user.id,
            serverId: server.id,
            serverName: server.name,
            channelId: channel.id,
            channelName: channel.name,
            roleId: role?.id,
            roleName: role?.name,
          },
        }),
      ]);
    } else {
      await db.discordChannel.create({
        data: {
          userId: session.user.id,
          serverId: server.id,
          serverName: server.name,
          channelId: channel.id,
          channelName: channel.name,
          roleId: role?.id,
          roleName: role?.name,
        },
      });
    }

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}
