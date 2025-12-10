import { useEffect } from 'react';

import { type ColumnDef, type SortingState } from '@tanstack/react-table';
import clsx from 'clsx';

import { Table } from '@/stories/Common/Table';

export interface InfiniteTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  parentClassName?: string;
  className?: string;
  tableClassName?: string;
  activeRowClassName?: string;
  theadClassName?: string;
  thClassName?: string;
  tdClassName?: string;
  onRowClick?: (rowData: TData) => void;
  selectedRowId?: string | number;
  rowIdAccessor?: keyof TData;
  loaderRef?: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  loadingText?: string;
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  onSortingChange?: (sorting: SortingState) => void;
  mainParentClassName?: string;
  isLoading?: boolean;
}

export const InfiniteTable = <TData,>({
  data,
  columns,
  parentClassName,
  className,
  tableClassName,
  theadClassName,
  activeRowClassName,
  thClassName,
  tdClassName,
  onRowClick,
  selectedRowId,
  rowIdAccessor = 'id' as keyof TData,
  loaderRef,
  isFetchingNextPage = false,
  hasNextPage = false,
  onLoadMore,
  loadingText = 'Loading more...',
  sorting,
  setSorting,
  mainParentClassName,
  onSortingChange,
  isLoading,
}: InfiniteTableProps<TData>) => {
  useEffect(() => {
    if (!loaderRef?.current || !hasNextPage || !onLoadMore) return;
    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      {
        rootMargin: '100px',
        threshold: 1.0,
      }
    );
    observer.observe(loaderRef.current);

    return () => {
      if (loaderRef?.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loaderRef, hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <div className={clsx('w-full', mainParentClassName)}>
      <Table<TData>
        data={data}
        columns={columns}
        parentClassName={parentClassName}
        className={clsx('', className)}
        tableClassName={tableClassName}
        theadClassName={theadClassName}
        activeRowClassName={activeRowClassName}
        thClassName={thClassName}
        tdClassName={tdClassName}
        pagination={false}
        totalCount={data.length}
        pageIndex={0}
        pageSize={data.length}
        sorting={sorting}
        setSorting={setSorting}
        onSortingChange={onSortingChange}
        onRowClick={onRowClick}
        selectedRowId={selectedRowId}
        rowIdAccessor={rowIdAccessor}
        isLoading={isLoading}
      />
      {(hasNextPage || isFetchingNextPage) && (
        <div
          ref={loaderRef}
          className={clsx('py-4 flex justify-center items-center text-gray-500')}
        >
          {isFetchingNextPage && (
            <div className='flex items-center gap-2'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500'></div>
              <span>{loadingText}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InfiniteTable;
