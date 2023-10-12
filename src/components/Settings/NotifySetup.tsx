'use client';

import '@/styles/mantine/globals.css';
import classes from '@/styles/mantine/stepper.module.css';
import { Stepper } from '@mantine/core';
import '@mantine/core/styles.layer.css';
import { useMediaQuery } from '@mantine/hooks';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import ServerSetup from './ServerSetup';

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
      classNames={classes}
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
