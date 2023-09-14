import { FC } from 'react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/Sheet';
import {
  GanttChart,
  Home,
  Menu,
  Settings,
  Ungroup,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import type { Session } from 'next-auth';
import Banner from '../User/Banner';
import UserAvatar from '../User/Avatar';
import Username from '../User/Name';
import { buttonVariants } from '../ui/Button';
import { cn } from '@/lib/utils';
import ThemeSwitch from '../ThemeSwitch';

interface SidebarProps {
  session: Session;
}

const Sidebar: FC<SidebarProps> = ({ session }) => {
  return (
    <Sheet>
      <SheetTrigger>
        <Menu aria-label="sidebar button" className="h-8 w-8" />
      </SheetTrigger>

      <SheetContent
        side={'left'}
        className="p-0 flex flex-col gap-0 dark:bg-zinc-900"
      >
        <aside className="max-h-full px-3 space-y-4 overflow-auto scrollbar dark:scrollbar--dark">
          <section className="sticky top-0 flex justify-center pt-6 pb-3 z-10 dark:bg-zinc-900">
            <h1 className="relative text-xl lg:text-2xl font-semibold">
              Moetruyen
              <p className="absolute top-0 -right-1 translate-x-[60%] -translate-y-[23%]">
                <span className="relative block h-fit px-1 rotate-[35deg] text-sm after:content-[''] after:absolute after:inset-0 after:-z-10 after:bg-orange-600 after:-skew-x-[20deg]">
                  ME
                </span>
              </p>
            </h1>
          </section>

          <section className="space-y-10">
            <a
              href={process.env.MAIN_URL!}
              className="flex justify-center items-center space-x-2 p-2 font-semibold text-lg rounded-md dark:bg-zinc-800"
            >
              <Home className="w-5 h-5" />
              <span>Trang chủ</span>
            </a>

            <SheetClose asChild>
              <Link
                href="/"
                className="block p-2 rounded-md transition-colors hover:dark:bg-zinc-800/50"
              >
                <div className="relative">
                  <Banner user={session.user} />
                  <UserAvatar
                    user={session.user}
                    className="absolute bottom-0 left-4 translate-y-1/2 w-20 h-20 border-4 dark:border-zinc-900"
                  />
                </div>

                <Username user={session.user} className="mt-14 pl-4" />
              </Link>
            </SheetClose>

            <div className="space-y-5 pb-4">
              <SheetClose asChild>
                <Link
                  href="/upload"
                  className={cn(buttonVariants(), 'w-full py-6 space-x-2')}
                >
                  <Upload className="w-5 h-5" />
                  <span>Đăng truyện</span>
                </Link>
              </SheetClose>

              <SheetClose asChild>
                <Link
                  href="/mangas"
                  className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    'w-full py-6 space-x-2'
                  )}
                >
                  <GanttChart className="w-5 h-5" />
                  <span>Quản lý truyện</span>
                </Link>
              </SheetClose>

              <SheetClose asChild>
                <Link
                  href="/team"
                  className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    'w-full py-6 space-x-2'
                  )}
                >
                  <Ungroup className="w-5 h-5" />
                  <span>Quản lý Team</span>
                </Link>
              </SheetClose>

              <SheetClose asChild>
                <Link
                  href="/settings"
                  className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    'w-full py-6 space-x-2'
                  )}
                >
                  <Settings className="w-5 h-5" />
                  <span>Thiết lập</span>
                </Link>
              </SheetClose>
            </div>
          </section>
        </aside>

        <footer className="flex justify-between items-center p-2 dark:bg-zinc-800">
          <div>
            <p className="text-lg">©Moetruyen</p>
            <p className="text-sm">Version 9w2</p>
          </div>

          <ThemeSwitch />
        </footer>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
