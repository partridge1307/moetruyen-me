import TeamInfo from '@/components/Team/TeamInfo';
import { buttonVariants } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const TeamMember = dynamic(() => import('@/components/Team/TeamMember'), {
  loading: () => <Loader2 className="w-10 h-10 animate-spin" />,
});
const TeamManga = dynamic(() => import('@/components/Team/TeamManga'), {
  loading: () => <Loader2 className="w-10 h-10 animate-spin" />,
});
const TeamChapter = dynamic(() => import('@/components/Team/TeamChapter'), {
  loading: () => <Loader2 className="w-10 h-10 animate-spin" />,
});
const JoinRequest = dynamic(() => import('@/components/Team/JoinRequest'), {
  loading: () => <Loader2 className="w-10 h-10 animate-spin" />,
});

const page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect(`${process.env.MAIN_URL}/sign-in`);

  const team = await db.memberOnTeam
    .findUnique({
      where: {
        userId: session.user.id,
      },
    })
    .team({
      select: {
        id: true,
        image: true,
        name: true,
        description: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
            color: true,
          },
        },
        _count: {
          select: {
            member: true,
            chapter: true,
          },
        },
      },
    });

  return (
    <main className="container lg:w-2/3 p-2 rounded-md mb-6 dark:bg-zinc-900/60">
      {!team ? (
        <section className="min-h-[200px] flex flex-col justify-center items-center space-y-3">
          <p>
            Bạn chưa có Team nào. Hãy{' '}
            <span className="font-semibold">gia nhập</span> hoặc{' '}
            <span className="font-semibold">tạo Team</span> nhé
          </p>
          <Link href="/team/create" className={buttonVariants()}>
            Tạo Team
          </Link>
        </section>
      ) : (
        <Tabs defaultValue="info">
          <TabsList className="max-w-full overflow-auto justify-start max-sm:gap-2">
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="member">Thành viên</TabsTrigger>
            <TabsTrigger value="manga">Manga</TabsTrigger>
            <TabsTrigger value="chapter">Chapter</TabsTrigger>
            {session.user.id === team.owner.id && (
              <TabsTrigger value="request">Request</TabsTrigger>
            )}
          </TabsList>

          <TeamInfo team={team} sessionUserId={session.user.id} />
          <TeamMember teamId={team.id} sessionUserId={session.user.id} />
          <TeamManga teamId={team.id} />
          <TeamChapter teamId={team.id} />
          {session.user.id === team.owner.id && (
            <JoinRequest teamId={team.id} ownerId={session.user.id} />
          )}
        </Tabs>
      )}
    </main>
  );
};

export default page;
