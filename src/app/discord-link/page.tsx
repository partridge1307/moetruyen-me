import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

const NotifySetup = dynamic(() => import('@/components/Settings/NotifySetup'), {
  ssr: false,
  loading: () => (
    <div className="h-[780px] md:h-[590px] rounded-md animate-pulse bg-background" />
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
      discordChannel: true,
    },
  });
  if (!user) return notFound();

  return (
    <main className="container md:w-3/4 lg:w-2/3 p-2 mb-4 md:mb-10 space-y-10 rounded-md dark:bg-zinc-900/60">
      <h1 className="text-2xl font-semibold">Thiết lập thông báo Discord</h1>

      {!!user.discordChannel && (
        <section className="flex flex-col items-center gap-10">
          <p className="text-lg">Bạn đã thiết lập thông báo Discord trước đó</p>
          <Link href="/settings" className={buttonVariants()}>
            Quay lại
          </Link>
        </section>
      )}

      {!user.discordChannel ? (
        !!user.account.length ? (
          <NotifySetup />
        ) : (
          <section className="flex flex-col items-center gap-10">
            <p className="text-lg">
              Bạn cần liên kết với Discord để thực hiện hành động này
            </p>
            <Link href="/settings" className={buttonVariants()}>
              Quay lại
            </Link>
          </section>
        )
      ) : null}
    </main>
  );
};

export default page;
