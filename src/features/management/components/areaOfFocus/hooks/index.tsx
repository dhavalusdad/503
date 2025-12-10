import { useEffect, useState } from 'react';

import { useDeleteFieldOptions, useGetFieldOptionsList } from '@/api/field-option';
import { FieldOptionType, PermissionType } from '@/enums';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import { useTableManagement } from '@/stories/Common/Table/hook';

import type { CellContext, ColumnDef } from '@tanstack/react-table';

export interface AreaOfFocus {
  name: string;
  id: string;
  canDelete: boolean;
}

const useAreaOfFocus = () => {
  const [openAddEditAreaOfFocusModal, setOpenAddEditAreaOfFocusModal] = useState<boolean>(false);
  const [openDeleteAreaOfFocusModal, setOpenDeleteAreaOfFocusModal] = useState<boolean>(false);
  const [id, setId] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { hasPermission } = useRoleBasedRouting();

  // Debug logging to track hook calls
  // console.log('useAreaOfFocus hook called', { timestamp: new Date().toISOString() });

  const toggleAddEditAreaOfFocusModal = () => {
    setOpenAddEditAreaOfFocusModal(prev => !prev);
  };
  const toggleDeleteAreaOfFocusModal = async (closingModal = false) => {
    if (closingModal) {
      setOpenDeleteAreaOfFocusModal(prev => !prev);
    } else {
      setOpenDeleteAreaOfFocusModal(true);
    }
  };

  const { mutateAsync: deleteAreaOfFocus } = useDeleteFieldOptions();

  const handleDeleteAreaOfFocus = async (id: string) => {
    await deleteAreaOfFocus(id);
    setOpenDeleteAreaOfFocusModal(false);
  };

  const {
    apiData,
    currentPage: pageIndex,
    pageSize,
    setCurrentPage: setPageIndex,
    setPageSize,
    setSearchQuery,
    searchQuery,
    onSortingChange,
    sorting,
    setSorting,
  } = useTableManagement<AreaOfFocus, object>({
    apiCall: useGetFieldOptionsList,
    initialQueryParams: {
      page: 1,
      limit: 10,
      type: FieldOptionType.AREA_OF_FOCUS,
      ...(debouncedQuery ? { search: debouncedQuery } : {}),
    },
  });

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    setPageIndex(1);
  };

  const { data: areaOfFocusData, isLoading } = apiData;

  const columns: ColumnDef<AreaOfFocus>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      enableSorting: true,
      cell: (info: CellContext<AreaOfFocus, unknown>) => info.getValue(),
    },
    ...(hasPermission(PermissionType.AREA_OF_FOCUS_EDIT) ||
    hasPermission(PermissionType.AREA_OF_FOCUS_DELETE)
      ? [
          {
            accessorKey: 'actions',
            header: 'Actions',
            meta: {
              headerClassName: '!text-center',
            },
            cell: (info: CellContext<AreaOfFocus, unknown>) => {
              return (
                <div className='flex items-center justify-center'>
                  {hasPermission(PermissionType.AREA_OF_FOCUS_EDIT) && (
                    <Button
                      variant='none'
                      icon={<Icon name='edit' />}
                      className='hover:bg-white rounded-full'
                      onClick={() => {
                        setId(info.row.original.id);
                        toggleAddEditAreaOfFocusModal();
                      }}
                    />
                  )}
                  {hasPermission(PermissionType.AREA_OF_FOCUS_DELETE) && (
                    <Button
                      variant='none'
                      icon={<Icon name='delete' />}
                      className='hover:bg-white rounded-full'
                      onClick={() => {
                        setId(info.row.original.id);
                        toggleDeleteAreaOfFocusModal();
                      }}
                    />
                  )}
                </div>
              );
            },
            enableSorting: false,
          },
        ]
      : []),
  ];

  return {
    columns,
    openAddEditAreaOfFocusModal,
    toggleAddEditAreaOfFocusModal,
    openDeleteAreaOfFocusModal,
    toggleDeleteAreaOfFocusModal,
    data: areaOfFocusData?.data || [],
    total: areaOfFocusData?.total || 0,
    id,
    setId,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    handleDeleteAreaOfFocus,
    searchQuery,
    handleSearchChange,
    onSortingChange,
    sorting,
    setSorting,
    isLoading,
  };
};

export default useAreaOfFocus;
