'use client';

import { mainURL } from '@/config';
import { signOut } from 'next-auth/react';
import { buttonVariants } from './ui/Button';

const SignOutButton = () => {
  return (
    <button
      className={buttonVariants({
        variant: 'destructive',
        className: 'w-full',
      })}
      onClick={() => signOut({ callbackUrl: mainURL })}
    >
      Đăng xuất
    </button>
  );
};

export default SignOutButton;
