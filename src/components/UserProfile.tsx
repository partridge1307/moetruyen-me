'use client';

import { AspectRatio } from '@/components/ui/AspectRatio';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/HoverCard';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { cn } from '@/lib/utils';
import { UserProfileEditPayload } from '@/lib/validators/user';
import { Badge, User } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { ImagePlus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FC, useEffect, useRef, useState } from 'react';
import ImageCropModal from './ImageCropModal';

interface UserProfileProps {
  user: Pick<User, 'name' | 'color' | 'image' | 'banner'> & {
    badge: Badge[];
  };
}

const UserProfile: FC<UserProfileProps> = ({ user }) => {
  const { update } = useSession();
  const router = useRouter();
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();

  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const imageCropRef = useRef<HTMLButtonElement>(null);

  const [avatarURL, setAvatarURL] = useState(user.image ?? '');
  const [bannerURL, setBannerURL] = useState(user.banner ?? '');
  const [currentTarget, setCurrentTarget] = useState<'AVATAR' | 'BANNER'>(
    'AVATAR'
  );

  const [username, setUsername] = useState<string>(user.name!);

  const [userColor, setUserColor] = useState(
    user.color
      ? (user.color as
          | {
              from: string;
              to: string;
            }
          | { color: string })
      : null
  );

  const [hasChange, setHasChange] = useState(false);

  const { mutate: Update, isLoading: isUpdating } = useMutation({
    mutationFn: async (payload: UserProfileEditPayload) => {
      const { avatar, banner, name, color } = payload;

      const form = new FormData();

      if (avatar.startsWith('blob')) {
        const blob = await fetch(avatar).then((res) => res.blob());
        form.append('avatar', blob);
      }
      if (banner.startsWith('blob')) {
        const blob = await fetch(banner).then((res) => res.blob());
        form.append('banner', blob);
      }
      form.append('name', name);
      color !== null && form.append('color', JSON.stringify(color));

      const { data } = await axios.put(`/api/user`, form);

      return data as UserProfileEditPayload;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
        if (err.response?.status === 404) return notFoundToast();
      }
      return serverErrorToast();
    },
    onSuccess: (data) => {
      update();
      router.refresh();

      setAvatarURL(data.avatar);
      setBannerURL(data.banner);
      setUsername(data.name);
      setUserColor(data.color);

      return successToast();
    },
  });

  useEffect(() => {
    let isChanged = false;

    if (username !== user.name) {
      isChanged = true;
    }
    if (avatarURL !== (user.image ?? '')) {
      isChanged = true;
    }
    if (bannerURL !== (user.banner ?? '')) {
      isChanged = true;
    }
    if (JSON.stringify(userColor) !== JSON.stringify(user.color)) {
      isChanged = true;
    }

    setHasChange(isChanged);
  }, [
    avatarURL,
    user.image,
    bannerURL,
    user.banner,
    userColor,
    user.color,
    username,
    user.name,
  ]);

  function onResetHandler() {
    setAvatarURL(user.image ?? '');
    setBannerURL(user.banner ?? '');
    setUsername(user.name!);
    setUserColor(
      user.color
        ? (user.color as
            | {
                from: string;
                to: string;
              }
            | { color: string })
        : null
    );
  }

  function onDoneHandler() {
    const payload: UserProfileEditPayload = {
      avatar: avatarURL,
      banner: bannerURL,
      name: username,
      color: userColor,
    };

    Update(payload);
  }

  return (
    <>
      <form
        id="profile-update-form"
        className="relative"
        onSubmit={(e) => {
          e.preventDefault();
          onDoneHandler();
        }}
      >
        <div className="relative">
          <AspectRatio ratio={16 / 9}>
            {!!bannerURL ? (
              <Image
                fill
                sizes="50vw"
                quality={40}
                priority
                src={bannerURL}
                alt="Preview User Banner"
                role="button"
                className="object-cover object-top hover:cursor-pointer rounded-md border-2 dark:border-zinc-800"
                onClick={(e) => {
                  e.preventDefault();

                  bannerRef.current?.click();
                }}
              />
            ) : (
              <div
                role="button"
                className="w-full h-full flex justify-center items-center hover:cursor-pointer rounded-md border-dashed border-2 dark:bg-zinc-900"
                onClick={(e) => {
                  e.preventDefault();

                  bannerRef.current?.click();
                }}
              >
                <ImagePlus className="w-8 h-8" />
              </div>
            )}
          </AspectRatio>

          <div className="absolute w-28 h-28 lg:w-36 lg:h-36 bottom-0 translate-y-1/2 left-4 lg:left-6">
            <AspectRatio ratio={1 / 1}>
              {!!avatarURL ? (
                <Image
                  fill
                  sizes="30vw"
                  quality={40}
                  priority
                  src={avatarURL}
                  alt="Preview User Avatar"
                  role="button"
                  className="object-cover object-top hover:cursor-pointer rounded-full border-4"
                  onClick={(e) => {
                    e.preventDefault();

                    avatarRef.current?.click();
                  }}
                />
              ) : (
                <div
                  role="button"
                  className="w-full h-full flex justify-center items-center hover:cursor-pointer rounded-full border-4 dark:bg-zinc-900"
                  onClick={(e) => {
                    e.preventDefault();

                    avatarRef.current?.click();
                  }}
                >
                  <ImagePlus className="w-5 lg:w-6 h-5 lg:h-6" />
                </div>
              )}
            </AspectRatio>
          </div>
        </div>

        <div className="mt-20 lg:mt-28 space-y-10">
          <div className="space-y-1">
            <label htmlFor="username-input" className="max-sm:text-sm">
              Tên
            </label>
            <Input
              id="username-input"
              autoComplete="off"
              minLength={5}
              maxLength={32}
              disabled={isUpdating}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {!!user.badge.length && (
            <div className="space-y-1">
              <label htmlFor="badge-select-button" className="max-sm:text-sm">
                Huy hiệu
              </label>
              <Select
                value={JSON.stringify(userColor)}
                onValueChange={(value) =>
                  !!value && setUserColor(JSON.parse(value))
                }
              >
                <SelectTrigger disabled={isUpdating} id="badge-select-button">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {user.badge.map((badge) => (
                    <SelectItem
                      key={badge.id}
                      value={JSON.stringify(badge.color)}
                      className="hover:cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="block w-4 h-4 rounded-full animate-rainbow"
                          style={{
                            backgroundImage:
                              !!badge.color &&
                              // @ts-ignore
                              !!badge.color.from &&
                              // @ts-ignore
                              !!badge.color.to
                                ? // @ts-ignore
                                  `linear-gradient(to right, ${badge.color.from}, ${badge.color.to})`
                                : undefined,
                            backgroundColor:
                              // @ts-ignore
                              !!badge.color && !!badge.color.color
                                ? // @ts-ignore
                                  badge.color.color
                                : undefined,
                          }}
                        />
                        <p>{badge.name}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="py-10 pb-20 flex flex-wrap items-center gap-6">
          {!!user.badge.length &&
            user.badge.map((badge) => (
              <HoverCard key={badge.id}>
                <HoverCardTrigger
                  aria-label="hover-badge-info"
                  className="w-fit p-1 flex items-center gap-2 rounded-md dark:bg-zinc-800"
                >
                  <div className="w-10 h-10">
                    <Image
                      width={100}
                      height={100}
                      src={badge.image}
                      alt={`${badge.name} Icon`}
                    />
                  </div>
                  <p
                    className="animate-rainbow bg-clip-text text-transparent"
                    style={{
                      backgroundImage:
                        !!badge.color &&
                        // @ts-ignore
                        !!badge.color.from &&
                        // @ts-ignore
                        !!badge.color.to
                          ? // @ts-ignore
                            `linear-gradient(to right, ${badge.color.from}, ${badge.color.to})`
                          : undefined,
                      backgroundColor:
                        // @ts-ignore
                        !!badge.color && !!badge.color.color
                          ? // @ts-ignore
                            badge.color.color
                          : undefined,
                    }}
                  >
                    {badge.name}
                  </p>
                </HoverCardTrigger>

                <HoverCardContent className="flex gap-4 p-2 dark:bg-zinc-800">
                  <div className="w-16 h-16">
                    <Image
                      width={100}
                      height={100}
                      src={badge.image}
                      alt={`${badge.name} Icon`}
                    />
                  </div>
                  <div>
                    <p
                      className="animate-rainbow bg-clip-text text-transparent"
                      style={{
                        backgroundImage:
                          !!badge.color &&
                          // @ts-ignore
                          !!badge.color.from &&
                          // @ts-ignore
                          !!badge.color.to
                            ? // @ts-ignore
                              `linear-gradient(to right, ${badge.color.from}, ${badge.color.to})`
                            : undefined,
                        backgroundColor:
                          // @ts-ignore
                          !!badge.color && !!badge.color.color
                            ? // @ts-ignore
                              badge.color.color
                            : undefined,
                      }}
                    >
                      {badge.name}
                    </p>
                    <p className="text-sm">{badge.description}</p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
        </div>

        {hasChange && (
          <div className="absolute bottom-0 inset-x-0 flex justify-end items-center gap-6 p-3 px-4 rounded-lg dark:bg-zinc-900/70">
            <button
              tabIndex={0}
              aria-label="cancel"
              type="button"
              disabled={isUpdating}
              className={cn('hover:underline underline-offset-2', {
                'opacity-50': isUpdating,
              })}
              onClick={() => onResetHandler()}
            >
              Hủy
            </button>
            <button
              tabIndex={1}
              aria-label="submit"
              form="profile-update-form"
              disabled={isUpdating}
              type="submit"
              className={cn(
                'w-20 p-1 px-2 rounded-md bg-green-700 hover:bg-green-900',
                {
                  'opacity-50': isUpdating,
                }
              )}
            >
              Sửa
            </button>
          </div>
        )}
      </form>

      <input
        disabled={isUpdating}
        ref={avatarRef}
        type="file"
        accept=".jpg, .jpeg, .png"
        className="hidden"
        onChange={(e) => {
          if (
            e.target.files?.length &&
            e.target.files[0].size < 4 * 1000 * 1000
          ) {
            setCurrentTarget('AVATAR');
            setAvatarURL(URL.createObjectURL(e.target.files[0]));
            e.target.value = '';

            imageCropRef.current?.click();
          }
        }}
      />
      <input
        disabled={isUpdating}
        ref={bannerRef}
        type="file"
        accept=".jpg, .jpeg, .png"
        className="hidden"
        onChange={(e) => {
          if (
            e.target.files?.length &&
            e.target.files[0].size < 4 * 1000 * 1000
          ) {
            setCurrentTarget('BANNER');
            setBannerURL(URL.createObjectURL(e.target.files[0]));
            e.target.value = '';

            imageCropRef.current?.click();
          }
        }}
      />

      <ImageCropModal
        ref={imageCropRef}
        image={currentTarget === 'AVATAR' ? avatarURL : bannerURL}
        aspect={currentTarget === 'AVATAR' ? 1 / 1 : 16 / 9}
        setImageCropped={
          currentTarget === 'AVATAR' ? setAvatarURL : setBannerURL
        }
      />
    </>
  );
};

export default UserProfile;
