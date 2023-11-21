'use client';

import type { Team } from '@prisma/client';
import dynamic from 'next/dynamic';
import { FC } from 'react';
import EditorSkeleton from '../Skeleton/EditorSkeleton';
import { Spoiler } from '@mantine/core';
import '@mantine/core/styles.layer.css';
import classes from '@/styles/mantine/team-info.module.css';
import { useMediaQuery } from '@mantine/hooks';
import format from 'date-fns/format';
import { Building, Newspaper, Users2 } from 'lucide-react';
import { nFormatter } from '@/lib/utils';

const MTEditor = dynamic(
  () => import('@/components/Editor/MoetruyenEditorOutput'),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

interface TeamInfoProps {
  team: Pick<Team, 'id' | 'description' | 'createdAt'> & {
    _count: {
      member: number;
      chapter: number;
    };
  };
}

const TeamInfo: FC<TeamInfoProps> = ({ team }) => {
  const isMobile = useMediaQuery('(max-width: 640px)');

  return (
    <section className="md:space-y-14">
      <Spoiler
        maxHeight={120}
        showLabel={
          <p className="w-fit text-sm rounded-b-md px-2.5 py-0.5 bg-primary text-primary-foreground">
            Xem thêm
          </p>
        }
        hideLabel={
          <p className="w-fit text-sm rounded-b-md px-2.5 py-0.5 bg-primary text-primary-foreground">
            Lược bớt
          </p>
        }
        classNames={classes}
      >
        <MTEditor id={team.id} content={team.description} />
        {!!isMobile && (
          <div className="flex flex-wrap items-center gap-6">
            <dl className="flex items-center gap-1.5">
              <dt>{nFormatter(team._count.chapter, 1)}</dt>
              <dd>
                <Newspaper className="w-4 h-4" />
              </dd>
            </dl>

            <dl className="flex items-center gap-1.5">
              <dt>{nFormatter(team._count.member, 1)}</dt>
              <dd>
                <Users2 className="w-4 h-4" />
              </dd>
            </dl>

            <dl className="flex items-center gap-1.5">
              <dt>{format(team.createdAt, 'd/M/y')}</dt>
              <dd>
                <Building className="w-4 h-4" />
              </dd>
            </dl>
          </div>
        )}
      </Spoiler>

      {!isMobile && (
        <div className="flex flex-wrap items-center gap-10">
          <dl className="flex items-center gap-1.5">
            <dt>{nFormatter(team._count.chapter, 1)}</dt>
            <dd>
              <Newspaper className="w-4 h-4" />
            </dd>
          </dl>

          <dl className="flex items-center gap-1.5">
            <dt>{nFormatter(team._count.member, 1)}</dt>
            <dd>
              <Users2 className="w-4 h-4" />
            </dd>
          </dl>

          <dl className="flex items-center gap-1.5">
            <dt>{format(team.createdAt, 'd/M/y')}</dt>
            <dd>
              <Building className="w-4 h-4" />
            </dd>
          </dl>
        </div>
      )}
    </section>
  );
};

export default TeamInfo;
