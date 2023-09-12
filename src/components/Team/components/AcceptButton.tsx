'use client';

import { buttonVariants } from '@/components/ui/Button';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC } from 'react';

interface AcceptButtonProps {
  userId: string;
}

const AcceptButton: FC<AcceptButtonProps> = ({ userId }) => {
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const router = useRouter();

  const { mutate: Handle, isLoading: isHandling } = useMutation({
    mutationFn: async ({
      type,
      userId,
    }: {
      type: 'ACCEPT' | 'REJECT';
      userId: string;
    }) => {
      await axios.put('/api/team', { type, userId });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 406)
          return toast({
            title: 'Không thể thực hiện',
            description: 'Người dùng đã gia nhập Team hoặc Team khác',
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
    <div className="flex justify-end items-center space-x-4">
      <button
        disabled={isHandling}
        className={cn(
          buttonVariants({
            variant: 'destructive',
            size: 'sm',
          }),
          'rounded-full p-1'
        )}
        onClick={() => Handle({ type: 'REJECT', userId })}
      >
        <X />
      </button>

      <button
        disabled={isHandling}
        className={cn(buttonVariants({ size: 'sm' }), 'rounded-full p-1')}
        onClick={() => Handle({ type: 'ACCEPT', userId })}
      >
        <Check />
      </button>
    </div>
  );
};

export default AcceptButton;
