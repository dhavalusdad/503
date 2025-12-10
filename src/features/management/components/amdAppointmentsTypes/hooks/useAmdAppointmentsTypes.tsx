import { useGetAmdAppointmentsTypes } from '@/api/advancedMd';
import { normalizeText } from '@/helper';
import { useTableManagement } from '@/stories/Common/Table/hook';

import type { ColumnDef } from '@tanstack/react-table';

export interface AmdAppointmentsTypesType {
  id: string;
  amd_id: string;
  name: string;
}

export const useAmdAppointmentsTypes = () => {
  const {
    apiData,
    currentPage: pageIndex,
    pageSize,
    setCurrentPage: setPageIndex,
    setPageSize,
    setSearchQuery,
    onSortingChange,
    sorting,
    setSorting,
    searchQuery,
  } = useTableManagement<AmdAppointmentsTypesType, object>({
    apiCall: useGetAmdAppointmentsTypes,
    initialQueryParams: {
      page: 1,
      limit: 10,
    },
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    setPageIndex(1);
  };

  const columns: ColumnDef<AmdAppointmentsTypesType>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <>{normalizeText(row.getValue('name'))}</>,
    },
    {
      accessorKey: 'amd_id',
      header: 'AMD ID',
      cell: ({ row }) => <>{row.getValue('amd_id')}</>,
    },
  ];

  const { data, isLoading, isError } = apiData;

  return {
    data: data?.data || [],
    isLoading,
    isError,
    columns,
    pageSize,
    onSortingChange,
    sorting,
    setSorting,
    setPageSize,
    setSearchQuery,
    searchQuery,
    handleSearchChange,
    total: data?.total || 0,
    pageIndex,
    setPageIndex,
  };
};
