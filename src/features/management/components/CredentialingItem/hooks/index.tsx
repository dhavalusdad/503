import { useEffect, useState } from 'react';

import moment from 'moment';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { useDeleteCredentialItem, useGetCredentialingItems } from '@/api/creadentialingItem';
import { UserRole } from '@/api/types/user.dto';
import { ROUTES } from '@/constants/routePath';
import { PermissionType } from '@/enums';
import { CredentialStatusBadge } from '@/features/management/components/CredentialingItem/CredentialStatusBadge';
import type { CredentialingItem } from '@/features/management/types';
import { isAdminPanelRole } from '@/helper';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import { useTableManagement } from '@/stories/Common/Table/hook';

import type { CellContext, ColumnDef } from '@tanstack/react-table';

const useCredentialListing = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { role, therapist_id = '' } = useSelector(currentUser);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [id, setId] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const toggleAddEdit = (id?: string) => {
    if (id) {
      navigate(ROUTES.EDIT_CREDENTIALING_ITEM.navigatePath(params.therapist_id as string, id), {
        state: params,
      });
    } else {
      if (isAdminPanelRole(role)) {
        navigate(
          ROUTES.ADD_CREDENTIALING_ITEM.path.replace(
            ':therapist_id',
            params.therapist_id as string
          ),
          { state: params }
        );
      }
      // else {
      //   navigate(ROUTES.THERAPIST_ADD_CREDENTIALING_ITEM.path, { state: params });
      // }
    }
  };

  const toggleDeleteModal = (closing = false) => {
    if (closing) setOpenDeleteModal(false);
    else setOpenDeleteModal(prev => !prev);
  };

  const { mutateAsync: deleteCredentialingItem } = useDeleteCredentialItem();

  const handleDelete = async () =>
    // id: string
    {
      await deleteCredentialingItem(id);
      setOpenDeleteModal(false);
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
  } = useTableManagement<CredentialingItem, object>({
    apiCall: useGetCredentialingItems,
    initialQueryParams: {
      page: 1,
      limit: 10,
      therapist_id: params.therapist_id || therapist_id,
      ...(debouncedQuery ? { search: debouncedQuery } : {}),
    },
  });

  const { hasPermission } = useRoleBasedRouting();

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPageIndex(1);
  };

  const { data: credentialData, isLoading } = apiData;

  const columns: ColumnDef<CredentialingItem>[] = [
    {
      accessorKey: 'carrierName',
      header: 'Carrier Name',
      enableSorting: true,
      cell: info => info.row.original?.carrier?.carrier_name || '-',
    },
    {
      accessorKey: 'state',
      header: 'State',
      enableSorting: true,
      cell: info => info.row.original.state?.state?.name,
    },
    {
      accessorKey: 'date_roster',
      header: 'Date Roster',
      enableSorting: true,
      cell: info => {
        const val = info.row.original.date_roster;
        return val ? moment(val).format('DD MMMM yyyy') : '-';
      },
    },
    {
      accessorKey: 'credential_date',
      header: 'Credential Date',
      enableSorting: true,
      cell: info => {
        const val = info.row.original.credential_date;
        return val ? moment(val).format('DD MMMM yyyy') : '-';
      },
    },
    {
      accessorKey: 'id_number',
      header: 'ID Number',
      enableSorting: true,
      cell: info => info.row.original?.id_number,
    },
    {
      accessorKey: 'ticket_id',
      header: 'Ticket ID',
      enableSorting: true,
      cell: info => info.row.original?.ticket_id,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      cell: info => <CredentialStatusBadge status={info.row.original.status} />,
    },
  ];
  if (
    role === UserRole.ADMIN ||
    (role === UserRole.BACKOFFICE && hasPermission(PermissionType.THERAPIST_EDIT))
  ) {
    columns.push({
      accessorKey: 'actions',
      header: 'Actions',
      enableSorting: false,
      meta: {
        headerClassName: '!text-center',
      },
      cell: (info: CellContext<CredentialingItem, unknown>) => (
        <div className='flex items-center justify-center'>
          <Button
            variant='none'
            onClick={() => {
              setId(info.row.original.id);
              toggleAddEdit(info.row.original.id);
            }}
            icon={<Icon name='edit' />}
            className='hover:!bg-white rounded-full'
          />
          <Button
            variant='none'
            onClick={() => {
              setId(info.row.original.id);
              toggleDeleteModal();
            }}
            icon={<Icon name='delete' />}
            className='hover:!bg-white rounded-full'
          />
        </div>
      ),
    });
  }

  return {
    columns,
    toggleAddEdit,
    openDeleteModal,
    toggleDeleteModal,
    data: credentialData?.data || [],
    total: credentialData?.total || 0,
    id,
    setId,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    handleDelete,
    searchQuery,
    handleSearchChange,
    onSortingChange,
    sorting,
    setSorting,
    isLoading,
  };
};

export default useCredentialListing;
