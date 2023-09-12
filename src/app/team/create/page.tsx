import CreateTeam from '@/components/Upload/Team';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

const page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect(`${process.env.MAIN_URL}/sign-in`);

  const team = await db.memberOnTeam.findUnique({
    where: {
      userId: session.user.id,
    },
  });
  if (team) return redirect('/team');

  return (
    <main className="container lg:w-2/3 p-1 mb-10">
      <section className="p-3 rounded-md dark:bg-zinc-900/60">
        <CreateTeam />
      </section>
    </main>
  );
};

export default page;
