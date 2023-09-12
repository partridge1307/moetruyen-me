import { TabsContent } from '@/components/ui/Tabs';
import { cn, formatTimeToNow } from '@/lib/utils';
import type { Team, User } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import UserAvatar from '../User/Avatar';
import Username from '../User/Name';
import { Edit } from 'lucide-react';
import { buttonVariants } from '../ui/Button';
import TeamAction from './components/TeamAction';

interface TeamInfoProps {
  team: Pick<Team, 'image' | 'name' | 'description' | 'createdAt'> & {
    owner: Pick<User, 'id' | 'image' | 'name' | 'color'>;
    _count: {
      member: number;
      chapter: number;
    };
  };
  sessionUserId: string;
}

const TeamInfo: FC<TeamInfoProps> = ({ team, sessionUserId }) => {
  return (
    <TabsContent
      value="info"
      className="space-y-10 mt-0 data-[state=active]:mt-2"
    >
      <section className="grid grid-cols-[.9fr_1fr] md:grid-cols-[.3fr_1fr] gap-4 md:gap-10 mb-16">
        <div className="relative aspect-square">
          <Image
            fill
            sizes="(max-width: 640px) 20vw, 30vw"
            quality={40}
            priority
            src={team.image}
            alt={`${team.name} Thumbnail`}
            className="object-cover rounded-full border-4 dark:border-zinc-800"
          />
        </div>

        <div className="flex flex-col justify-between max-sm:gap-2 my-2">
          <h1 className="text-lg lg:text-xl font-semibold">{team.name}</h1>

          <dl className="space-y-1">
            <dt className="max-sm:text-sm">Owner:</dt>
            <dd>
              <Link
                href={`${process.env.MAIN_URL}/user/${team.owner.name
                  ?.split(' ')
                  .join('-')}`}
                className="flex items-center w-fit space-x-2 p-1 pr-4 rounded-md dark:bg-zinc-800"
              >
                <UserAvatar
                  user={team.owner}
                  className="w-10 h-10 lg:w-12 lg:h-12"
                />
                <Username user={team.owner} className="max-sm:text-sm" />
              </Link>
            </dd>
          </dl>

          <dl className="flex items-center space-x-2 max-sm:text-sm">
            <dt>Tạo từ:</dt>
            <dd>
              <time dateTime={team.createdAt.toDateString()}>
                {formatTimeToNow(new Date(team.createdAt))}
              </time>
            </dd>
          </dl>
        </div>
      </section>

      <section>
        {sessionUserId === team.owner.id ? (
          <Link href="/team/edit" className={cn(buttonVariants(), 'space-x-2')}>
            <Edit className="w-5 h-5" />
            <span>Chỉnh sửa</span>
          </Link>
        ) : (
          <TeamAction />
        )}
      </section>

      <section className="space-y-1">
        <h1 className="lg:text-lg font-medium">Mô tả</h1>
        <p className="p-1 rounded-md dark:bg-zinc-800">{team.description}</p>
      </section>

      <section className="flex flex-wrap justify-center items-center space-x-10">
        <dl className="flex items-center space-x-1">
          <dt className="font-medium">{team._count.member}</dt>
          <dd>Thành viên</dd>
        </dl>

        <dl className="flex items-center space-x-1">
          <dt className="font-medium">{team._count.chapter}</dt>
          <dd>Chapter đã đăng</dd>
        </dl>
      </section>
    </TabsContent>
  );
};

export default TeamInfo;
