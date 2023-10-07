'use client';

import { FC, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/Dialog';
import { buttonVariants } from '../ui/Button';
import TOTPForm from './TOTPForm';
import { useRouter } from 'next/navigation';
import { DialogClose } from '@radix-ui/react-dialog';

interface DisableTwoFactModalProps {}

const DisableTwoFactModal: FC<DisableTwoFactModalProps> = ({}) => {
  const router = useRouter();
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <Dialog>
      <DialogTrigger className={buttonVariants({ variant: 'destructive' })}>
        Tắt bảo mật 2 lớp
      </DialogTrigger>

      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Tắt bảo mật 2 lớp</DialogTitle>
        </DialogHeader>

        <TOTPForm
          type="DISABLE"
          onDone={() => {
            router.refresh();
            ref.current?.click();
          }}
        />

        <DialogClose ref={ref} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};

export default DisableTwoFactModal;
