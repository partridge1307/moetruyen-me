import TeamUploadSkeleton from '@/components/Skeleton/TeamUploadSkeleton';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import { notFound, redirect } from 'next/navigation';

const CreateTeam = dynamic(() => import('@/components/Upload/Team'), {
  ssr: false,
  loading: () => <TeamUploadSkeleton />,
});

const page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect(`${process.env.MAIN_URL}/sign-in`);

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      teamId: true,
    },
  });
  if (!user) return notFound();
  if (user.teamId) return redirect('/team');

  return (
    <main className="container lg:w-2/3 p-1 mb-10">
      <section className="p-3 rounded-md dark:bg-zinc-900/60">
        <CreateTeam />
      </section>
    </main>
  );
};

export default page;
