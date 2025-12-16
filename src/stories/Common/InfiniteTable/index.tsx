import { useEffect, useRef } from 'react';

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
  onSortingChange,
  isLoading,
}: InfiniteTableProps<TData>) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loaderRef?.current || !hasNextPage || !onLoadMore) return;

    const scrollContainer = scrollContainerRef.current;

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      {
        root: scrollContainer,
        rootMargin: '10px',
        threshold: 0.1,
      }
    );

    observer.observe(loaderRef.current);

    return () => {
      if (loaderRef?.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loaderRef, hasNextPage, isFetchingNextPage, onLoadMore]);

  const infiniteScrollLoader =
    hasNextPage || isFetchingNextPage ? (
      <div
        ref={loaderRef}
        className={clsx('py-4 flex justify-center items-center text-primarygray')}
      >
        {isFetchingNextPage && (
          <div className='flex items-center gap-2'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primarygray'></div>
            <span>{loadingText}</span>
          </div>
        )}
      </div>
    ) : null;

  return (
    <Table<TData>
      data={data}
      columns={columns}
      parentClassName={clsx(parentClassName)}
      className={clsx(className)}
      tableClassName={tableClassName}
      theadClassName={clsx('sticky top-0 z-10', theadClassName)}
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
      scrollContainerRef={scrollContainerRef}
      infiniteScrollLoader={infiniteScrollLoader}
    />
  );
};

export default InfiniteTable;
