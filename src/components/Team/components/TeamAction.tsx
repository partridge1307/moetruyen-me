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
import { useCustomToast } from '@/hooks/use-custom-toast';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';

const TeamAction = () => {
  const { loginToast, serverErrorToast, successToast } = useCustomToast();
  const router = useRouter();

  const { mutate: Leave, isLoading: isLeaving } = useMutation({
    mutationKey: ['team-leave-query'],
    mutationFn: async () => {
      await axios.delete('/api/team/member');
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.refresh();

      return successToast();
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger
        disabled={isLeaving}
        className={buttonVariants({ variant: 'destructive' })}
      >
        Rời Team
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn rời?</AlertDialogTitle>
          <AlertDialogDescription>Không thể hoàn tác</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            className={buttonVariants({ variant: 'destructive' })}
          >
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction disabled={isLeaving} onClick={() => Leave()}>
            Chắc chắn
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TeamAction;
