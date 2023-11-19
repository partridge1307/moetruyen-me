'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { FC, memo } from 'react';
import { Button } from '../ui/Button';
import { TInfo } from './NotifySetup';

interface ChannelSetupProps {
  // eslint-disable-next-line no-unused-vars
  setActive: (value: number) => void;
  server?: Pick<TInfo, 'id'>;
  // eslint-disable-next-line no-unused-vars
  setServer: (value: TInfo) => void;
  channel?: TInfo;
  // eslint-disable-next-line no-unused-vars
  setChannel: (value: TInfo) => void;
  // eslint-disable-next-line no-unused-vars
  setRoles: (values: TInfo[]) => void;
}

const ChannelSetup: FC<ChannelSetupProps> = ({
  setActive,
  server,
  setServer,
  channel: channelSelected,
  setChannel,
  setRoles,
}) => {
  const {
    loginToast,
    notFoundToast,
    serverErrorToast,
    discordNotFoundToast,
    discordErrorToast,
  } = useCustomToast();

  const { data: metaData, isFetching: isFetchingChannel } = useQuery({
    queryKey: ['fetch-discord-channel'],
    queryFn: async () => {
      const { data } = await axios.post('/api/setting', { id: server?.id });

      return data as { name: string; channels: TInfo[]; roles: TInfo[] };
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
        if (err.response?.status === 409) return discordNotFoundToast();
        if (err.response?.status === 503) return discordErrorToast();
      }

      return serverErrorToast();
    },
    onSuccess: (data) => {
      setServer({ id: server?.id!, name: data.name });
      setRoles(data.roles);
    },
    refetchOnWindowFocus: false,
  });
  return (
    <div className="space-y-14">
      <ul className="flex flex-col gap-3 max-h-72 overflow-auto scrollbar dark:scrollbar--dark">
        {!!metaData && metaData.channels.length ? (
          metaData.channels.map((channel) => (
            <li
              key={channel.id}
              className={cn(
                'flex max-sm:flex-col justify-between p-2 transition-colors rounded-md bg-background hover:bg-background/70 cursor-pointer',
                {
                  'dark:bg-green-700 dark:hover:bg-green-700/90 order-first':
                    channel.id === channelSelected?.id,
                }
              )}
              onClick={() => setChannel(channel)}
            >
              <span>ID: {channel.id}</span>
              <span>Tên: {channel.name}</span>
            </li>
          ))
        ) : isFetchingChannel ? (
          <li>Đang tìm kiếm</li>
        ) : (
          <li>Không tìm thấy Channel</li>
        )}
      </ul>

      {isFetchingChannel && <Loader2 className="w-10 h-10 animate-spin" />}

      <div className="flex justify-end items-center gap-6">
        <Button variant={'destructive'} onClick={() => setActive(0)}>
          Quay lại
        </Button>
        <Button disabled={!channelSelected} onClick={() => setActive(2)}>
          Tiếp
        </Button>
      </div>
    </div>
  );
};

export default memo(ChannelSetup);
