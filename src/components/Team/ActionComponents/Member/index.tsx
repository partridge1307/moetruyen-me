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
} from '@/components/ui/AlertDialog';
import { buttonVariants } from '@/components/ui/Button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/ContextMenu';
import { TabsContent } from '@/components/ui/Tabs';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { User } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import MemberCard from './MemberCard';

interface MemberProps {
  members: Pick<User, 'id' | 'image' | 'banner' | 'name' | 'color'>[];
  isOwner: boolean;
}

const Member: FC<MemberProps> = ({ members, isOwner }) => {
  const router = useRouter();
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; type: 'KICK' | 'CHANGE' }>({
    id: '',
    type: 'KICK',
  });

  useEffect(() => {
    if (!!user.id) {
      setOpen(true);
    }
  }, [user.id]);

  const { mutate: Kick, isLoading: isKicking } = useMutation({
    mutationKey: ['kick'],
    mutationFn: async (id: string) => {
      await axios.post(`/api/team/action/kick`, {
        id,
      });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 403)
          return toast({
            title: 'Bị chặn',
            description: 'Bạn không thể  Kick bản thân',
            variant: 'destructive',
          });
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.refresh();

      return successToast();
    },
  });

  const { mutate: Change, isLoading: isChanging } = useMutation({
    mutationKey: ['change-owner'],
    mutationFn: async (id: string) => {
      await axios.post(`/api/team/action/change-owner`, {
        id,
      });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 403)
          return toast({
            title: 'Bị chặn',
            description: 'Bạn đã là chủ nhóm',
            variant: 'destructive',
          });
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.refresh();

      return successToast();
    },
  });

  return (
    <TabsContent
      value="member"
      forceMount
      className="data-[state=inactive]:hidden p-2 pb-10 rounded-t-md bg-background/30"
    >
      <div className="grid md:grid-cols-3 gap-6">
        {members.map((member, index) => {
          if (!isOwner) return <MemberCard key={index} member={member} />;

          return (
            <ContextMenu key={index}>
              <ContextMenuTrigger>
                <MemberCard member={member} />
              </ContextMenuTrigger>
              <ContextMenuContent className="space-y-3">
                <ContextMenuItem
                  disabled={isKicking || isChanging}
                  className={buttonVariants({
                    className: 'w-full hover:cursor-pointer',
                  })}
                  onClick={() => setUser({ id: member.id, type: 'CHANGE' })}
                >
                  Chuyển Owner
                </ContextMenuItem>
                <ContextMenuItem
                  disabled={isKicking || isChanging}
                  className={buttonVariants({
                    variant: 'destructive',
                    className: 'w-full hover:cursor-pointer',
                  })}
                  onClick={() => setUser({ id: member.id, type: 'KICK' })}
                >
                  Kick
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
      </div>

      {!!isOwner && (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Yêu cầu xác nhận</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn thực hiện hành động này?
              </AlertDialogDescription>

              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isKicking || isChanging}
                  onClick={() =>
                    user.type === 'KICK' ? Kick(user.id) : Change(user.id)
                  }
                >
                  Chắc chắn
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </TabsContent>
  );
};

export default Member;
