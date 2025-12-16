import { useState } from 'react';

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';

import DataNotFound from '@/components/common/DataNotFound';
import { Icon } from '@/stories/Common/Icon';
import { Pagination } from '@/stories/Common/Pagination';
import Skeleton from '@/stories/Common/Skeleton';

interface TableProps<TData> {
  id?: string;
  data: TData[];
  columns: ColumnDef<TData>[];
  // searchPlaceholder?: string;
  searchableColumns?: string[];
  parentClassName?: string;
  className?: string;
  tableClassName?: string;
  theadClassName?: string;
  thClassName?: string;
  tdClassName?: string;
  activeRowClassName?: string;
  pagination?: boolean;
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onRowClick?: (rowData: TData) => void;
  selectedRowId?: string | number;
  rowIdAccessor?: keyof TData;
  isLoading?: boolean;
  skeletonCount?: number;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  infiniteScrollLoader?: React.ReactNode;
}

export const Table = <TData,>({
  id = 'root-table',
  data,
  columns,
  // searchPlaceholder = 'Search...',
  parentClassName,
  className,
  tableClassName,
  theadClassName,
  thClassName,
  tdClassName,
  activeRowClassName,
  pagination = true,
  totalCount,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
  onRowClick,
  selectedRowId,
  sorting,
  setSorting,
  skeletonCount = 10,
  isLoading,
  rowIdAccessor = 'id' as keyof TData,
  scrollContainerRef,
  infiniteScrollLoader,
}: TableProps<TData>) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const handleSortingChange = (
    newSorting: SortingState | ((old: SortingState) => SortingState)
  ) => {
    if (totalCount === 0) return;
    const resolvedSorting = typeof newSorting === 'function' ? newSorting(sorting) : newSorting;
    setSorting(resolvedSorting);
    onSortingChange?.(resolvedSorting);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    // onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      // globalFilter,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pageSize),
  });

  const handleRowClick = (rowData: TData) => {
    if (onRowClick) {
      onRowClick(rowData);
    }
  };

  return (
    <div className={clsx('w-full', parentClassName)} id={id}>
      <div ref={scrollContainerRef} className={clsx('w-full bg-white overflow-x-auto', className)}>
        <table className={clsx('w-full', tableClassName)}>
          <thead
            className={clsx(
              'rounded-10px bg-Gray outline outline-solid outline-surface -outline-offset-1',
              theadClassName
            )}
          >
            {table?.getHeaderGroups()?.map(headerGroup => (
              <tr key={headerGroup.id} className=''>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className={clsx(
                      'px-4 py-2.5 text-base font-bold leading-22px text-blackdark text-left cursor-pointer whitespace-nowrap first:rounded-l-10px last:rounded-r-10px ',
                      thClassName,
                      header.column.columnDef.meta?.headerClassName || ''
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.column.getCanSort() ? (
                      <div
                        className={clsx(
                          'flex items-center gap-2',
                          header.column.columnDef.meta?.sortingThClassName || ''
                        )}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort()
                          ? {
                              asc: <Icon name='ascSorting' />,
                              desc: <Icon name='descSorting' />,
                              default: <Icon name='sorting' />,
                            }[header.column.getIsSorted() || 'default'] || null
                          : null}
                      </div>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              // 🔹 Show skeleton rows while loading
              Array.from({ length: skeletonCount }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`}>
                  {columns.map((column, colIndex) => {
                    const customSkeleton = column.meta?.customSkeleton;

                    return (
                      <td
                        key={`skeleton-cell-${rowIndex}-${colIndex}`}
                        className={clsx('px-4 py-3.5', tdClassName)}
                      >
                        {customSkeleton ? (
                          customSkeleton
                        ) : (
                          <Skeleton count={1} className='h-7 w-full' />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : totalCount === 0 ? (
              <tr>
                <td colSpan={columns.length} className='text-center'>
                  <DataNotFound />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => {
                const isSelected =
                  selectedRowId !== undefined && row.original[rowIdAccessor] === selectedRowId;

                return (
                  <tr
                    key={row.id}
                    className={clsx(
                      'even:bg-surfacelight hover:bg-surface transition-colors',
                      onRowClick && 'cursor-pointer',
                      isSelected && activeRowClassName
                    )}
                    onClick={() => handleRowClick(row.original)}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td
                        key={cell.id}
                        className={clsx(
                          'px-4 py-3.5 text-sm font-normal leading-18px text-blackdark whitespace-nowrap',
                          tdClassName,
                          cell.column.columnDef.meta?.cellClassName || ''
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {infiniteScrollLoader}
      </div>
      {!isLoading && pagination && totalCount > 0 && (
        <div className='flex items-center gap-2 mt-4'>
          <Pagination
            table={table}
            totalCount={totalCount}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}
    </div>
  );
};

export default Table;
export * from '@/stories/Common/Table/hook';
