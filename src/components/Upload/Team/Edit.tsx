'use client';

import { Button } from '@/components/ui/Button';
import { Form } from '@/components/ui/Form';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { TeamPayload, TeamValidator } from '@/lib/validators/team';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Team } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import TeamDescFormField from './TeamDescFormField';
import TeamImageFormField from './TeamImageFormField';
import TeamNameFormField from './TeamNameFormField';

interface EditTeamProps {
  team: Pick<Team, 'image' | 'name' | 'description'>;
}

const EditTeam: FC<EditTeamProps> = ({ team }) => {
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const router = useRouter();

  const form = useForm<TeamPayload>({
    resolver: zodResolver(TeamValidator),
    defaultValues: {
      image: team.image,
      name: team.name,
      description: team.description,
    },
  });

  const { mutate: Edit, isLoading: isEditing } = useMutation({
    mutationFn: async (values: TeamPayload) => {
      const { image, name, description } = values;

      const form = new FormData();

      if (image.startsWith('blob')) {
        const blob = await fetch(image).then((res) => res.blob());
        form.append('image', blob, blob.name);
      } else {
        form.append('image', image);
      }

      form.append('name', name);
      form.append('description', description);

      await axios.patch('/api/team', form);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
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
    Edit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-6">
        <TeamImageFormField form={form} />
        <TeamNameFormField form={form} />
        <TeamDescFormField form={form} />

        <Button
          type="submit"
          disabled={isEditing}
          isLoading={isEditing}
          className="w-full"
        >
          Chỉnh sửa
        </Button>
      </form>
    </Form>
  );
};

export default EditTeam;
