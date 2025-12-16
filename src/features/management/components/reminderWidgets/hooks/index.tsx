import { useEffect, useState } from 'react';

import { useDeleteFieldOptions, useGetFieldOptionsList } from '@/api/field-option';
import { FieldOptionType, PermissionType } from '@/enums';
import { showToast } from '@/helper';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import { useTableManagement } from '@/stories/Common/Table/hook';

import type { CellContext, ColumnDef } from '@tanstack/react-table';

export interface ReminderWidget {
  name: string;
  id: string;
}

const useReminderWidget = () => {
  const [openAddEditReminderWidgetModal, setOpenAddEditReminderWidgetModal] =
    useState<boolean>(false);
  const [openDeleteReminderWidgetModal, setOpenDeleteReminderWidgetModal] =
    useState<boolean>(false);
  const [id, setId] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { hasPermission } = useRoleBasedRouting();

  // Debug logging to track hook calls
  // console.log('useReminderWidgets hook called', { timestamp: new Date().toISOString() });

  const toggleAddEditReminderWidgetModal = () => {
    setOpenAddEditReminderWidgetModal(prev => !prev);
  };
  const toggleDeleteReminderWidgetModal = () => {
    setOpenDeleteReminderWidgetModal(prev => !prev);
  };

  const { mutateAsync: deleteReminderWidget } = useDeleteFieldOptions();

  const handleDeleteReminderWidget = async (id: string) => {
    try {
      await deleteReminderWidget(id);
      toggleDeleteReminderWidgetModal();
      showToast('Reminder Widget deleted successfully', 'SUCCESS');
    } catch {
      showToast('Failed to delete Reminder Widget', 'ERROR');
    }
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
  } = useTableManagement<ReminderWidget, object>({
    apiCall: useGetFieldOptionsList,
    initialQueryParams: {
      page: 1,
      limit: 10,
      type: FieldOptionType.WIDGET_TYPE,
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

  const { data: reminderWidgetsData, isLoading } = apiData;

  const columns: ColumnDef<ReminderWidget>[] = [
    {
      accessorKey: 'name',
      header: 'Reminder Widget Name',
      enableSorting: true,
      cell: (info: CellContext<ReminderWidget, unknown>) => info.getValue(),
    },
    ...(hasPermission(PermissionType.WIDGETS_EDIT) || hasPermission(PermissionType.WIDGETS_DELETE)
      ? [
          {
            accessorKey: 'actions',
            header: 'Actions',
            meta: {
              headerClassName: '!text-center',
            },
            cell: (info: CellContext<ReminderWidget, unknown>) => {
              return (
                <div className='flex items-center justify-center'>
                  {hasPermission(PermissionType.WIDGETS_EDIT) && (
                    <Button
                      variant='none'
                      icon={<Icon name='edit' />}
                      onClick={() => {
                        setId(info.row.original.id);
                        toggleAddEditReminderWidgetModal();
                      }}
                      className='hover:bg-white rounded-full'
                    />
                  )}
                  {hasPermission(PermissionType.WIDGETS_DELETE) && (
                    <Button
                      variant='none'
                      icon={<Icon name='delete' />}
                      onClick={() => {
                        setId(info.row.original.id);
                        toggleDeleteReminderWidgetModal();
                      }}
                      className='hover:bg-white rounded-full'
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
    openAddEditReminderWidgetModal,
    toggleAddEditReminderWidgetModal,
    openDeleteReminderWidgetModal,
    toggleDeleteReminderWidgetModal,
    data: reminderWidgetsData?.data || [],
    total: reminderWidgetsData?.total || 0,
    id,
    setId,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    handleDeleteReminderWidget,
    searchQuery,
    handleSearchChange,
    onSortingChange,
    sorting,
    setSorting,
    isLoading,
  };
};

export default useReminderWidget;
