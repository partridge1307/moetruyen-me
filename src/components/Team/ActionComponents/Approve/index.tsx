import { TabsContent } from '@/components/ui/Tabs';
import { db } from '@/lib/db';
import type { Team } from '@prisma/client';
import { FC } from 'react';
import MemberCard from '../Member/MemberCard';
import Action from './Action';

interface ApproveProps {
  team: Pick<Team, 'id'>;
}

const Approve: FC<ApproveProps> = async ({ team }) => {
  const approval = await db.team
    .findUnique({
      where: {
        id: team.id,
      },
    })
    .teamJoinRequest({
      select: {
        user: {
          select: {
            id: true,
            banner: true,
            image: true,
            name: true,
            color: true,
          },
        },
      },
    });
  if (!approval) return null;

  return (
    <TabsContent
      value="approve"
      forceMount
      className="data-[state=inactive]:hidden p-2 pb-10 rounded-t-md bg-background/30"
    >
      <div className="grid md:grid-cols-3 gap-6">
        {approval.map(({ user }) => (
          <div key={user.id} className="space-y-3">
            <MemberCard member={user} />
            <Action user={user} />
          </div>
        ))}
      </div>
    </TabsContent>
  );
};

export default Approve;
