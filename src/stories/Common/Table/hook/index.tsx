import { useState, useMemo, useEffect } from 'react';

import type { UseQueryResult } from '@tanstack/react-query';
import type { Row, SortingState } from '@tanstack/react-table';

interface GeneralTableHookProps<Data, QueryParams> {
  apiCall: (
    queryParams: QueryParams,
    id: string | number | undefined
  ) => UseQueryResult<
    {
      data: Data;
      total: number;
      currentPage: number | string;
      [key: string]: string | number | Data | { [key: string]: string | number };
    },
    Error
  >;
  isDashboard?: boolean;
  initialQueryParams: QueryParams;
  defaultPage?: number;
  defaultPageSize?: number;
  id?: string | number | undefined;
  debounceDelay?: number;
}

export const useTableManagement = <Data, QueryParams>({
  apiCall,
  initialQueryParams,
  id,
  isDashboard = false,
  defaultPage = 1,
  defaultPageSize = 10,
  debounceDelay = 500,
}: GeneralTableHookProps<Data, QueryParams>) => {
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedRow, setSelectedRow] = useState<Row<Data>[]>();
  const [sorting, setSorting] = useState<SortingState>([]);
  const onSortingChange = (sortingData: { id: string; desc: boolean }[]) => {
    setSorting(sortingData);
  };

  // Debounce search query
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceDelay);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, debounceDelay]);

  const queryParams = useMemo(
    () => ({
      ...initialQueryParams,
      page: currentPage,
      limit: isDashboard ? 5 : pageSize,
      ...(sorting &&
        sorting.length > 0 && {
          sortColumn: sorting[0].id,
          sortOrder: sorting[0].desc ? 'desc' : 'asc',
        }),
      ...(debouncedQuery ? { search: debouncedQuery } : {}),
    }),
    [initialQueryParams, currentPage, pageSize, isDashboard, sorting, debouncedQuery]
  );

  // API call with current state - now properly memoized
  const apiData = apiCall(queryParams, id);

  useEffect(() => {
    if (apiData?.data) {
      const totalPages = Math.ceil(apiData?.data?.total / pageSize);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
      }
    }
  }, [apiData?.data, currentPage, pageSize]);

  // const data = apiData.data?.data || [];
  // const total = apiData.data?.total || 0;

  // if (data.length === 0 && total > 0) {
  //   setCurrentPage(1);
  // }

  return {
    apiData,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    selectedRow,
    setSelectedRow,
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    sorting,
    setSorting,
    onSortingChange,
  };
};

export default useTableManagement;
