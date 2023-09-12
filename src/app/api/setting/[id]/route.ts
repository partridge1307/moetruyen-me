import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const user = await db.account.findFirstOrThrow({
      where: {
        userId: session.user.id,
        provider: 'discord',
      },
      select: {
        providerAccountId: true,
      },
    });

    const res = await fetch(
      `${process.env.SOCKET_URL}/api/v1/server/${context.params.id}/${user.providerAccountId}`
    );
    if (!res.ok) return new Response('Not Acceptable', { status: 406 });

    const data = await res.json();

    return new Response(
      JSON.stringify({ channels: data.channels, roles: data.roles })
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }
    return new Response('Something went wrong', { status: 500 });
  }
}
