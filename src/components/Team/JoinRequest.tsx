import { TabsContent } from '@/components/ui/Tabs';
import { db } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FC } from 'react';
import UserAvatar from '../User/Avatar';
import Banner from '../User/Banner';
import Username from '../User/Name';
import AcceptButton from './components/AcceptButton';

interface JoinRequestProps {
  teamId: number;
  ownerId: string;
}

const JoinRequest: FC<JoinRequestProps> = async ({ teamId, ownerId }) => {
  const joinRequests = await db.team
    .findUnique({
      where: {
        id: teamId,
        ownerId,
      },
    })
    .teamJoinRequest({
      select: {
        user: {
          select: {
            id: true,
            name: true,
            color: true,
            image: true,
            banner: true,
          },
        },
      },
    });
  if (!joinRequests) return notFound();

  return (
    <TabsContent
      value="request"
      className="mt-0 data-[state=active]:mt-2 grid grid-cols-3 gap-4"
    >
      {joinRequests.length ? (
        joinRequests.map((request) => (
          <div key={request.user.id} className="space-y-2">
            <Link
              href={`${process.env.MAIN_URL}/user/${request.user.name
                ?.split(' ')
                .join('-')}`}
              className="block p-1 rounded-md transition-colors dark:bg-zinc-800 hover:dark:bg-zinc-800/80"
            >
              <div className="relative">
                <Banner user={request.user} className="dark:bg-zinc-900" />
                <UserAvatar
                  user={request.user}
                  className="absolute bottom-0 translate-y-1/2 w-20 h-20 left-4 border-4 dark:border-zinc-900/75"
                />
              </div>

              <Username user={request.user} className="pl-4 text-base mt-14" />
            </Link>

            <AcceptButton userId={request.user.id} />
          </div>
        ))
      ) : (
        <p>Không có ai xin gia nhập</p>
      )}
    </TabsContent>
  );
};

export default JoinRequest;
