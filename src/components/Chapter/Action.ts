'use server';

import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function PublishAll(mangaId: number) {
  try {
    const session = await getAuthSession();
    if (!session) return;

    await db.chapter.updateMany({
      where: {
        mangaId,
      },
      data: {
        isPublished: true,
      },
    });

    return revalidatePath(`/mangas/${mangaId}/chapters`, 'page');
  } catch (error) {
    return;
  }
}
