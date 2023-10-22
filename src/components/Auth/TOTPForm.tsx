'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { TOTPPayload, TOTPValidator } from '@/lib/validators/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { PinInput } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '../ui/Form';
import '@/styles/mantine/globals.css';

interface TOTPFormProps {
  type: 'ENABLE' | 'DISABLE';
  onDone: () => void;
}

const TOTPForm: FC<TOTPFormProps> = ({ type, onDone }) => {
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();

  const form = useForm<TOTPPayload>({
    resolver: zodResolver(TOTPValidator),
    defaultValues: {
      totp: '',
    },
  });

  const { mutate: Enable, isLoading: isEnabling } = useMutation({
    mutationKey: ['two-factor-enable'],
    mutationFn: async (values: TOTPPayload) => {
      await axios.post(
        `/api/auth/two-factor/${type === 'ENABLE' ? 'enable' : 'disable'}`,
        values
      );
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 406)
          return toast({
            title: 'Yêu cầu thiết lập',
            description: 'Yêu cầu thiết lập bảo mật 2 lớp. Vui lòng thử lại',
            variant: 'destructive',
          });
        if (err.response?.status === 400)
          return toast({
            title: 'OTP Không hợp lệ',
            description: 'OTP không chính xác. Vui lòng thử lại',
            variant: 'destructive',
          });
        if (err.response?.status === 403) {
          if (type === 'ENABLE')
            return toast({
              title: 'Không thể thực hiện',
              description: 'Bạn đã bật bảo mật 2 lớp rồi',
              variant: 'destructive',
            });
          else
            return toast({
              title: 'Không thể thực hiện',
              description: 'Bạn chưa bật bảo mật 2 lớp',
              variant: 'destructive',
            });
        }
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      successToast();

      return onDone();
    },
  });

  function onSubmitHandler(values: TOTPPayload) {
    Enable(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <FormField
          control={form.control}
          name="totp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mã xác nhận</FormLabel>
              <FormDescription>
                Kiểm tra trong Goggle Authenticator
              </FormDescription>

              <FormControl>
                <PinInput
                  length={6}
                  type={'number'}
                  oneTimeCode
                  aria-label="one time code"
                  onChange={(value) => field.onChange(value)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" isLoading={isEnabling} disabled={isEnabling}>
            Xong
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TOTPForm;
