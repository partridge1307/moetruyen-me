'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { TwoFactorPayload, TwoFactorValidator } from '@/lib/validators/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/Form';
import { Input } from '../ui/Input';

interface TwoFactFormProps {
  // eslint-disable-next-line no-unused-vars
  setActive: (value: number) => void;
  // eslint-disable-next-line no-unused-vars
  setDataUri: (value: string) => void;
  // eslint-disable-next-line no-unused-vars
  setKeyUri: (value: string) => void;
}

const TwoFactForm: FC<TwoFactFormProps> = ({
  setActive,
  setDataUri,
  setKeyUri,
}) => {
  const { loginToast, notFoundToast, serverErrorToast } = useCustomToast();

  const form = useForm<TwoFactorPayload>({
    resolver: zodResolver(TwoFactorValidator),
    defaultValues: {
      password: '',
    },
  });

  const { mutate: Setup, isLoading: isSetting } = useMutation({
    mutationKey: ['two-factor-setup'],
    mutationFn: async (values: TwoFactorPayload) => {
      const { data } = await axios.post('/api/auth/two-factor/setup', values);

      return data as { keyUri: string; dataUri: string };
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 403)
          return toast({
            title: 'Không thể thực hiện',
            description: 'Bạn đã bật bảo mật 2 lớp rồi',
            variant: 'destructive',
          });
      }

      return serverErrorToast();
    },
    onSuccess: (data) => {
      setDataUri(data.dataUri);
      setKeyUri(data.keyUri);
      return setActive(1);
    },
  });

  function onSubmitHandler(values: TwoFactorPayload) {
    Setup(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmitHandler)}
        className="space-y-10"
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu của bạn</FormLabel>
              <FormMessage />
              <FormControl>
                <Input type="password" placeholder="Mật khẩu" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex flex-wrap justify-end items-center gap-6">
          <Button type="submit" isLoading={isSetting} disabled={isSetting}>
            Tiếp
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TwoFactForm;
