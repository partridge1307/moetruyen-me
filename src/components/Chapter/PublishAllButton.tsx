'use client';

import { FC } from 'react';
import { Button } from '../ui/Button';
import { PublishAll } from './Action';

interface PublishAllButtonProps {
  mangaId: number;
}

const PublishAllButton: FC<PublishAllButtonProps> = ({ mangaId }) => {
  const publishWithId = PublishAll.bind(null, mangaId);

  return (
    <form action={publishWithId}>
      <Button type="submit">Publish tất cả</Button>
    </form>
  );
};

export default PublishAllButton;
