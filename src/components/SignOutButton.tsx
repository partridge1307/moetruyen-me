'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

const SignOutButton = () => {
  return (
    <button onClick={() => signOut()}>
      <LogOut className="w-6 h-6 text-red-500" />
    </button>
  );
};

export default SignOutButton;
