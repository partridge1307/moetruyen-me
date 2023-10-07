'use client';

import type { Badge } from '@prisma/client';
import Image from 'next/image';
import { FC, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';

interface UserBadgeProps {
  badge: Badge;
}

type GradientType = {
  from: string;
  to: string;
};

type NormalType = {
  color: string;
};

const UserBadge: FC<UserBadgeProps> = ({ badge }) => {
  const color = badge.color as GradientType | NormalType;

  const [open, setOpen] = useState(false);

  function onMouseEnterHandler() {
    setTimeout(() => setOpen(true), 300);
  }

  function onMouseLeaveHandler() {
    setOpen(false);
  }

  return (
    <Popover key={badge.id} open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        onMouseEnter={onMouseEnterHandler}
        onMouseLeave={onMouseLeaveHandler}
        className="outline-none flex items-center gap-3 p-2 rounded-md dark:bg-zinc-800"
      >
        <div className="relative w-8 h-8 aspect-square">
          <Image
            sizes="(max-width:640px) 20vw, 15vw"
            width={32}
            height={32}
            quality={40}
            src={badge.image}
            alt={`${badge.name} Icon`}
            className="object-cover"
          />
        </div>

        <p
          className="text-transparent bg-clip-text animate-rainbow"
          style={{
            ...(!!color &&
              !!(color as GradientType).from &&
              !!(color as GradientType).to && {
                backgroundImage: `linear-gradient(to right, ${
                  (color as GradientType).from
                }, ${(color as GradientType).to}, ${
                  (color as GradientType).from
                }, ${(color as GradientType).to})`,
              }),
            ...(!!color &&
              !!(color as NormalType).color && {
                backgroundColor: (color as NormalType).color,
              }),
          }}
        >
          {badge.name}
        </p>
      </PopoverTrigger>

      <PopoverContent sideOffset={7} className="w-fit p-1.5">
        <p className="text-lg font-semibold">{badge.name}</p>
        <p className="text-sm">{badge.description}</p>
      </PopoverContent>
    </Popover>
  );
};

export default UserBadge;
