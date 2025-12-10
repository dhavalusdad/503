import { useEffect, useState } from 'react';

import moment from 'moment';
import { useSelector } from 'react-redux';

import { useAgreementList, useDeleteAgreementById, useToggleAgreement } from '@/api/agreement';
import { PermissionType } from '@/enums';
import { showToast } from '@/helper';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Switch from '@/stories/Common/Switch';
import { useTableManagement } from '@/stories/Common/Table/hook';

import type { CellContext, ColumnDef } from '@tanstack/react-table';

export interface Agreement {
  id: string;
  title: string;
  description: string;
  doc: string | null;
  doc_path?: string | null;
  is_published: boolean;
  created_at: string;
}

const useAgreement = () => {
  const [openAddEditAgreementModal, setOpenAddEditAgreementModal] = useState<boolean>(false);
  const [openDeleteAgreementModal, setOpenDeleteAgreementModal] = useState<boolean>(false);
  const [id, setId] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [canDelete, setCanDelete] = useState<boolean>(true);
  const [openValidationMessageModal, setOpenValidationMessageModal] = useState<boolean>(false);
  const { timezone } = useSelector(currentUser);
  const toggleAddEditAgreementModal = () => {
    setOpenAddEditAgreementModal(prev => !prev);
  };
  const toggleDeleteAgreementModal = async (canDelete: boolean, closingModal = false) => {
    if (closingModal) {
      setOpenDeleteAgreementModal(prev => !prev);
    } else {
      if (canDelete == false && !closingModal) {
        setOpenDeleteAgreementModal(false);
        setCanDelete(false);
        setOpenValidationMessageModal(true);
      } else {
        setCanDelete(true);
        setOpenDeleteAgreementModal(true);
      }
    }
  };

  const { mutateAsync: deleteAgreement } = useDeleteAgreementById();
  const { mutateAsync: toggleAgreement } = useToggleAgreement();

  const handleToggleAgreement = async (id: string) => {
    try {
      await toggleAgreement(id);
    } catch (error) {
      console.error('Error toggling agreement:', error);
    }
  };

  const handleDeleteAgreement = async (id: string) => {
    try {
      await deleteAgreement(id);
      toggleDeleteAgreementModal(false, true);
      showToast('Agreement deleted successfully', 'SUCCESS');
    } catch (error) {
      console.error('Error deleting area of focus:', error);
      showToast('Failed to delete Agreement', 'ERROR');
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
  } = useTableManagement<Agreement, object>({
    apiCall: useAgreementList,
    initialQueryParams: {
      page: 1,
      limit: 10,
      type: 'Agreement',
      ...(debouncedQuery ? { search: debouncedQuery } : {}),
    },
  });

  const { hasPermission } = useRoleBasedRouting();

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

  const { data: AgreementData, isLoading } = apiData;

  const columns: ColumnDef<Agreement>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      enableSorting: true,
      cell: (info: CellContext<Agreement, unknown>) => info.getValue(),
    },
    {
      accessorKey: 'created_at',
      header: 'Created Date',
      enableSorting: true,
      cell: (info: CellContext<Agreement, unknown>) => (
        <span>
          {moment(info?.getValue() as Date)
            .tz(timezone)
            .format('MMM DD, YYYY')}
        </span>
      ),
    },
    {
      accessorKey: 'updated_at',
      header: 'Updated Date',
      enableSorting: true,
      cell: (info: CellContext<Agreement, unknown>) => (
        <span>
          {moment(info?.getValue() as Date)
            .tz(timezone)
            .format('MMM DD, YYYY')}
        </span>
      ),
    },
    {
      accessorKey: 'is_published',
      header: 'Active/Inactive',
      enableSorting: true,
      meta: {
        sortingThClassName: 'justify-center',
        cellClassName: 'text-center',
      },
      cell: (info: CellContext<Agreement, unknown>) => {
        const canEdit = hasPermission(PermissionType.AGREEMENTS_EDIT);
        return (
          <Switch
            isChecked={info.row.original.is_published}
            isDisabled={!canEdit}
            onChange={() => {
              if (canEdit) {
                handleToggleAgreement(info.row.original.id);
              }
            }}
          />
        );
      },
    },
    ...(hasPermission(PermissionType.AGREEMENTS_EDIT) ||
    hasPermission(PermissionType.AGREEMENTS_DELETE)
      ? [
          {
            accessorKey: 'actions',
            header: 'Actions',
            enableSorting: false,
            meta: {
              headerClassName: '!text-center',
            },
            cell: (info: CellContext<Agreement, unknown>) => {
              const canEdit = hasPermission(PermissionType.AGREEMENTS_EDIT);
              return (
                <div className='flex items-center justify-center'>
                  {canEdit && (
                    <Button
                      variant='none'
                      onClick={() => {
                        setId(info.row.original.id);
                        toggleAddEditAgreementModal();
                      }}
                      icon={<Icon name='edit' />}
                      className='hover:bg-white rounded-full'
                    />
                  )}
                </div>
              );
            },
          },
        ]
      : []),
  ];

  return {
    columns,
    openAddEditAgreementModal,
    toggleAddEditAgreementModal,
    openDeleteAgreementModal,
    toggleDeleteAgreementModal,
    data: Array.isArray(AgreementData?.data)
      ? (AgreementData?.data as Agreement[])
      : AgreementData?.data
        ? [AgreementData.data as Agreement]
        : [],
    total: AgreementData?.total || 0,
    id,
    setId,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    handleDeleteAgreement,
    searchQuery,
    handleSearchChange,
    onSortingChange,
    sorting,
    setSorting,
    canDelete,
    openValidationMessageModal,
    setOpenValidationMessageModal,
    isLoading,
  };
};

export default useAgreement;
