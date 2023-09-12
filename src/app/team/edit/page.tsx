import TeamCreateRules from '@/components/Rules/TeamCreateRules';
import EditTeam from '@/components/Upload/Team/Edit';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';

const page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect(`${process.env.MAIN_URL}/sign-in`);

  const team = await db.team.findUnique({
    where: {
      ownerId: session.user.id,
    },
    select: {
      image: true,
      name: true,
      description: true,
    },
  });
  if (!team) return notFound();

  return (
    <main className="container lg:w-2/3 p-1 mb-10 space-y-10">
      <section className="p-3 rounded-md dark:bg-zinc-900/60">
        <EditTeam team={team} />
      </section>

      <TeamCreateRules />
    </main>
  );
};

export default page;
