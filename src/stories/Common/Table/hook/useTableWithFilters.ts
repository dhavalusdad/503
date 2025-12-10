import React, { useEffect, useState } from 'react';

import { useSelector } from 'react-redux';

import { useFilterManager } from '@/components/layout/Filter/hooks/useFilterManager';
import { currentUser } from '@/redux/ducks/user';

import useTableManagement from '.';

export type BaseQueryParams<TFilters extends object = Record<string, unknown>> = {
  page: number;
  limit: number;
  search?: string;
  timezone?: string;
  filters?: TFilters;
  columns?: string;
} & Record<string, unknown>;

type ApiCall<TFilters extends object, TData> = (
  params: BaseQueryParams<TFilters>
) => Promise<TData>;

const useTableWithFilters = <
  TData,
  TFilters extends object = Record<string, unknown>,
  Q extends BaseQueryParams<TFilters> = BaseQueryParams<TFilters>,
>({
  apiCall,
  initialQueryParams,
}: {
  apiCall: ApiCall<Q, TData>;
  initialQueryParams?: Partial<Q>;
}) => {
  // ** Redux States **
  const { timezone } = useSelector(currentUser);

  // ** States **
  const [search, setSearch] = useState('');
  const filterManager = useFilterManager<TFilters>();
  const tableManager = useTableManagement<TData, Q>({
    apiCall,
    initialQueryParams: {
      page: 1,
      limit: 10,
      timezone,
      ...initialQueryParams,
      search,
      filters: filterManager.filters,
    } as Q,
  });
  const { searchQuery, setSearchQuery, setCurrentPage, currentPage } = tableManager;

  // ** Helpers **
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // ** Effects **
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setSearch(searchQuery);
    }, 500);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterManager.filters]);

  return { filterManager, tableManager, handleSearchChange, currentPage, setCurrentPage };
};

export default useTableWithFilters;
