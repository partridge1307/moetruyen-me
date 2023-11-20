'use client';

import TeamImageSkeleton from '@/components/Skeleton/TeamImageSkeleton';
import { Button } from '@/components/ui/Button';
import { Form } from '@/components/ui/Form';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { TeamPayload, TeamValidator } from '@/lib/validators/team';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import TeamDescFormField from './TeamDescFormField';
import TeamNameFormField from './TeamNameFormField';
import { toast } from '@/hooks/use-toast';

const TeamImageFormField = dynamic(() => import('./TeamImageFormField'), {
  ssr: false,
  loading: () => <TeamImageSkeleton />,
});

const CreateTeam = () => {
  const { loginToast, verifyToast, serverErrorToast, successToast } =
    useCustomToast();
  const router = useRouter();

  const form = useForm<TeamPayload>({
    resolver: zodResolver(TeamValidator),
  });

  const { mutate: Create, isLoading: isCreating } = useMutation({
    mutationFn: async (values: TeamPayload) => {
      const { image, name, description } = values;

      const form = new FormData();

      if (image.startsWith('blob')) {
        const blob = await fetch(image).then((res) => res.blob());
        if (blob.size > 4 * 1000 * 1000) throw new Error('EXCEEDED_IMAGE_SIZE');

        form.append('image', blob, blob.name);
      } else {
        form.append('image', image);
      }

      form.append('name', name);
      form.append('description', description);

      await axios.post('/api/team', form);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 409) return verifyToast();
      }

      if (err instanceof Error) {
        return toast({
          title: 'Quá kích cỡ',
          description: 'Chỉ nhận ảnh dưới 4MB',
          variant: 'destructive',
        });
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.push('/team');
      router.refresh();

      return successToast();
    },
  });

  function onSubmitHandler(values: TeamPayload) {
    Create(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <TeamImageFormField form={form} />

        <TeamNameFormField form={form} />

        <TeamDescFormField form={form} />

        <div className="flex flex-wrap justify-end items-center gap-8">
          <Button
            type="button"
            tabIndex={0}
            variant={'destructive'}
            onClick={() => router.back()}
          >
            Quay lại
          </Button>
          <Button
            type="submit"
            tabIndex={1}
            disabled={isCreating}
            isLoading={isCreating}
          >
            Tạo Team
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateTeam;
