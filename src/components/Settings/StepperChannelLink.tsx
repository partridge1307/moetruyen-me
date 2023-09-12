'use client';

import { Button, buttonVariants } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { cn } from '@/lib/utils';
import { Stepper } from '@mantine/core';
import { DialogClose } from '@radix-ui/react-dialog';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { AtSign, Hash, Loader2, Search, Server } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';

interface StepperChannelLinkProps {}

const StepperChannelLink: FC<StepperChannelLinkProps> = ({}) => {
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();
  const router = useRouter();

  const [active, setActive] = useState(0);
  const [isAllowNextStep, setAllowNextStep] = useState(false);
  const [highestStepVisited, setHighestStepVisited] = useState(active);
  const [serverSelected, setServer] = useState<{ id: string; name: string }>();
  const [serverId, setServerId] = useState('');
  const [channelSelected, setChannel] = useState<{
    id: string;
    name: string;
  }>();
  const [roleSelected, setRole] = useState<{ id: string; name: string }>();
  const [canDone, setCanDone] = useState(false);

  const { data: servers, isFetching: isFetchingServers } = useQuery({
    queryKey: ['fetch-servers'],
    queryFn: async () => {
      const { data } = await axios.get('/api/setting');

      return data as { id: string; name: string }[];
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
  });

  const {
    data: ServerData,
    mutate: FetchChannels,
    isLoading: isFetchingChannels,
  } = useMutation({
    mutationKey: ['fetch-channels'],
    mutationFn: async (id: string) => {
      const { data } = await axios.get(`/api/setting/${id}`);

      return data as {
        channels: { id: string; name: string }[];
        roles: { id: string; name: string }[];
      };
    },
  });

  const { mutate: ChannelRequest, isLoading: isRequesting } = useMutation({
    mutationKey: ['channel-link-request'],
    mutationFn: async () => {
      await axios.post('/api/setting', {
        server: serverSelected,
        channel: channelSelected,
        role: roleSelected,
      });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      router.refresh();
      setServer(undefined);
      setChannel(undefined);
      setRole(undefined);
      setActive(0);

      return successToast();
    },
  });

  useEffect(() => {
    if (serverSelected) {
      FetchChannels(serverSelected.id);
    }
  }, [FetchChannels, serverSelected]);

  useEffect(() => {
    if (!!serverSelected && !!channelSelected) {
      setCanDone(true);
    } else {
      setCanDone(false);
    }
  }, [channelSelected, serverSelected]);

  const handleStepChange = (nextStep: number) => {
    if (nextStep > 3 || nextStep < 0) return;

    setActive(nextStep);
    setAllowNextStep((prev) => !prev);
    setHighestStepVisited((hsc) => Math.max(hsc, nextStep));
  };

  const shouldAllowSelectStep = (step: number) =>
    highestStepVisited >= step && active !== step;

  return (
    <Dialog>
      <DialogTrigger
        disabled={isRequesting}
        className={cn(buttonVariants(), 'w-full')}
      >
        Liên kết
      </DialogTrigger>
      <DialogContent className="dark:bg-zinc-900">
        <Stepper
          active={active}
          onStepClick={(step) => {
            setActive(step);

            highestStepVisited > step
              ? setAllowNextStep(true)
              : setAllowNextStep(false);
          }}
          styles={{
            stepLabel: {
              '&': {
                fontSize: '0.875rem',
                lineHeight: '1.25rem',
                color: 'white',
              },
            },
            stepIcon: {
              '&': {
                backgroundColor: 'rgb(249, 115, 22, 0.75)',
                color: 'white',
                borderColor: 'transparent',
              },
              '&[data-progress="true"]': {
                backgroundColor: 'rgb(249, 115, 22)',
                borderColor: 'white',
              },
              '&[data-completed="true"]': {
                backgroundColor: 'rgb(249, 115, 22)',
                borderColor: 'white',
              },
            },
            separator: {
              '&': {
                backgroundColor: 'transparent',
              },
            },
          }}
        >
          <Stepper.Step
            icon={<Server className="w-5 h-5" />}
            label="Chọn Server"
            allowStepSelect={shouldAllowSelectStep(0)}
          >
            <div className="space-y-4">
              {!!servers?.length ? (
                <ul className="flex flex-col gap-3 max-h-60 overflow-auto">
                  {servers.map((server) => (
                    <li
                      key={server.id}
                      className={cn(
                        'p-2 rounded-md cursor-pointer transition-colors dark:bg-zinc-800 hover:dark:bg-zinc-800/80',
                        {
                          'order-first dark:bg-green-700 hover:dark:bg-green-700/80':
                            server === serverSelected,
                        }
                      )}
                      onClick={() => {
                        setServer(server);
                        setAllowNextStep(true);
                      }}
                    >
                      <p>
                        ID: <span>{server.id}</span>
                      </p>
                      <p className="text-sm line-clamp-1">
                        Tên: <span>{server.name}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              ) : isFetchingServers ? (
                <span className="flex justify-center">
                  <Loader2 className="w-10 h-10 animate-spin" />
                </span>
              ) : (
                <p>Không tìm thấy Server</p>
              )}

              <div className="space-y-1">
                <p>Không có Server bạn muốn?</p>
                <div className="flex items-center gap-2">
                  <Input
                    className="h-9"
                    placeholder="ID Server"
                    value={serverId}
                    onChange={(e) => setServerId(e.target.value)}
                  />
                  <Button
                    size={'sm'}
                    disabled={isFetchingServers || !serverId.length}
                    isLoading={isFetchingChannels}
                    onClick={() => {
                      setServer({ id: serverId, name: 'Server' });
                      setServerId('');
                      setAllowNextStep(true);
                      handleStepChange(active + 1);
                    }}
                  >
                    <Search className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </Stepper.Step>

          <Stepper.Step
            icon={<Hash className="w-5 h-5" />}
            label="Chọn Channel"
            allowStepSelect={shouldAllowSelectStep(1)}
          >
            {ServerData?.channels.length ? (
              <ul className="flex flex-col gap-3 max-h-60 overflow-auto">
                {ServerData.channels.map((channel) => (
                  <li
                    key={channel.id}
                    className={cn(
                      'p-2 rounded-md cursor-pointer transition-colors dark:bg-zinc-800 hover:dark:bg-zinc-800/80',
                      {
                        'order-first dark:bg-green-700 hover:dark:bg-green-700/80':
                          channel === channelSelected,
                      }
                    )}
                    onClick={() => {
                      setChannel(channel);
                      setAllowNextStep(true);
                    }}
                  >
                    <p>
                      ID: <span>{channel.id}</span>
                    </p>
                    <p className="text-sm line-clamp-1">
                      Tên: <span>{channel.name}</span>
                    </p>
                  </li>
                ))}
              </ul>
            ) : isFetchingChannels ? (
              <span className="flex justify-center">
                <Loader2 className="w-10 h-10 animate-spin" />
              </span>
            ) : (
              <p>Không tìm thấy Channel</p>
            )}
          </Stepper.Step>

          <Stepper.Step
            icon={<AtSign className="w-5 h-5" />}
            label="Chọn Role"
            allowStepSelect={shouldAllowSelectStep(2)}
          >
            {ServerData?.roles.length ? (
              <ul>
                {ServerData.roles.map((role) => (
                  <li
                    key={role.id}
                    className={cn(
                      'p-2 rounded-md cursor-pointer transition-colors dark:bg-zinc-800 hover:dark:bg-zinc-800/80',
                      {
                        'order-first dark:bg-green-700 hover:dark:bg-green-700/80':
                          role === roleSelected,
                      }
                    )}
                    onClick={() => {
                      setRole(role);
                      setAllowNextStep(true);
                    }}
                  >
                    <p>
                      ID: <span>{role.id}</span>
                    </p>
                    <p>
                      Tên: <span>{role.name}</span>
                    </p>
                  </li>
                ))}
              </ul>
            ) : isFetchingChannels ? (
              <span className="flex justify-center">
                <Loader2 className="w-10 h-10 animate-spin" />
              </span>
            ) : (
              <p>Không tìm thấy Role</p>
            )}
          </Stepper.Step>
        </Stepper>

        <div className="flex justify-end items-center space-x-2">
          <Button
            size={'sm'}
            disabled={!(active >= highestStepVisited && active !== 0)}
            onClick={() => handleStepChange(active - 1)}
          >
            Quay lại
          </Button>

          {(!canDone || active !== 2) && (
            <Button
              size={'sm'}
              disabled={!isAllowNextStep || !(highestStepVisited >= active)}
              onClick={() => handleStepChange(active + 1)}
            >
              Tiếp
            </Button>
          )}

          {canDone && active === 2 && (
            <DialogClose
              disabled={isRequesting}
              className={cn(
                buttonVariants({ size: 'sm' }),
                'text-white transition-colors bg-green-700 hover:bg-green-700/80'
              )}
              onClick={() => ChannelRequest()}
            >
              Xong
            </DialogClose>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StepperChannelLink;
