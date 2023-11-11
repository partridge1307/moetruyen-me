import { Menu } from 'lucide-react';
import type { Session } from 'next-auth';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Icons } from '../Icons';
import ThemeChangeClient from '../ThemeChangeClient';
import { buttonVariants } from '../ui/Button';

const Sidebar = dynamic(() => import('./Sidebar'), {
  loading: () => <Menu aria-label="sidebar button" className="h-8 w-8" />,
});
const SignOutDropdown = dynamic(() => import('@/components/SignOutDropdown'), {
  loading: () => (
    <div className="w-10 h-10 rounded-md animate-pulse bg-background" />
  ),
});

const Navbar = ({ session }: { session: Session }) => {
  return (
    <>
      <nav className="sticky inset-x-0 top-0 mb-4 lg:mb-6 h-fit p-2 z-30 border-b bg-slate-100 dark:bg-zinc-800">
        <div className="container max-sm:px-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sidebar session={session} />
            <Link href="/" className="flex items-center space-x-2">
              <Icons.logo
                aria-label="Moetruyen Logo"
                className="w-6 h-6 dark:fill-white"
              />

              <p
                aria-label="Moetruyen"
                className="relative text-xl font-semibold max-sm:hidden"
              >
                Moetruyen
                <span className="absolute top-0 -right-1 translate-x-[60%]">
                  <span className="relative block text-xs font-normal rotate-[31deg] h-fit px-1 after:content-[''] after:absolute after:inset-0 after:-z-10 after:bg-orange-600 after:-skew-x-[20deg]">
                    ME
                  </span>
                </span>
              </p>
            </Link>
          </div>

          <div className="flex items-center gap-8">
            <a
              target="_blank"
              href={`${process.env.MAIN_URL}/social`}
              className={buttonVariants({ size: 'sm', variant: 'ghost' })}
            >
              Cộng đồng
            </a>

            <SignOutDropdown session={session} />
          </div>
        </div>
      </nav>

      <ThemeChangeClient />
    </>
  );
};

export default Navbar;
