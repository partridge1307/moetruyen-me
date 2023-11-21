import { cn } from '@/lib/utils';
import type { Team } from '@prisma/client';
import Image from 'next/image';
import { FC } from 'react';

interface TeamCoverProps extends React.HTMLAttributes<HTMLImageElement> {
  team: Pick<Team, 'cover' | 'name'>;
  priority?: boolean;
  quality?: number;
  sizes?: string;
}

const TeamCover: FC<TeamCoverProps> = ({
  team,
  priority = true,
  quality = 40,
  sizes = '(max-width: 640px) 45vw, 65vw',
  className,
  placeholder,
  ...props
}) => {
  return (
    <div className="relative aspect-[2.39/1]">
      {!!team.cover ? (
        <Image
          fill
          priority={priority}
          sizes={sizes}
          quality={quality}
          src={team.cover}
          alt={`Ảnh bìa ${team.name}`}
          className={cn('object-cover rounded-md', className)}
          {...props}
        />
      ) : (
        <div className="w-full h-full bg-background" />
      )}
    </div>
  );
};

export default TeamCover;
