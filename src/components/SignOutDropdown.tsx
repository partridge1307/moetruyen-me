import { FC } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/DropdownMenu';
import UserAvatar from './User/Avatar';
import type { Session } from 'next-auth';
import SignOutButton from './SignOutButton';

interface SignOutDropdownProps {
  session: Session;
}

const SignOutDropdown: FC<SignOutDropdownProps> = ({ session }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar user={session.user} />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <SignOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SignOutDropdown;
