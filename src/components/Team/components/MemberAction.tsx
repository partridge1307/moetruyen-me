'use client';

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
} from '@/components/ui/AlertDialog';
import { buttonVariants } from '@/components/ui/Button';
import { ContextMenuItem } from '@/components/ui/ContextMenu';
import { mainURL } from '@/config';
import { useCustomToast } from '@/hooks/use-custom-toast';
import type { User } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FC, useRef } from 'react';

interface MemberActionProps {
  sessionUserId: string;
  ownerId: string;
  user: Pick<User, 'id' | 'name'>;
}

const MemberAction: FC<MemberActionProps> = ({
  sessionUserId,
  ownerId,
  user,
}) => {
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const router = useRouter();
  const ref = useRef<HTMLButtonElement>(null);

  const { mutate: Kick, isLoading: isKicing } = useMutation({
    mutationKey: ['kick-member-query', user.id],
    mutationFn: async () => {
      await axios.post(`/api/team/member`, { userId: user.id });
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

      return successToast();
    },
  });

  const { mutate: Change, isLoading: isChanging } = useMutation({
    mutationKey: ['change-owner-query', user.id],
    mutationFn: async () => {
      await axios.patch(`/api/team/member`, { userId: user.id });
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

      return successToast();
    },
  });

  return (
    <>
      {sessionUserId === ownerId ? (
        <>
          <ContextMenuItem
            className="hover:cursor-pointer"
            disabled={isKicing || isChanging}
            onClick={() => Kick()}
          >
            Kick
          </ContextMenuItem>
          <ContextMenuItem
            className="hover:cursor-pointer"
            disabled={isKicing || isChanging}
            onClick={(e) => {
              e.preventDefault();
              ref.current?.click();
            }}
          >
            Chuyển quyền
          </ContextMenuItem>
        </>
      ) : (
        <ContextMenuItem className="hover:cursor-pointer">
          <Link href={`${mainURL}/user/${user.name?.split(' ').join('-')}`}>
            Xem thông tin
          </Link>
        </ContextMenuItem>
      )}

      <AlertDialog>
        <AlertDialogTrigger
          ref={ref}
          disabled={isChanging}
          className="hidden"
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Bạn có chắc chắc muốn chuyển quyền?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Sau khi chuyển sẽ không thể hoàn tác
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              className={buttonVariants({ variant: 'destructive' })}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction disabled={isChanging} onClick={() => Change()}>
              Chắc chắn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MemberAction;
