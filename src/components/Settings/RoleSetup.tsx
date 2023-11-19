'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { FC, memo, useState } from 'react';
import { Button } from '../ui/Button';
import { TInfo } from './NotifySetup';

interface RoleSetupProps {
  roles?: TInfo[];
  // eslint-disable-next-line no-unused-vars
  setActive: (value: number) => void;
  server?: TInfo;
  channel?: TInfo;
}

const RoleSetup: FC<RoleSetupProps> = ({
  roles,
  setActive,
  server,
  channel,
}) => {
  const {
    loginToast,
    notFoundToast,
    serverErrorToast,
    successToast,
    discordNotFoundToast,
    discordErrorToast,
  } = useCustomToast();
  const [roleSelected, setRole] = useState<TInfo>();
  const router = useRouter();

  const { mutate: Setup, isLoading: isSetting } = useMutation({
    mutationKey: ['notify-discord-request'],
    mutationFn: async () => {
      await axios.put('/api/setting', { server, channel, role: roleSelected });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 406)
          return toast({
            title: 'Đã tồn tại',
            description: 'Bạn đã thiết lập thông báo trước đó',
            variant: 'destructive',
          });
        if (err.response?.status === 403 || err.response?.status === 503) {
          if (err.response?.status === 403) discordNotFoundToast();
          if (err.response.status === 503) discordErrorToast();

          router.push('/settings');
          router.refresh();
          return;
        }
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.push('/settings');
      router.refresh();

      successToast();
    },
  });

  return (
    <div className="space-y-14">
      <ul className="flex flex-col gap-3 max-h-72 overflow-auto scrollbar dark:scrollbar--dark">
        {!!roles?.length ? (
          roles.map((role) => (
            <li
              key={role.id}
              className={cn(
                'flex max-sm:flex-col justify-between p-2 transition-colors rounded-md bg-background hover:bg-background/70 cursor-pointer',
                {
                  'dark:bg-green-700 dark:hover:bg-green-700/90 order-first':
                    role.id === roleSelected?.id,
                }
              )}
              onClick={() => setRole(role)}
            >
              <span>ID: {role.id}</span>
              <span>Tên: {role.name}</span>
            </li>
          ))
        ) : (
          <li>Không tìm thấy Role</li>
        )}
      </ul>

      <div className="flex justify-end items-center gap-6">
        <Button
          variant={'destructive'}
          disabled={isSetting}
          onClick={() => setActive(1)}
        >
          Quay lại
        </Button>
        <Button
          isLoading={isSetting}
          disabled={isSetting || !server || !channel}
          onClick={() => Setup()}
        >
          Xong
        </Button>
      </div>
    </div>
  );
};

export default memo(RoleSetup);
