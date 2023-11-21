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

    const team = await db.team.findUniqueOrThrow({
      where: {
        ownerId: sesison.user.id,
      },
      select: {
        id: true,
        cover: true,
        image: true,
      },
    });

    let imagePromise, coverPromise;
    if (!!cover) {
      if (cover instanceof File) {
        coverPromise = UploadTeamImage(cover, team.id, team.cover, 'cover');
      } else coverPromise = cover;
    }

    if (image instanceof File) {
      imagePromise = UploadTeamImage(image, team.id, team.image, 'image');
    } else imagePromise = image;

    const [coverUploaded, imageUploaded] = await Promise.all([
      coverPromise,
      imagePromise,
    ]);

    await db.team.update({
      where: {
        id: team.id,
      },
      data: {
        cover: coverUploaded,
        image: imageUploaded,
        name,
        // @ts-ignore
        description,
        plainTextDescription: plainTextDescription ?? `Team ${name}`,
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
