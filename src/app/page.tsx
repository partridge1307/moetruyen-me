import UserProfileSkeleton from '@/components/Skeleton/UserProfileSkeleton';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import { notFound, redirect } from 'next/navigation';

const UserProfile = dynamic(() => import('@/components/UserProfile'), {
  ssr: false,
  loading: () => <UserProfileSkeleton />,
});

const page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect(`${process.env.MAIN_URL}/sign-in`);

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      badge: true,
      name: true,
      color: true,
      image: true,
      banner: true,
    },
  });
  if (!user) return notFound();

  return (
    <main className="container lg:w-2/3 p-2 mb-10 rounded-md dark:bg-zinc-900/60">
      <UserProfile user={user} />
    </main>
  );
};

export default page;
