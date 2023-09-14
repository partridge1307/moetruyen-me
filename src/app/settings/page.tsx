import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

const NotifyDiscChannel = dynamic(
  () => import('@/components/Settings/NotifyDiscChannel')
);
const DiscordLink = dynamic(() => import('@/components/Settings/DiscordLink'), {
  ssr: false,
  loading: () => (
    <div className="space-y-1">
      <h1 className="text-lg lg:text-xl font-semibold">Liên kết</h1>
      <div className="h-12 rounded-md animate-pulse dark:bg-zinc-900" />
    </div>
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
    },
  });
  if (!user) return notFound();

  return (
    <main className="container lg:w-2/3 p-2 mb-10 space-y-10 rounded-md dark:bg-zinc-900/60">
      <section className="space-y-2">
        <h1 className="text-lg lg:text-xl font-semibold">Tài khoản</h1>
        <Link href="/change-password" className={buttonVariants()}>
          Đổi mật khẩu
        </Link>
      </section>

      <DiscordLink account={user.account} />

      <NotifyDiscChannel channel={user.discordChannel} account={user.account} />
    </main>
  );
};

export default page;
