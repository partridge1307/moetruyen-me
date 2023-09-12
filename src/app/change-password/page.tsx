'use client';

import { Button } from '@/components/ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import {
  UserPasswordChangePayload,
  UserPasswordChangeValidator,
} from '@/lib/validators/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

const ChangePassword = () => {
  const { loginToast, notFoundToast, serverErrorToast } = useCustomToast();
  const router = useRouter();

  const form = useForm<UserPasswordChangePayload>({
    resolver: zodResolver(UserPasswordChangeValidator),
  });

  const { mutate: Change, isLoading: isChanging } = useMutation({
    mutationFn: async (values: UserPasswordChangePayload) => {
      await axios.patch('/api/user', values);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 406)
          return toast({
            title: 'Không hợp lệ',
            description: 'Mật khẩu không chính xác',
            variant: 'destructive',
          });
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.refresh();
    },
  });

  function onSubmitHandler(values: UserPasswordChangePayload) {
    Change(values);
  }

  return (
    <main className="container lg:w-2/3 p-2 mb-10 rounded-md dark:bg-zinc-900/60">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitHandler)}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu cũ</FormLabel>
                <FormMessage />
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Mật khẩu cũ của bạn"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu mới</FormLabel>
                <FormMessage />
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Mật khẩu mới của bạn"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Xác nhận lại mật khẩu</FormLabel>
                <FormMessage />
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Xác nhận lại mật khẩu"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button disabled={isChanging} isLoading={isChanging} type="submit">
            Đổi mật khẩu
          </Button>
        </form>
      </Form>
    </main>
  );
};

export default ChangePassword;
