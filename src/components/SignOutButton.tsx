'use client';

import { signOut } from 'next-auth/react';
import { buttonVariants } from './ui/Button';

const SignOutButton = () => {
  return (
    <button
      className={buttonVariants({
        variant: 'destructive',
        className: 'w-full',
      })}
      onClick={() => signOut({ callbackUrl: process.env.NEXT_PUBLIC_MAIN_URL })}
    >
      Đăng xuất
    </button>
  );
};

export default SignOutButton;
