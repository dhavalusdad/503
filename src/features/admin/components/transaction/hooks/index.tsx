import { useMemo, useState } from 'react';

import clsx from 'clsx';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useTransactionList } from '@/api/transaction';
import { UserRole } from '@/api/types/user.dto';
import type { DateRangeFilterObjType } from '@/components/layout/Filter/types';
import { ROUTES } from '@/constants/routePath';
import { TransactionStatus, TransactionType, PermissionType } from '@/enums';
import {
  StatusBadge,
  TransactionStatusBadge,
} from '@/features/admin/components/transaction/components/StatusBadge';
import type { Transaction } from '@/features/admin/components/transaction/types';
import type { OptionType } from '@/features/calendar/types';
import { isAdminPanelRole } from '@/helper';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import { currentUser } from '@/redux/ducks/user';
import { ActionDropDown } from '@/stories/Common/ActionDropDown';
import { useTableManagement } from '@/stories/Common/Table/hook';

import type { ColumnDef } from '@tanstack/react-table';

export interface TransactionFilterType {
  transaction_status?: OptionType[];
  created_at?: DateRangeFilterObjType;
  client_id?: OptionType[];
  transaction_type?: OptionType;
  session_type?: OptionType;
  appointment_id?: string;
  appointment_view?: boolean;
}
interface approvalModalType {
  isModalOpen: boolean;
  transaction_id: string | null;
}

const useTransaction = (filters: TransactionFilterType = {}) => {
  const { timezone, role, client_id = '' } = useSelector(currentUser);
  const navigate = useNavigate();
  const { hasPermission } = useRoleBasedRouting();

  const [toggleDeclineModal, setToggleDeclineModal] = useState<approvalModalType>({
    isModalOpen: false,
    transaction_id: null,
  });

  const [toggleApprovalModal, setToggleApprovalModal] = useState<approvalModalType>({
    isModalOpen: false,
    transaction_id: null,
  });

  const [toggleRefundModal, setToggleRefundModal] = useState<approvalModalType>({
    isModalOpen: false,
    transaction_id: null,
  });

  const queryParams = useMemo(
    () => ({
      page: 1,
      limit: 10,
      timezone,
      ...(filters.transaction_status && filters.transaction_status.length > 0
        ? { transaction_status: filters.transaction_status.map(c => c.value) }
        : {}),
      ...(filters.session_type ? { session_type: filters.session_type.value } : {}),
      ...(filters.created_at?.startDate ? { startDate: filters.created_at.startDate } : {}),
      ...(filters.created_at?.endDate ? { endDate: filters.created_at.endDate } : {}),
      ...(filters.client_id && filters.client_id.length > 0
        ? { client_id: filters.client_id.map(c => c.value) }
        : {}),
      ...(role == UserRole.CLIENT && client_id ? { client_id } : {}),
      ...(filters.transaction_type ? { transaction_type: filters.transaction_type.value } : {}),
      ...(filters.appointment_id ? { appointment_id: filters.appointment_id } : {}),
    }),
    [filters, timezone]
  );

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
  } = useTableManagement<Transaction, object>({
    apiCall: useTransactionList,
    initialQueryParams: queryParams,
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    setPageIndex(1);
  };

  const { data: transactionData, isLoading } = apiData;

  const columnsForAdmin: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'transaction_id',
      header: 'Transaction ID',
      cell: ({ row }) => (
        <span
          onClick={() =>
            role === UserRole.ADMIN &&
            navigate(ROUTES.TRANSACTION_DETAILS.navigatePath(row.original.id))
          }
          className={clsx(
            role == UserRole.ADMIN &&
              'hover:text-primary hover:underline cursor-pointer underline-offset-2'
          )}
        >
          {row.original.transaction_id}
        </span>
      ),
    },
    {
      accessorKey: 'appointment_id',
      header: 'Appointment ID',
      cell: ({ row }) => <>{row.original.appointment?.id}</>,
    },
    ...(isAdminPanelRole(role)
      ? [
          {
            accessorKey: 'full_name',
            header: 'Client Name',
            cell: ({ row }) => (
              <>{`${row.original.client?.user?.first_name} ${row.original.client?.user?.last_name}`}</>
            ),
          },
        ]
      : []),
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => <>{row.original.amount}</>,
    },
    {
      accessorKey: 'transaction_type',
      header: 'Type',
      meta: {
        sortingThClassName: '!justify-center',
        cellClassName: 'text-center',
      },
      cell: ({ row }) => {
        return <TransactionStatusBadge status={row.original.transaction_type} />;
      },
    },

    {
      accessorKey: 'status',
      header: 'Status',
      meta: {
        sortingThClassName: '!justify-center',
        cellClassName: 'text-center',
      },
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      // enableSorting: false,
    },
    ...(isAdminPanelRole(role)
      ? [
          {
            accessorKey: 'is_settled',
            header: 'Settlement Status',
            meta: {
              sortingThClassName: '!justify-center',
              cellClassName: 'text-center',
            },
            cell: ({ row }) => {
              return (
                <TransactionStatusBadge
                  status={row.original.is_settled ? 'Settled' : 'Unsettled'}
                />
              );
            },
          },
        ]
      : []),

    {
      accessorKey: 'created_at',
      header: 'Date & Time',
      cell: ({ row }) => {
        const time = row.original?.created_at;
        return (
          <div className='flex gap-2'>
            <span>{time ? moment(time).tz(timezone).format('MMM DD, YYYY') : '-'} ,</span>
            <span>{moment(time).tz(timezone).format('h:mm A')}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'sessionType',
      header: 'Session Type',
      cell: ({ row }) => <>{row.original.appointment?.session_type}</>,
      enableSorting: false,
    },
    ...(isAdminPanelRole(role)
      ? [
          {
            accessorKey: 'action',
            header: 'Action',
            enableSorting: false,
            meta: {
              headerClassName: '!text-center',
              cellClassName: 'text-center',
            },
            cell: ({ row }) => {
              return (
                <ActionDropDown
                  showThreeDotView={true}
                  actions={[
                    {
                      label: 'View',
                      icon: 'eye',
                      show: hasPermission(PermissionType.TRANSACTIONS_VIEW),
                      onClick: () =>
                        navigate(ROUTES.TRANSACTION_DETAILS.navigatePath(row.original.id)),
                    },
                    {
                      label: 'Approve',
                      icon: 'approve',
                      show:
                        row.original.status === TransactionStatus.PENDING &&
                        hasPermission(PermissionType.TRANSACTIONS_UPDATE),
                      onClick: () =>
                        setToggleApprovalModal({
                          isModalOpen: true,
                          transaction_id: row.original.transaction_id,
                        }),
                    },
                    {
                      label: 'Decline',
                      icon: 'close',
                      show:
                        row.original.status === TransactionStatus.PENDING &&
                        hasPermission(PermissionType.TRANSACTIONS_UPDATE),
                      onClick: () =>
                        setToggleDeclineModal({
                          isModalOpen: true,
                          transaction_id: row.original.transaction_id,
                        }),
                    },
                    ...(row.original.status === TransactionStatus.SUCCESS &&
                    row.original.transaction_type === TransactionType.CHARGE &&
                    row.original.amount > row.original.refunded_amount
                      ? [
                          {
                            label: 'Process Refund',
                            icon: 'sync',
                            onClick: () =>
                              setToggleRefundModal({
                                isModalOpen: true,
                                transaction_id: row.original.transaction_id,
                              }),
                            show: hasPermission(PermissionType.TRANSACTIONS_UPDATE),
                          },
                        ]
                      : []),
                  ]}
                />
              );
            },
          },
        ]
      : []),
  ];

  const columnsForAppointmentView: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'transaction_id',
      header: 'Transaction ID',
      cell: ({ row }) => <>{row.original.transaction_id}</>,
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => <>{row.original.amount}</>,
    },
    {
      accessorKey: 'transaction_type',
      header: 'Type',
      meta: {
        sortingThClassName: 'justify-center',
        cellClassName: 'text-center',
      },
      cell: ({ row }) => {
        return <TransactionStatusBadge status={row.original.transaction_type} />;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: {
        sortingThClassName: 'justify-center',
        cellClassName: 'text-center',
      },
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      // enableSorting: false,
    },
    {
      accessorKey: 'is_settled',
      header: 'Settlement Status',
      meta: {
        sortingThClassName: 'justify-center',
        cellClassName: 'text-center',
      },
      cell: ({ row }) => {
        return (
          <TransactionStatusBadge status={row.original.is_settled ? 'Settled' : 'Unsettled'} />
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Date & Time',
      cell: ({ row }) => {
        const time = row.original?.created_at;
        return (
          <div className='flex gap-2'>
            <span>{time ? moment(time).tz(timezone).format('MMM DD, YYYY') : '-'} , </span>
            <span>{moment(time).tz(timezone).format('h:mm A')}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'sessionType',
      header: 'Session Type',
      cell: ({ row }) => <>{row.original.appointment?.session_type}</>,
      enableSorting: false,
    },
    ...(role == UserRole.ADMIN
      ? [
          {
            accessorKey: 'action',
            header: 'Action',
            enableSorting: false,
            meta: {
              headerClassName: '!text-center',
              cellClassName: 'text-center',
            },
            cell: ({ row }) => {
              return (
                <ActionDropDown
                  actions={[
                    {
                      label: 'View',
                      icon: 'eye',
                      onClick: () =>
                        navigate(ROUTES.TRANSACTION_DETAILS.navigatePath(row.original.id)),
                      show: hasPermission(PermissionType.TRANSACTIONS_VIEW),
                    },
                    {
                      label: 'Approve',
                      icon: 'approve',
                      onClick: () =>
                        setToggleApprovalModal({
                          isModalOpen: true,
                          transaction_id: row.original.transaction_id,
                        }),
                      show:
                        row.original.status === TransactionStatus.PENDING &&
                        hasPermission(PermissionType.TRANSACTIONS_UPDATE),
                    },
                    {
                      label: 'Decline',
                      icon: 'close',
                      onClick: () =>
                        setToggleDeclineModal({
                          isModalOpen: true,
                          transaction_id: row.original.transaction_id,
                        }),
                      show:
                        row.original.status === TransactionStatus.PENDING &&
                        hasPermission(PermissionType.TRANSACTIONS_UPDATE),
                    },
                    ...(row.original.status === TransactionStatus.SUCCESS &&
                    row.original.transaction_type === TransactionType.CHARGE &&
                    row.original.amount > row.original.refunded_amount
                      ? [
                          {
                            label: 'Process Refund',
                            icon: 'sync',
                            iconClassName: '!w-4 !h-4',
                            onClick: () =>
                              setToggleRefundModal({
                                isModalOpen: true,
                                transaction_id: row.original.transaction_id,
                              }),
                            show: hasPermission(PermissionType.THERAPIST_EDIT),
                          },
                        ]
                      : []),
                  ]}
                />
              );
            },
          },
        ]
      : []),
  ];

  const columns = filters.appointment_view ? columnsForAppointmentView : columnsForAdmin;

  return {
    columns,
    data: transactionData?.data || [],
    total: transactionData?.total || 0,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    searchQuery,
    onSortingChange,
    sorting,
    setSorting,
    isLoading,
    handleSearchChange,
    toggleDeclineModal,
    setToggleDeclineModal,
    toggleApprovalModal,
    setToggleApprovalModal,
    toggleRefundModal,
    setToggleRefundModal,
  };
};

export default useTransaction;
