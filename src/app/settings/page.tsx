import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

const DisableTwoFactModal = dynamic(
  () => import('@/components/Auth/DisableTwoFactModal'),
  {
    ssr: false,
    loading: () => (
      <div className="w-32 h-10 rounded-md animate-pulse bg-background" />
    ),
  }
);

const DiscordLink = dynamic(() => import('@/components/Settings/DiscordLink'), {
  ssr: false,
  loading: () => (
    <div className="space-y-1">
      <h1 className="text-lg lg:text-xl font-semibold">Liên kết</h1>
      <div className="h-14 rounded-md animate-pulse bg-background" />
    </div>
  ),
});

const NotifyInfo = dynamic(() => import('@/components/Settings/NotifyInfo'), {
  ssr: false,
  loading: () => (
    <div className="h-96 md:h-44 animate-pulse rounded-md bg-background" />
  ),
});

const page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect(`${process.env.MAIN_URL}/sign-in`);

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      account: {
        select: {
          providerAccountId: true,
        },
      },
      discordChannel: {
        select: {
          serverId: true,
          serverName: true,
          channelId: true,
          channelName: true,
          roleId: true,
          roleName: true,
        },
      },
      twoFactorEnabled: true,
    },
  });
  if (!user) return notFound();

  return (
    <main className="container lg:w-2/3 p-2 mb-10 space-y-10 rounded-md dark:bg-zinc-900/60">
      <section className="space-y-2">
        <h1 className="text-lg lg:text-xl font-semibold">Tài khoản</h1>

        <div className="flex flex-wrap max-sm:justify-between items-center gap-10">
          <Link href="/change-password" className={buttonVariants()}>
            Đổi mật khẩu
          </Link>
          {user.twoFactorEnabled ? (
            <DisableTwoFactModal />
          ) : (
            <Link href="/two-factor" className={buttonVariants()}>
              Bảo mật 2 lớp
            </Link>
          )}
        </div>
      </section>

      <DiscordLink account={user.account} />

      {!!user.discordChannel ? (
        <NotifyInfo discord={user.discordChannel} />
      ) : (
        <Link href="/discord-link" className={buttonVariants()}>
          Thiết lập thông báo Discord
        </Link>
      )}
    </main>
  );
};

export default page;
