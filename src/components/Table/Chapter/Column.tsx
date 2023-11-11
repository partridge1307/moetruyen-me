'use client';

import { DataTableColumnHeader } from '@/components/Table/ColumnHeader';
import { formatTimeToNow } from '@/lib/utils';
import { ProgressType, type Chapter } from '@prisma/client';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import dynamic from 'next/dynamic';

const DataTableRowAction = dynamic(() => import('./RowAction'), {
  ssr: false,
  loading: () => (
    <div className="p-1">
      <MoreHorizontal className="w-5 h-5" />
    </div>
  ),
});

export type ChapterColumn = Pick<
  Chapter,
  | 'id'
  | 'name'
  | 'images'
  | 'isPublished'
  | 'mangaId'
  | 'progress'
  | 'updatedAt'
>;

export const columns: ColumnDef<ChapterColumn>[] = [
  {
    id: 'ID',
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div>{row.getValue('ID')}</div>,
    enableHiding: false,
  },
  {
    id: 'Tên chapter',
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên chapter" />
    ),
  },
  {
    id: 'Số lượng ảnh',
    accessorKey: 'image',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số lượng ảnh" />
    ),
    cell: ({ row }) => {
      return <div className="text-center">{row.original.images.length}</div>;
    },
    enableSorting: false,
  },
  {
    id: 'Trạng thái',
    accessorKey: 'isPublished',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const formattedStatus = row.getValue('Trạng thái')
        ? 'Đã đăng'
        : 'Chờ đăng';

      return <div>{formattedStatus}</div>;
    },
  },
  {
    id: 'Tình trạng',
    accessorKey: 'progress',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tình trạng" />
    ),
    cell: ({ row }) => {
      const formatValue = row.getValue('Tình trạng');
      const formattedValue =
        formatValue === ProgressType.ERROR
          ? 'Lỗi'
          : formatValue === ProgressType.SUCCESS
          ? 'Thành công'
          : formatValue === ProgressType.EDITTING
          ? 'Đang sửa'
          : 'Đang tải';

      return <div>{formattedValue}</div>;
    },
  },
  {
    id: 'Cập nhật',
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cập nhật" />
    ),
    cell: ({ row }) => {
      const formattedDate = formatTimeToNow(row.getValue('Cập nhật'));
      return <div>{formattedDate}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowAction row={row} />,
    enableHiding: false,
  },
];
