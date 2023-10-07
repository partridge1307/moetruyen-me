import { cn } from '@/lib/utils';
import type { User } from '@prisma/client';
import { FC, HTMLAttributes } from 'react';

interface UsernameProps extends HTMLAttributes<HTMLHeadElement> {
  user: Pick<User, 'color' | 'name'>;
  className?: string;
}

type GrandientColor = {
  from: string;
  to: string;
};

type NormalColor = {
  color: string;
};

const Username: FC<UsernameProps> = ({ user, className }) => {
  const color = user.color as GrandientColor | NormalColor | null;

  return (
    <p
      className={cn(
        'font-semibold bg-clip-text animate-rainbow',
        !color ? 'text-black dark:text-white' : 'text-transparent',
        className
      )}
      style={{
        ...(!!color &&
          !!(color as GrandientColor).from &&
          !!(color as GrandientColor).to && {
            backgroundImage: `linear-gradient(to right, ${
              (color as GrandientColor).from
            }, ${(color as GrandientColor).to}, ${
              (color as GrandientColor).from
            }, ${(color as GrandientColor).to})`,
          }),
        ...(!!color &&
          !!(color as NormalColor).color && {
            backgroundColor: (color as NormalColor).color,
          }),
      }}
    >
      {user.name}
    </p>
  );
};

export default Username;
