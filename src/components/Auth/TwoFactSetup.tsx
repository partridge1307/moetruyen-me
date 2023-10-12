'use client';

import classes from '@/styles/mantine/stepper.module.css';
import { Stepper } from '@mantine/core';
import '@mantine/core/styles.layer.css';
import { useMediaQuery } from '@mantine/hooks';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import TwoFactForm from './TwoFactForm';
import '@/styles/mantine/globals.css';

const QrStepper = dynamic(() => import('./QrStepper'), {
  ssr: false,
  loading: () => (
    <div className="h-[30rem] md:h-96 rounded-md animate-pulse bg-background" />
  ),
});
const TOTPForm = dynamic(() => import('./TOTPForm'), {
  ssr: false,
  loading: () => (
    <div className="h-48 rounded-md animate-pulse bg-background" />
  ),
});

const TwoFactSetup = () => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const router = useRouter();

  const [active, setActive] = useState(0);
  const [keyUri, setKeyUri] = useState('');

  return (
    <Stepper
      active={active}
      onStepClick={setActive}
      orientation={isMobile ? 'vertical' : 'horizontal'}
      classNames={classes}
    >
      <Stepper.Step
        label="Thiết lập"
        description="Thiết lập 2 lớp"
        allowStepSelect={false}
      >
        <TwoFactForm setActive={setActive} setKeyUri={setKeyUri} />
      </Stepper.Step>

      <Stepper.Step
        label="Kết nối"
        description="Kết nối 2 lớp"
        allowStepSelect={false}
      >
        <QrStepper keyUri={keyUri} setActive={setActive} />
      </Stepper.Step>

      <Stepper.Step
        label="Xác nhận"
        description="Xác nhận 2 lớp"
        allowStepSelect={false}
      >
        <TOTPForm
          type="ENABLE"
          onDone={() => {
            router.push('/settings');
            router.refresh();
          }}
        />
      </Stepper.Step>
    </Stepper>
  );
};

export default TwoFactSetup;
