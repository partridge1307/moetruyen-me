import { getAuthSession } from '@/lib/auth';
import { UploadUserImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import {
  UserFormUpdateValidator,
  UserPasswordChangeValidator,
} from '@/lib/validators/user';
import { Prisma } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { ZodError } from 'zod';

export async function DELETE() {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    await db.$transaction([
      db.account.deleteMany({
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
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const {
      avatar: avt,
      banner: bnr,
      name,
      color,
    } = UserFormUpdateValidator.parse(await req.formData());

    const user = await db.user.findUniqueOrThrow({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        image: true,
        banner: true,
        name: true,
        color: true,
      },
    });

    let avatarPromise: Promise<string> | undefined,
      bannerPromise: Promise<string> | undefined;
    if (avt instanceof File) {
      avatarPromise = UploadUserImage(avt, user.image, user.id, 'avatar');
    }

    if (bnr instanceof File) {
      bannerPromise = UploadUserImage(bnr, user.banner, user.id, 'banner');
    }

    const [image, banner] = await Promise.all([avatarPromise, bannerPromise]);

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        name,
        image,
        banner,
        // @ts-ignore
        color: color ? color : user.color,
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
