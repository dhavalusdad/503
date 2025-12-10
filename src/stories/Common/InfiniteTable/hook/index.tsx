import { useState, useMemo, useEffect, useRef } from 'react';

import type { UseInfiniteQueryResult } from '@tanstack/react-query';
import type { SortingState } from '@tanstack/react-table';

interface BaseQueryParams {
  limit?: number;
  sortColumn?: string;
  sortOrder?: string;
  search?: string;
}

interface InfiniteTableHookProps<Data, QueryParams extends BaseQueryParams> {
  apiCall: (queryParams: QueryParams) => UseInfiniteQueryResult<
    {
      items: Data[];
      nextPage: number | undefined;
      total?: number;
    },
    Error
  >;
  initialQueryParams: QueryParams;
  defaultPageSize?: number;
  debounceDelay?: number;
}

export const useInfiniteTableManagement = <Data, QueryParams extends BaseQueryParams>({
  apiCall,
  initialQueryParams,
  defaultPageSize = 10,
  debounceDelay = 500,
}: InfiniteTableHookProps<Data, QueryParams>) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const loaderRef = useRef<HTMLDivElement>(null);

  const onSortingChange = (sortingData: SortingState) => {
    setSorting(sortingData);
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceDelay);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, debounceDelay]);

  const queryParams = useMemo(() => {
    const params = {
      ...initialQueryParams,
      limit: defaultPageSize,
    };

    if (sorting.length > 0) {
      params.sortColumn = sorting[0].id;
      params.sortOrder = sorting[0].desc ? 'desc' : 'asc';
    }

    if (debouncedQuery) {
      params.search = debouncedQuery;
    }

    return params;
  }, [initialQueryParams, defaultPageSize, sorting, debouncedQuery]);

  const apiData = apiCall(queryParams);

  const data = apiData.data?.pages?.flatMap(page => page.items) ?? [];
  const hasNextPage = !!apiData.hasNextPage;
  const isFetchingNextPage = apiData.isFetchingNextPage;
  const fetchNextPage = apiData.fetchNextPage;

  return {
    apiData,
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    loaderRef,
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    sorting,
    setSorting,
    onSortingChange,
  };
};

export default useInfiniteTableManagement;
