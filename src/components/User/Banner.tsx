import { cn } from '@/lib/utils';
import type { User } from '@prisma/client';
import Image from 'next/image';
import { FC } from 'react';

interface BannerProps {
  user: Pick<User, 'name' | 'banner'>;
  className?: string;
}

const Banner: FC<BannerProps> = ({ user, className }) => {
  return (
    <div className="relative aspect-[2.39/1]">
      {user.banner ? (
        <Image
          fill
          sizes="30vw"
          quality={40}
          priority
          src={user.banner}
          alt={`${user.name} Banner`}
          className={cn(
            'absolute inset-0 rounded-md dark:bg-zinc-800',
            className
          )}
        />
      ) : (
        <div
          className={cn(
            'absolute inset-0 rounded-md dark:bg-zinc-800',
            className
          )}
        />
      )}
    </div>
  );
};

export default Banner;
