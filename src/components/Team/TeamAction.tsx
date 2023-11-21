import { db } from '@/lib/db';
import type { Team } from '@prisma/client';
import { FC } from 'react';
import { Tabs, TabsList, TabsTrigger } from '../ui/Tabs';
import Member from './ActionComponents/Member';
import dynamic from 'next/dynamic';
import Setting from './ActionComponents/Setting';

const Manga = dynamic(() => import('@/components/Team/ActionComponents/Manga'));
const Approve = dynamic(
  () => import('@/components/Team/ActionComponents/Approve')
);

interface TeamActionProps {
  team: Pick<Team, 'id'>;
  isOwner: boolean;
}

const TeamAction: FC<TeamActionProps> = async ({ team, isOwner }) => {
  const members = await db.team
    .findUnique({
      where: {
        id: team.id,
      },
    })
    .member({
      select: {
        id: true,
        name: true,
        color: true,
        image: true,
        banner: true,
      },
    });
  if (!members) return;

  return (
    <Tabs defaultValue="member">
      <TabsList className="h-fit flex overflow-x-auto items-center justify-between rounded-none rounded-b-md bg-primary-foreground">
        <TabsTrigger
          value="member"
          className="flex-1 rounded-none data-[state=active]:bg-inherit data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Member
        </TabsTrigger>
        <TabsTrigger
          value="manga"
          className="flex-1 rounded-none data-[state=active]:bg-inherit data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Manga
        </TabsTrigger>
        {isOwner && (
          <TabsTrigger
            value="approve"
            className="flex-1 rounded-none data-[state=active]:bg-inherit data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Xét duyệt
          </TabsTrigger>
        )}
        <TabsTrigger
          value="setting"
          className="flex-1 rounded-none data-[state=active]:bg-inherit data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Thiết lập
        </TabsTrigger>
      </TabsList>

      <Member members={members} isOwner={isOwner} />
      <Manga team={team} />
      {isOwner && <Approve team={team} />}
      <Setting isOwner={isOwner} />
    </Tabs>
  );
};

export default TeamAction;
