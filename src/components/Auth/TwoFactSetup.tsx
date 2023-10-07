'use client';

import { Stepper } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import TwoFactForm from './TwoFactForm';
import { useRouter } from 'next/navigation';

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
  const [dataUri, setDataUri] = useState('');
  const [keyUri, setKeyUri] = useState('');

  return (
    <Stepper
      active={active}
      onStepClick={setActive}
      orientation={isMobile ? 'vertical' : 'horizontal'}
      styles={{
        content: {
          '& > *': {
            paddingTop: '2rem',
          },
        },
        stepIcon: {
          'html.dark &[data-completed]': {
            borderColor: 'rgb(249, 115, 22)',
            backgroundColor: 'rgb(249, 115, 22)',
          },
          'html.dark &[data-progress]': {
            borderColor: 'rgb(249, 115, 22)',
            backgroundColor: 'white',
            color: 'black',
          },
          'html.dark &': {
            backgroundColor: 'transparent',
            color: 'white',
          },
        },
        separatorActive: {
          backgroundColor: 'rgb(249, 115, 22)',
        },
        verticalSeparatorActive: {
          borderColor: 'rgb(249, 115, 22)',
        },
        stepBody: {
          gap: '0.25rem',
        },
        stepLabel: {
          'html.dark &': {
            color: 'white',
            fontSize: '1.125rem',
            fontWeight: 600,
          },
        },
        stepDescription: {
          'html.dark &': {
            color: 'rgb(255, 255, 255, 0.75)',
          },
        },
      }}
    >
      <Stepper.Step
        label="Thiết lập"
        description="Thiết lập 2 lớp"
        allowStepSelect={false}
      >
        <TwoFactForm
          setActive={setActive}
          setDataUri={setDataUri}
          setKeyUri={setKeyUri}
        />
      </Stepper.Step>

      <Stepper.Step
        label="Kết nối"
        description="Kết nối 2 lớp"
        allowStepSelect={false}
      >
        <QrStepper dataUri={dataUri} keyUri={keyUri} setActive={setActive} />
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
