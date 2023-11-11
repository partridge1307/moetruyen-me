'use server';

import { revalidatePath } from 'next/cache';

const clearCache = (path?: string) => {
  try {
    if (path) {
      revalidatePath(path, 'page');
    } else {
      revalidatePath('/mangas/[id]/chapters', 'page');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('revalidateChapterRoute', error);
  }
};

export default clearCache;
