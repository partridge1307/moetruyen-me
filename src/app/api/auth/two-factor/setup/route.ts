import { getAuthSession } from '@/lib/auth';
import { encrypt } from '@/lib/crypto';
import { db } from '@/lib/db';
import { TwoFactorValidator } from '@/lib/validators/auth';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { compare } from 'bcrypt';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { password } = TwoFactorValidator.parse(await req.json());

    const user = await db.user.findUniqueOrThrow({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        email: true,
        password: true,
        twoFactorEnabled: true,
      },
    });

    if (!(await compare(password, user.password)))
      return new Response('Unauthorized', { status: 401 });

    if (user.twoFactorEnabled)
      return new Response('Already enabled two factor', { status: 403 });

    const twoFactorSecret = authenticator.generateSecret(32);

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: encrypt(twoFactorSecret),
      },
    });

    const keyUri = authenticator.keyuri(
      user.email,
      'Moetruyen',
      twoFactorSecret
    );
    const dataUri = await qrcode.toDataURL(keyUri);

    return new Response(JSON.stringify({ keyUri, dataUri }));
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
