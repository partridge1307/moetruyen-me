import MangaUploadRules from '@/components/Rules/MangaUploadRules';
import MangaUploadSkeleton from '@/components/Skeleton/MangaUploadSkeleton';
import { tagGroupByCategory } from '@/lib/query';
import dynamic from 'next/dynamic';

const MangaUpload = dynamic(() => import('@/components/Upload/Manga'), {
  ssr: false,
  loading: () => <MangaUploadSkeleton />,
});

const page = async () => {
  const tag = await tagGroupByCategory();

  return (
    <main className="container lg:w-2/3 p-1 mb-10 space-y-10">
      <section className="p-3 rounded-md dark:bg-zinc-900/60">
        <MangaUpload tag={tag} />
      </section>

      <MangaUploadRules />
    </main>
  );
};

export default page;
