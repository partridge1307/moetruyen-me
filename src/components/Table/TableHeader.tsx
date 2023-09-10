'use client';

import { FC } from 'react';
import { TableHead, TableRow, TableHeader } from '@/components/ui/Table';
import { flexRender, type Table } from '@tanstack/react-table';

interface TableHeaderProps {
  table: Table<any>;
}

const TableDataHeader: FC<TableHeaderProps> = ({ table }) => {
  return (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <TableHead key={header.id}>
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  );
};

export default TableDataHeader;
