import type { DiscordChannel } from '@prisma/client';
import { FC } from 'react';
import dynamic from 'next/dynamic';

const StepperChannelLink = dynamic(() => import('./StepperChannelLink'), {
  ssr: false,
  loading: () => (
    <div className="h-10 rounded-md animate-pulse dark:bg-zinc-900" />
  ),
});

interface NotifyDiscChannelProps {
  channel: Pick<
    DiscordChannel,
    | 'serverId'
    | 'serverName'
    | 'channelName'
    | 'channelId'
    | 'roleId'
    | 'roleName'
  > | null;
}

const NotifyDiscChannel: FC<NotifyDiscChannelProps> = ({ channel }) => {
  return (
    <section className="space-y-2">
      <h1 className="text-lg lg:text-xl font-semibold">Thông báo Discord</h1>
      <div className="space-y-4">
        {channel ? (
          <div className="flex flex-wrap justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-lg font-medium">Server</h2>
              <div className="p-2 rounded-md dark:bg-zinc-800">
                <p>
                  ID: <span>{channel.serverId}</span>
                </p>
                <p className="text-sm line-clamp-1">
                  Tên: <span>{channel.serverName}</span>
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-medium">Channel</h2>
              <div className="p-2 rounded-md dark:bg-zinc-800">
                <p>
                  ID: <span>{channel.channelId}</span>
                </p>
                <p className="text-sm line-clamp-1">
                  Tên: <span>{channel.channelName}</span>
                </p>
              </div>
            </div>

            {channel.roleId && channel.roleName && (
              <div className="space-y-1">
                <h2 className="text-lg font-medium">Role</h2>
                <div className="p-2 rounded-md dark:bg-zinc-800">
                  <p>
                    ID: <span>{channel.roleId}</span>
                  </p>
                  <p className="text-sm line-clamp-1">
                    Tên: <span>{channel.roleName}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-red-500">Chưa có liên kết</p>
        )}
        <StepperChannelLink />
      </div>
    </section>
  );
};

export default NotifyDiscChannel;
