import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/AlertDialog';
import { buttonVariants } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Manga } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import type { Row } from '@tanstack/react-table';
import axios, { AxiosError } from 'axios';
import { Loader2, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DataTableRowActionProps {
  row: Row<Pick<Manga, 'id' | 'name' | 'isPublished' | 'updatedAt'>>;
}

function DataTableRowAction({ row }: DataTableRowActionProps) {
  const manga = row.original;
  const { refresh } = useRouter();
  const { loginToast, notFoundToast, serverErrorToast, successToast } =
    useCustomToast();

  const { mutate: publish, isLoading: isPublishLoading } = useMutation({
    mutationKey: ['publish-manga', manga.id],
    mutationFn: async (id: number) => {
      const { data } = await axios.put(`/api/manga/${id}`);

      return data as string;
    },
    onError: (e) => {
      if (e instanceof AxiosError) {
        if (e.response?.status === 401) return loginToast();
        if (e.response?.status === 404) return notFoundToast();
        if (e.response?.status === 406)
          return toast({
            title: 'Không thể publish',
            description: 'Yêu cầu manga phải có ít nhất 1 chapter',
            variant: 'destructive',
          });
        if (e.response?.status === 409)
          return toast({
            title: 'Đã publish',
            description: 'Bạn đã publish Manga này trước đó rồi',
            variant: 'destructive',
          });
      }

      return serverErrorToast();
    },
    onSuccess: () => {
      refresh();

      return successToast();
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="row action button"
          type="button"
          className={cn(
            buttonVariants({
              variant: 'ghost',
            }),
            'w-6 h-6 p-0 focus-visible:ring-transparent ring-offset-transparent'
          )}
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-[200px] space-y-2 p-1">
        <DropdownMenuItem asChild>
          <Link
            href={`/mangas/${manga.id}/edit`}
            className="w-full h-full transition-colors hover:cursor-pointer hover:dark:bg-zinc-800"
          >
            Chỉnh sửa
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/mangas/${manga.id}/chapters`}
            className="w-full h-full transition-colors hover:cursor-pointer hover:dark:bg-zinc-800"
          >
            Xem chapter
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/mangas/${manga.id}`}
            className="w-full h-full transition-colors hover:cursor-pointer hover:dark:bg-zinc-800"
          >
            Thông tin truyện
          </Link>
        </DropdownMenuItem>

        {!manga.isPublished && (
          <AlertDialog>
            <AlertDialogTrigger
              disabled={isPublishLoading}
              className="w-full flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {isPublishLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <p>Publish</p>
              )}
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận lại yêu cầu</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn đã chắc chắn muốn{' '}
                  <span className="font-bold">publish</span> truyện này hay
                  chưa?
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel
                  className={buttonVariants({ variant: 'destructive' })}
                >
                  Chờ chút đã
                </AlertDialogCancel>
                <AlertDialogAction onClick={() => publish(manga.id)}>
                  Tôi chắc chắn
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DataTableRowAction;
