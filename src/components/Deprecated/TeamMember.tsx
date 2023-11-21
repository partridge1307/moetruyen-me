import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from '@/components/ui/ContextMenu';
import { TabsContent } from '@/components/ui/Tabs';
import { db } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FC } from 'react';
import UserAvatar from '../User/Avatar';
import Banner from '../User/Banner';
import Username from '../User/Name';
import MemberAction from './components/MemberAction';

interface TeamMemberProps {
  teamId: number;
  sessionUserId: string;
}

const TeamMember: FC<TeamMemberProps> = async ({ teamId, sessionUserId }) => {
  const members = await db.team
    .findUnique({
      where: {
        id: teamId,
      },
    })
    .member({
      select: {
        id: true,
        name: true,
        color: true,
        image: true,
        banner: true,
        team: {
          select: {
            ownerId: true,
          },
        },
      },
    });
  if (!members) return notFound();

  return (
    <TabsContent
      value="member"
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-0 data-[state=active]:mt-2"
    >
      {members.map((member) => {
        if (member.id === member.team?.ownerId)
          return (
            <Link
              key={member.id}
              href={`${process.env.MAIN_URL}/user/${member.name
                ?.split(' ')
                .join('-')}`}
              className="p-1 rounded-md transition-colors dark:bg-zinc-800 hover:dark:bg-zinc-800/80"
            >
              <div className="relative">
                <Banner user={member} className="dark:bg-zinc-900" />
                <UserAvatar
                  user={member}
                  className="absolute bottom-0 translate-y-1/2 border-4 left-4 w-20 h-20 dark:border-zinc-900/75"
                />
              </div>

              <Username user={member} className="pl-4 mt-14 text-base" />
            </Link>
          );
        else
          return (
            <ContextMenu key={member.id}>
              <ContextMenuTrigger asChild>
                <Link
                  href={`${process.env.MAIN_URL}/user/${member.name
                    ?.split(' ')
                    .join('-')}`}
                  className="p-1 rounded-md transition-colors dark:bg-zinc-800 hover:dark:bg-zinc-800/80"
                >
                  <div className="relative">
                    <Banner user={member} className="dark:bg-zinc-900" />
                    <UserAvatar
                      user={member}
                      className="absolute bottom-0 translate-y-1/2 border-4 left-4 w-20 h-20 dark:border-zinc-900/75"
                    />
                  </div>

                  <Username user={member} className="pl-4 mt-14 text-base" />
                </Link>
              </ContextMenuTrigger>

              <ContextMenuContent className="dark:bg-zinc-900">
                <MemberAction
                  sessionUserId={sessionUserId}
                  ownerId={member.team?.ownerId!}
                  user={member}
                />
              </ContextMenuContent>
            </ContextMenu>
          );
      })}
    </TabsContent>
  );
};

export default TeamMember;
