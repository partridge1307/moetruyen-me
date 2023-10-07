import { getAuthSession } from '@/lib/auth';
import { decrypt } from '@/lib/crypto';
import { db } from '@/lib/db';
import { TOTPValidator } from '@/lib/validators/auth';
import { Prisma } from '@prisma/client';
import { authenticator } from 'otplib';
import { ZodError } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized');

    const { totp } = TOTPValidator.parse(await req.json());

    const user = await db.user.findUniqueOrThrow({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
      },
    });

    if (!user.twoFactorEnabled)
      return new Response('Two factor enable required', { status: 403 });
    if (!user.twoFactorSecret)
      return new Response('Two factor setup required', { status: 406 });

    const secret = decrypt(user.twoFactorSecret);
    if (secret.length !== 52)
      return new Response('Two factor failed', { status: 500 });

    const isValid = authenticator.check(totp, secret);
    if (!isValid) return new Response('Incorrect TOTP', { status: 400 });

    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response('Invalid', { status: 422 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
