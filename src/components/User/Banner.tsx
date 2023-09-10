import type { User } from '@prisma/client';
import Image from 'next/image';
import { FC } from 'react';

interface BannerProps {
  user: Pick<User, 'name' | 'banner'>;
}

const Banner: FC<BannerProps> = ({ user }) => {
  return (
    <div className="aspect-video">
      {user.banner ? (
        <Image
          fill
          sizes="30vw"
          quality={40}
          priority
          src={user.banner}
          alt={`${user.name} Banner`}
        />
      ) : (
        <div className="absolute inset-0 rounded-md dark:bg-zinc-800" />
      )}
    </div>
  );
};

export default Banner;
