'use client';

import type { Account } from '@prisma/client';
import { FC } from 'react';
import { Icons } from '../Icons';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { signIn } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { useRouter } from 'next/navigation';

interface DiscordLinkProps {
  account: Pick<Account, 'providerAccountId'>[];
}

const DiscordLink: FC<DiscordLinkProps> = ({ account }) => {
  const { serverErrorToast, loginToast, successToast } = useCustomToast();
  const router = useRouter();

  const { mutate: Unlink, isLoading: isUnlinking } = useMutation({
    mutationKey: ['unlink-discord'],
    mutationFn: async () => {
      await axios.delete('/api/user');
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 404) return loginToast();
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.refresh();

      return successToast();
    },
  });

  function onCickHandler(type: 'LINK' | 'UNLINK') {
    if (type === 'LINK') {
      signIn('discord');
    } else {
      Unlink();
    }
  }

  return (
    <section className="space-y-2">
      <h1 className="text-lg lg:text-xl font-semibold">Liên kết</h1>
      <div
        className={cn('flex items-center space-x-10 p-2 w-fit rounded-md', {
          'bg-red-700': !account.length,
          'bg-green-700': account.length,
        })}
      >
        <div className="flex items-center space-x-3">
          <Icons.discord className="w-8 h-8 dark:fill-white" />
          <span>{account.length ? 'Đã liên kết' : 'Chưa liên kết'}</span>
        </div>
        <Button
          size={'sm'}
          variant={account.length ? 'destructive' : 'default'}
          disabled={isUnlinking}
          isLoading={isUnlinking}
          onClick={() => onCickHandler(account.length ? 'UNLINK' : 'LINK')}
        >
          {account.length ? 'Gỡ' : 'Liên kết'}
        </Button>
      </div>
    </section>
  );
};

export default DiscordLink;
