'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { FC, memo, useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TInfo } from './NotifySetup';

interface ServerSetupProps {
  // eslint-disable-next-line no-unused-vars
  setActive: (value: number) => void;
  server?: TInfo;
  // eslint-disable-next-line no-unused-vars
  setServer: (value: TInfo) => void;
}

const ServerSetup: FC<ServerSetupProps> = ({
  setActive,
  server: serverSelected,
  setServer,
}) => {
  const {
    loginToast,
    notFoundToast,
    serverErrorToast,
    discordNotFoundToast,
    discordErrorToast,
  } = useCustomToast();
  const [serverId, setServerId] = useState('');

  const { data: servers, isFetching: isFetchingServers } = useQuery({
    queryKey: ['fetch-discord-server'],
    queryFn: async () => {
      const { data } = await axios.get('/api/setting');

      return data as TInfo[];
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
    refetchOnWindowFocus: false,
  });

  return (
    <div className="space-y-14">
      <div className="space-y-6">
        <ul className="flex flex-col gap-3 max-h-72 overflow-auto scrollbar dark:scrollbar--dark">
          {!!servers?.length ? (
            servers.map((server) => (
              <li
                key={server.id}
                className={cn(
                  'flex max-sm:flex-col justify-between p-2 transition-colors rounded-md bg-background hover:bg-background/70 cursor-pointer',
                  {
                    'dark:bg-green-700 dark:hover:bg-green-700/90 order-first':
                      server.id === serverSelected?.id,
                  }
                )}
                onClick={() => setServer(server)}
              >
                <span>ID: {server.id}</span>
                <span>Tên: {server.name}</span>
              </li>
            ))
          ) : isFetchingServers ? (
            <li>Đang tìm kiếm</li>
          ) : (
            <li>Không tìm thấy Channel</li>
          )}
        </ul>

        {isFetchingServers && <Loader2 className="w-10 h-10 animate-spin" />}

        <div className="space-y-2">
          <p>Bạn không tìm thấy Server bạn muốn? Hãy thử nhập ID Server</p>

          <Input
            placeholder="ID Server"
            value={serverId}
            onChange={(e) => setServerId(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          disabled={!serverSelected || (!serverSelected && !serverId)}
          onClick={() => {
            if (serverId && !serverSelected) {
              setServer({ id: serverId, name: 'Server' });
            }

            setActive(1);
          }}
        >
          Tiếp
        </Button>
      </div>
    </div>
  );
};

export default memo(ServerSetup);
