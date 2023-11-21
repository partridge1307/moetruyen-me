import TeamCover from '@/components/Team/TeamCover';
import TeamImage from '@/components/Team/TeamImage';
import TeamInfo from '@/components/Team/TeamInfo';
import UserAvatar from '@/components/User/Avatar';
import Username from '@/components/User/Name';
import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const TeamAction = dynamic(() => import('@/components/Team/TeamAction'));

const page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect(`${process.env.MAIN_URL}/sign-in`);

  const team = await db.user
    .findUnique({
      where: {
        id: session.user.id,
      },
    })
    .team({
      select: {
        id: true,
        cover: true,
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
            chapter: {
              where: {
                isPublished: true,
              },
            },
          },
        },
      },
    });

  return (
    <main className="relative container max-sm:px-2 lg:w-2/3">
      {!team && (
        <section className="flex flex-col items-center space-y-4 p-3 rounded-md bg-primary-foreground">
          <p>
            Bạn chưa có Team nào. Hãy{' '}
            <span className="font-semibold">gia nhập</span> hoặc{' '}
            <span className="font-semibold">tạo Team</span> nhé
          </p>
          <Link href="/team/create" className={buttonVariants()}>
            Tạo Team
          </Link>
        </section>
      )}

      {!!team && (
        <>
          <section className="p-3 pb-6 rounded-t-md bg-primary-foreground">
            <section className="relative">
              <TeamCover team={team} />
              <div className="absolute left-[3%] bottom-0 w-1/4 h-1/4 md:w-1/5 md:h-1/5">
                <TeamImage
                  team={team}
                  className="border-[6px] border-muted rounded-full"
                />
              </div>
            </section>

            <section className="ml-[31%] md:ml-[26%] mt-3 mb-10 md:mb-[10%] flex flex-wrap items-start justify-between">
              <h1 className="text-3xl font-semibold">{team.name}</h1>
              <Link
                aria-label="Owner profile"
                href={`${process.env.MAIN_URL}/user/${team.owner.name
                  ?.split(' ')
                  .join('-')}`}
                className="shrink-0 max-sm:mt-9 flex items-center gap-3 py-1.5 px-3 max-sm:pl-0 rounded-full transition-colors hover:bg-muted"
              >
                <UserAvatar user={team.owner} className="w-12 h-12" />
                <div className="max-w-[200px]">
                  <Username
                    user={team.owner}
                    className="line-clamp-1 leading-4"
                  />
                  <span className="text-sm opacity-70">Owner</span>
                </div>
              </Link>
            </section>

            <TeamInfo team={team} />
          </section>

          <section>
            <TeamAction
              team={team}
              isOwner={session.user.id === team.owner.id}
            />
          </section>
        </>
      )}
    </main>
  );
};

export default page;
