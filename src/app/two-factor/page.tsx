import TwoFactorSkeleton from '@/components/Skeleton/TwoFactorSkeleton';
import { buttonVariants } from '@/components/ui/Button';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

const TwoFactSetup = dynamic(() => import('@/components/Auth/TwoFactSetup'), {
  ssr: false,
  loading: () => <TwoFactorSkeleton />,
});

const page = async () => {
  const session = await getAuthSession();
  if (!session) return redirect(`${process.env.MAIN_URL}/sign-in`);

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      twoFactorEnabled: true,
    },
  });
  if (!user) return notFound();

  return (
    <main className="container md:w-3/4 lg:w-2/3 p-2 mb-4 md:mb-10 space-y-10 rounded-md dark:bg-zinc-900/60">
      <h1 className="text-2xl font-semibold">Thiết lập bảo mật hai lớp</h1>

      {!user.twoFactorEnabled ? (
        <TwoFactSetup />
      ) : (
        <section className="flex flex-col items-center gap-10">
          <p className="text-lg">
            Bạn đã thiết lập bảo vệ 2 lớp trước đó rồi. Vui lòng tắt để thực
            hiện hành động này
          </p>
          <Link href="/settings" className={buttonVariants()}>
            Quay lại
          </Link>
        </section>
      )}
    </main>
  );
};

export default page;
