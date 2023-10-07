'use client';

import type { DiscordChannel } from '@prisma/client';
import { FC, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/AlertDialog';
import { Button, buttonVariants } from '../ui/Button';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { useRouter } from 'next/navigation';

interface NotifyInfoProps {
  discord: Omit<DiscordChannel, 'userId'>;
}

const NotifyInfo: FC<NotifyInfoProps> = ({ discord }) => {
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const router = useRouter();
  const actionRef = useRef<HTMLButtonElement>(null);

  const { mutate: Delete, isLoading: isDeleting } = useMutation({
    mutationKey: ['delete-discord-notify'],
    mutationFn: async () => {
      await axios.delete('/api/setting');
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.refresh();
      actionRef.current?.click();

      return successToast();
    },
  });

  return (
    <section>
      <h1 className="text-lg lg:text-xl font-semibold">Thông báo Discord</h1>

      <div className="flex flex-wrap justify-between items-center gap-4 my-2">
        <dl className="flex-1 p-1 space-y-1 rounded-md bg-green-800">
          <dt className="text-lg font-semibold">Server</dt>

          <dd className="flex flex-col">
            <span>ID: {discord.serverId}</span>
            <span className="line-clamp-1">Tên: {discord.serverName}</span>
          </dd>
        </dl>

        <dl className="flex-1 p-1 space-y-1 rounded-md bg-green-800">
          <dt className="text-lg font-semibold">Channel</dt>

          <dd className="flex flex-col">
            <span>ID: {discord.channelId}</span>
            <span className="line-clamp-1">Tên: {discord.channelName}</span>
          </dd>
        </dl>

        {!!discord.roleId && !!discord.roleName && (
          <dl className="flex-1 p-1 space-y-1 rounded-md bg-green-800">
            <dt className="text-lg font-semibold">Role</dt>

            <dd className="flex flex-col">
              <span>ID: {discord.roleId}</span>
              <span className="line-clamp-1">Tên: {discord.roleName}</span>
            </dd>
          </dl>
        )}
      </div>

      <AlertDialog>
        <AlertDialogTrigger
          disabled={isDeleting}
          className={buttonVariants({
            variant: 'destructive',
            className: 'w-full mt-2',
          })}
        >
          Gỡ thiết lập
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Bạn có chắc chắn muốn gỡ thông báo?
            </AlertDialogTitle>

            <AlertDialogDescription>Không thể hoàn tác</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className={buttonVariants({ variant: 'destructive' })}
            >
              Hủy
            </AlertDialogCancel>

            <Button
              isLoading={isDeleting}
              disabled={isDeleting}
              onClick={() => Delete()}
            >
              Xóa
            </Button>

            <AlertDialogAction ref={actionRef} className="hidden" />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default NotifyInfo;
