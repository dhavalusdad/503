import { useEffect, useState } from 'react';

import { getCheckTagInUseById, useDeleteTag, useGetTagList } from '@/api/tag';
import { PermissionType, TagType } from '@/enums';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import { useTableManagement } from '@/stories/Common/Table/hook';

import type { CellContext, ColumnDef } from '@tanstack/react-table';

export interface TagInterface {
  name: string;
  id: string;
  canDelete: boolean;
}

const useTag = () => {
  const [openAddEditTagModal, setOpenAddEditTagModal] = useState<boolean>(false);
  const [openDeleteTagModal, setOpenDeleteTagModal] = useState<boolean>(false);
  const [id, setId] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [warning, setWarning] = useState<boolean>(false);
  const [openValidationMessageModal, setOpenValidationMessageModal] = useState<boolean>(false);
  const { hasPermission } = useRoleBasedRouting();

  const toggleAddEditTagModal = () => {
    setOpenAddEditTagModal(prev => !prev);
  };
  const toggleDeleteTagModal = async (closingModal = false) => {
    setOpenDeleteTagModal(closingModal);
  };

  const { mutateAsync: deleteTags } = useDeleteTag();

  const handleDeleteTags = async (id: string) => {
    await deleteTags(id);
    toggleDeleteTagModal(false);
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
  } = useTableManagement<TagInterface, object>({
    apiCall: useGetTagList,
    initialQueryParams: {
      page: 1,
      limit: 10,
      type: TagType.SESSION_TAG,
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

  const columns: ColumnDef<TagInterface>[] = [
    {
      accessorKey: 'name',
      header: 'Session Tag Name',
      enableSorting: true,
      cell: (info: CellContext<TagInterface, unknown>) => info.getValue(),
    },

    ...(hasPermission(PermissionType.SESSION_TAGS_EDIT) ||
    hasPermission(PermissionType.SESSION_TAGS_DELETE)
      ? [
          {
            accessorKey: 'actions',
            header: 'Actions',
            meta: {
              headerClassName: '!text-center',
            },
            cell: (info: CellContext<TagInterface, unknown>) => {
              return (
                <div className='flex items-center justify-center'>
                  {hasPermission(PermissionType.SESSION_TAGS_EDIT) && (
                    <Button
                      variant='none'
                      onClick={() => {
                        setId(info.row.original.id);
                        toggleAddEditTagModal();
                      }}
                      icon={<Icon name='edit' />}
                      className='hover:bg-white rounded-full'
                    />
                  )}
                  {hasPermission(PermissionType.SESSION_TAGS_DELETE) && (
                    <Button
                      variant='none'
                      onClick={async () => {
                        setId(info.row.original.id);
                        const tag = await getCheckTagInUseById(
                          info.row.original.id,
                          TagType.SESSION_TAG
                        );
                        setWarning(!!tag.data);
                        toggleDeleteTagModal(true);
                      }}
                      icon={<Icon name='delete' />}
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
    openAddEditTagModal,
    toggleAddEditTagModal,
    openDeleteTagModal,
    toggleDeleteTagModal,
    data: areaOfFocusData?.data || [],
    total: areaOfFocusData?.total || 0,
    id,
    setId,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    handleDeleteTags,
    searchQuery,
    handleSearchChange,
    onSortingChange,
    sorting,
    setSorting,
    openValidationMessageModal,
    setOpenValidationMessageModal,
    warning,
    isLoading,
  };
};

export default useTag;
