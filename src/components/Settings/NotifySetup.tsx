'use client';

import { Stepper } from '@mantine/core';
import { useState } from 'react';
import ServerSetup from './ServerSetup';
import { useMediaQuery } from '@mantine/hooks';
import dynamic from 'next/dynamic';

const ChannelSetup = dynamic(() => import('./ChannelSetup'), {
  ssr: false,
  loading: () => (
    <div className="h-[660px] md:h-[500px] animate-pulse rounded-md bg-background" />
  ),
});
const RoleSetup = dynamic(() => import('./RoleSetup'), {
  ssr: false,
  loading: () => (
    <div className="h-[660px] md:h-[500px] animate-pulse rounded-md bg-background" />
  ),
});

export type TInfo = {
  id: string;
  name: string;
};

const NotifySetup = () => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [active, setActive] = useState(0);
  const [server, setServer] = useState<TInfo>();
  const [channel, setChannel] = useState<TInfo>();
  const [roles, setRoles] = useState<TInfo[]>();

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
        label="Server"
        description="Chọn Server bạn muốn thông báo"
        allowStepSelect={false}
      >
        <ServerSetup
          setActive={setActive}
          server={server}
          setServer={setServer}
        />
      </Stepper.Step>

      <Stepper.Step
        label="Channel"
        description="Chọn Channel bạn muốn thông báo"
        allowStepSelect={false}
      >
        <ChannelSetup
          setActive={setActive}
          server={server}
          setServer={setServer}
          channel={channel}
          setChannel={setChannel}
          setRoles={setRoles}
        />
      </Stepper.Step>

      <Stepper.Step
        label="Role"
        description="Chọn Role bạn muốn thông báo"
        allowStepSelect={false}
      >
        <RoleSetup
          setActive={setActive}
          roles={roles}
          server={server}
          channel={channel}
        />
      </Stepper.Step>
    </Stepper>
  );
};

export default NotifySetup;
