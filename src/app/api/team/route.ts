import { getAuthSession } from '@/lib/auth';
import { UploadTeamImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { TeamFormValidator } from '@/lib/validators/team';
import { Prisma } from '@prisma/client';
import { ZodError, z } from 'zod';

export async function POST(req: Request) {
  try {
    const sesison = await getAuthSession();
    if (!sesison) return new Response('Unauthorized', { status: 401 });

    const {
      image: img,
      name,
      description,
    } = TeamFormValidator.parse(await req.formData());

    const member = await db.memberOnTeam.findUnique({
      where: {
        userId: sesison.user.id,
      },
      select: {
        userId: true,
      },
    });
    if (member) return new Response('Existing Team', { status: 406 });

    const createdTeam = await db.team.create({
      data: {
        image: '',
        name,
        description,
        ownerId: sesison.user.id,
        member: {
          create: {
            userId: sesison.user.id,
          },
        },
      },
    });

    let image;
    if (img instanceof File) {
      image = await UploadTeamImage(img, createdTeam.id, null);
    } else image = img;

    await db.team.update({
      where: {
        id: createdTeam.id,
      },
      data: {
        image,
      },
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response('Invalid', { status: 422 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) return new Response('Unauthorized', { status: 401 });

    const { type, userId } = z
      .object({
        type: z.enum(['ACCEPT', 'REJECT']),
        userId: z.string(),
      })
      .parse(await req.json());

    const team = await db.team.findUniqueOrThrow({
      where: {
        ownerId: session.user.id,
      },
    });

    if (type === 'ACCEPT') {
      const existingMember = await db.memberOnTeam.findUnique({
        where: {
          userId,
        },
      });

      if (existingMember)
        return new Response('User has joined to this or another Team', {
          status: 406,
        });

      await db.$transaction([
        db.teamJoinRequest.deleteMany({
          where: {
            userId,
          },
        }),
        db.memberOnTeam.create({
          data: {
            userId,
            teamId: team.id,
          },
        }),
      ]);
    } else {
      await db.teamJoinRequest.delete({
        where: {
          teamId_userId: {
            teamId: team.id,
            userId,
          },
        },
      });
    }

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

export async function PATCH(req: Request) {
  try {
    const sesison = await getAuthSession();
    if (!sesison) return new Response('Unauthorized', { status: 401 });

    const {
      image: img,
      name,
      description,
    } = TeamFormValidator.parse(await req.formData());

    const team = await db.team.findUniqueOrThrow({
      where: {
        ownerId: sesison.user.id,
      },
    });

    let image;
    if (img instanceof File)
      image = await UploadTeamImage(img, team.id, team.image);
    else image = img;

    await db.team.update({
      where: {
        id: team.id,
      },
      data: {
        image,
        name,
        description,
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
