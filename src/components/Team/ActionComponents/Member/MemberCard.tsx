import UserAvatar from '@/components/User/Avatar';
import Banner from '@/components/User/Banner';
import Username from '@/components/User/Name';
import { User } from '@prisma/client';
import { FC } from 'react';

interface MemberCardProps {
  member: Pick<User, 'name' | 'image' | 'color' | 'banner'>;
}

const MemberCard: FC<MemberCardProps> = ({ member }) => {
  return (
    <a
      href={`${process.env.NEXT_PUBLIC_MAIN_URL}/user/${member.name
        ?.split(' ')
        .join('-')}`}
      className="block pb-4 rounded-md transition-colors hover:bg-primary-foreground"
    >
      <div className="relative">
        <Banner user={member} className="rounded-md" />
        <UserAvatar
          user={member}
          className="absolute bottom-0 left-[5%] translate-y-1/2 w-24 h-24 md:w-20 md:h-20 border-[5px] border-primary-foreground"
        />
      </div>
      <Username user={member} className="ml-[38%] mt-1" />
    </a>
  );
};

export default MemberCard;
