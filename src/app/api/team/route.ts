import { getAuthSession } from '@/lib/auth';
import { UploadTeamImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { TeamFormValidator } from '@/lib/validators/team';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export async function POST(req: Request) {
  try {
    const sesison = await getAuthSession();
    if (!sesison) return new Response('Unauthorized', { status: 401 });

    const { cover, image, name, description, plainTextDescription } =
      TeamFormValidator.parse(await req.formData());

    const user = await db.user.findUniqueOrThrow({
      where: {
        id: sesison.user.id,
        teamId: null,
      },
      select: {
        id: true,
        verified: true,
      },
    });

    if (!user.verified) {
      return new Response('Verify is required', { status: 409 });
    }

    const createdTeam = await db.team.create({
      data: {
        image: '',
        name,
        // @ts-ignore
        description,
        plainTextDescription: plainTextDescription ?? `Team ${name}`,
        ownerId: sesison.user.id,
        member: {
          connect: {
            id: sesison.user.id,
          },
        },
      },
    });

    let imagePromise, coverPromise;
    if (!!cover) {
      if (cover instanceof File) {
        coverPromise = UploadTeamImage(cover, createdTeam.id, null, 'cover');
      } else coverPromise = cover;
    }

    if (image instanceof File) {
      imagePromise = UploadTeamImage(image, createdTeam.id, null, 'image');
    } else imagePromise = image;

    const [coverUploaded, imageUploaded] = await Promise.all([
      coverPromise,
      imagePromise,
    ]);

    await db.team.update({
      where: {
        id: createdTeam.id,
      },
      data: {
        cover: coverUploaded,
        image: imageUploaded,
      },
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response('Invalid', { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025')
        return new Response('Not found', { status: 404 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
