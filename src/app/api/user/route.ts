import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { UserPasswordChangeValidator } from '@/lib/validators/user';
import { compare, hash } from 'bcrypt';
import { ZodError } from 'zod';

export async function DELETE() {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    await db.account.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    return new Response('OK');
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { oldPassword, newPassword } = UserPasswordChangeValidator.parse(
      await req.json()
    );

    const user = await db.user.findUniqueOrThrow({
      where: {
        id: session.user.id,
      },
      select: {
        password: true,
      },
    });

    if (!(await compare(oldPassword, user.password))) {
      return new Response('Not acceptable', { status: 406 });
    }

    const hashedPassword = await hash(newPassword, 12);

    await db.$transaction([
      db.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          password: hashedPassword,
        },
      }),
      db.session.deleteMany({
        where: {
          userId: session.user.id,
        },
      }),
    ]);

    return new Response('OK');
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong');
  }
}
