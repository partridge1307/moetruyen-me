import { cn } from '@/lib/utils';
import type { Team } from '@prisma/client';
import Image from 'next/image';
import { FC } from 'react';

interface TeamImageProps extends React.HTMLAttributes<HTMLImageElement> {
  team: Pick<Team, 'image' | 'name'>;
  priority?: boolean;
  quality?: number;
  sizes?: string;
}

const TeamImage: FC<TeamImageProps> = ({
  team,
  priority = false,
  quality = 40,
  sizes = '(max-width: 640px) 20vw, 25vw',
  className,
  placeholder,
  ...props
}) => {
  return (
    <div className={cn('relative aspect-square', className)}>
      <Image
        fill
        priority={priority}
        sizes={sizes}
        quality={quality}
        src={team.image}
        alt={`Ảnh ${team.name}`}
        className="object-cover rounded-full"
        {...props}
      />
    </div>
  );
};

export default TeamImage;
