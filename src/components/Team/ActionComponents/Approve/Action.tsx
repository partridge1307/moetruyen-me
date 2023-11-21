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
import { Button } from '@/components/ui/Button';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import type { User } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';

interface ActionProps {
  user: Pick<User, 'id'>;
}

const Action: FC<ActionProps> = ({ user }) => {
  const [type, setType] = useState<'APPROVE' | 'DENY'>();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();

  const { mutate: Approve, isLoading: isApproving } = useMutation({
    mutationKey: ['approve', user.id],
    mutationFn: async () => {
      await axios.post(`/api/team/action`, {
        id: user.id,
        type,
      });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 403)
          return toast({
            title: 'Đã vô Team',
            description: 'Người dùng đã vô Team của bạn',
            variant: 'destructive',
          });
        if (err.response?.status === 406)
          return toast({
            title: 'Đã vô Team khác',
            description: 'Người dùng đã vô Team khác mất rồi',
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

  useEffect(() => {
    if (!!type) setOpen(true);
  }, [type]);

  return (
    <>
      <div className="flex items-center gap-4">
        <Button
          disabled={isApproving}
          isLoading={isApproving}
          variant={'destructive'}
          className="flex-1"
          onClick={() => setType('DENY')}
        >
          <X />
        </Button>
        <Button
          disabled={isApproving}
          isLoading={isApproving}
          className="flex-1"
          onClick={() => setType('APPROVE')}
        >
          <Check />
        </Button>
      </div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yêu cầu xác nhận</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn không?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction disabled={isApproving} onClick={() => Approve()}>
              Chắc chắn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Action;
