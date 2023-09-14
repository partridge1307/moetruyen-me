import type { Account, DiscordChannel } from '@prisma/client';
import dynamic from 'next/dynamic';
import { FC } from 'react';

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
  account: Pick<Account, 'providerAccountId'>[];
}

const NotifyDiscChannel: FC<NotifyDiscChannelProps> = ({
  channel,
  account,
}) => {
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
        ) : !!!account.length ? (
          <p className="text-red-500">
            Yêu cầu liên kết Discord để sử dụng tính năng này
          </p>
        ) : (
          <p className="text-red-500">Chưa có liên kết</p>
        )}
        {!!channel && <StepperChannelLink />}
      </div>
    </section>
  );
};

export default NotifyDiscChannel;
