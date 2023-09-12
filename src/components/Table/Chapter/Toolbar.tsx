'use client';

import { Button } from '@/components/ui/Button';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/Command';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover';
import { cn } from '@/lib/utils';
import type { Column, Table } from '@tanstack/react-table';
import { Check } from 'lucide-react';
import type { ChapterColumn } from './Column';

interface DataToolbarProps<TValue> {
  column?: Column<ChapterColumn, TValue>;
  table: Table<ChapterColumn>;
}

function DataToolbar<TValue>({ column, table }: DataToolbarProps<TValue>) {
  const statusValues = column?.getFilterValue();

  return (
    <div className="flex items-center gap-4">
      {column && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-24 md:w-36 rounded-xl">
              {typeof statusValues === 'undefined'
                ? 'Trạng thái'
                : statusValues === true
                ? 'Đã đăng'
                : 'Chờ đăng'}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Command>
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      let filterValues;
                      if (typeof statusValues === 'undefined') {
                        filterValues = true;
                      } else {
                        filterValues = undefined;
                      }

                      column?.setFilterValue(filterValues);
                    }}
                    className="flex items-center"
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        statusValues === true
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <Check className={cn('h-4 w-4')} />
                    </div>
                    <span>Đã đăng</span>
                  </CommandItem>

                  <CommandItem
                    onSelect={() => {
                      let filterValues;
                      if (typeof statusValues === 'undefined') {
                        filterValues = false;
                      } else {
                        filterValues = undefined;
                      }
                      column?.setFilterValue(filterValues);
                    }}
                    className="flex items-center"
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        statusValues === false
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    <span>Chờ đăng</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-32 rounded-xl max-sm:w-24">
            Hiển thị
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default DataToolbar;
