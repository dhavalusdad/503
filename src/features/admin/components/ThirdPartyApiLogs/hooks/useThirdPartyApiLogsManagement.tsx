import { useMemo, useState } from 'react';

import clsx from 'clsx';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useGetThirdPartyApiLogs, useRetryThirdPartyApiLog } from '@/api/thirdPartyApiLogs';
import type { DateRangeFilterObjType } from '@/components/layout/Filter/types';
import { ROUTES } from '@/constants/routePath';
import { PermissionType } from '@/enums';
import { retryableOperations } from '@/features/admin/components/ThirdPartyApiLogs/constants';
import type { ThirdPartyApiLog } from '@/features/admin/components/ThirdPartyApiLogs/types';
import type { OptionType } from '@/features/calendar/types';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import { currentUser } from '@/redux/ducks/user';
import Icon from '@/stories/Common/Icon';
import OptionsList, { type OptionListItem } from '@/stories/Common/List';
import RowDropdown from '@/stories/Common/RowDropdown';
import { useTableManagement } from '@/stories/Common/Table/hook';

import type { ColumnDef } from '@tanstack/react-table';

export interface ThirdPartyApiLogsFilterType {
  service_name?: OptionType[];
  status?: OptionType;
  created_at?: DateRangeFilterObjType;
  client_id?: OptionType[];
  therapist_id?: OptionType[];
  user_id?: OptionType[];
}

export const useThirdPartyApiLogsManagement = (filters: ThirdPartyApiLogsFilterType = {}) => {
  const { timezone } = useSelector(currentUser);
  const navigate = useNavigate();

  const queryParams = useMemo(
    () => ({
      page: 1,
      limit: 10,
      timezone,
      ...(filters.service_name && filters.service_name.length > 0
        ? { service_name: filters.service_name.map(s => s.value) }
        : {}),
      ...(filters.status ? { status: String(filters.status.value) === 'true' } : {}),
      ...(filters.created_at?.startDate ? { startDate: filters.created_at.startDate } : {}),
      ...(filters.created_at?.endDate ? { endDate: filters.created_at.endDate } : {}),
      ...(filters.client_id && filters.client_id.length > 0
        ? { client_id: filters.client_id.map(c => c.value) }
        : {}),
      ...(filters.therapist_id && filters.therapist_id.length > 0
        ? { therapist_id: filters.therapist_id.map(t => t.value) }
        : {}),
      ...(filters.user_id && filters.user_id.length > 0
        ? { user_id: filters.user_id.map(u => u.value) }
        : {}),
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
    onSortingChange,
    sorting,
    setSorting,
    searchQuery,
  } = useTableManagement<ThirdPartyApiLog[], object>({
    apiCall: (params: object) => useGetThirdPartyApiLogs(params),
    initialQueryParams: queryParams,
  });

  const { data, isLoading, dataUpdatedAt } = apiData ?? {};
  const [optionLoading, setOptionsLoading] = useState<Record<string, boolean>>({});

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    setPageIndex(1);
  };

  const { hasPermission } = useRoleBasedRouting();

  const handleThirdPartyApiLogsDetails = (id: string) => {
    navigate(ROUTES.THIRD_PARTY_API_LOGS_DETAILS.navigatePath(id));
  };

  const { mutateAsync: retryApi } = useRetryThirdPartyApiLog();

  const handleRetryThirdPartyApiLog = async (id: string) => {
    try {
      setOptionsLoading(prev => ({
        ...prev,
        [`${id}-retry`]: true,
      }));
      await retryApi(id);
    } catch (error) {
      console.error('Retry Third Party API Log failed : ', error);
    } finally {
      setOptionsLoading(prev => ({
        ...prev,
        [`${id}-retry`]: false,
      }));
    }
  };

  const columns: ColumnDef<ThirdPartyApiLog>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      meta: {
        cellClassName: 'w-360px',
      },
      cell: ({ row }) => (
        <span
          className='hover:text-primary hover:font-bold hover:underline cursor-pointer underline-offset-2 w-full'
          onClick={() => handleThirdPartyApiLogsDetails(row.original.id)}
        >
          {row.getValue('id')}
        </span>
      ),
    },
    {
      accessorKey: 'service_name',
      header: 'Service',
      meta: {
        cellClassName: 'capitalize',
      },
      cell: ({ row }) => {
        const serviceName = row.getValue('service_name') as string;
        return <>{serviceName}</>;
      },
    },
    {
      accessorKey: 'operation_type',
      header: 'Operation',
      meta: {
        cellClassName: 'capitalize !whitespace-normal w-60',
      },
      cell: ({ row }) => {
        const operationType = row.getValue('operation_type') as string;
        return <>{operationType.replace(/_/g, ' ')}</>;
      },
    },
    // {
    //   accessorKey: 'request_url',
    //   header: 'URL',
    //   cell: ({ row }) => {
    //     const url = row.getValue('request_url') as string;
    //     return (
    //       <span className='font-mono text-xs max-w-xs truncate block' title={url}>
    //         {url}
    //       </span>
    //     );
    //   },
    // },
    {
      accessorKey: 'client',
      header: 'Client',
      meta: {
        cellClassName: 'capitalize',
      },
      cell: ({ row }) => {
        const client = row.getValue('client') as {
          user: { first_name: string; last_name: string };
        } | null;
        return client ? (
          <>
            {client.user.first_name} {client.user.last_name}
          </>
        ) : (
          '-'
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'therapist',
      header: 'Therapist',
      meta: {
        cellClassName: 'capitalize',
      },
      cell: ({ row }) => {
        const therapist = row.getValue('therapist') as {
          user: { first_name: string; last_name: string };
        } | null;
        return therapist ? (
          <>
            {therapist.user.first_name} {therapist.user.last_name}
          </>
        ) : (
          '-'
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'user',
      header: 'Created By',
      meta: {
        cellClassName: 'capitalize',
      },
      cell: ({ row }) => {
        const user = row.getValue('user') as { first_name: string; last_name: string } | null;
        return user ? (
          <>
            {user.first_name} {user.last_name}
          </>
        ) : (
          '-'
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'request_method',
      header: 'Method',
      cell: ({ row }) => {
        const method = row.getValue('request_method') as string;
        const methodColor =
          {
            GET: 'text-blue-500 bg-blue-50',
            POST: 'text-green-500 bg-green-50',
            PUT: 'text-yellow-500 bg-yellow-50',
            DELETE: 'text-red-500 bg-red-50',
            PATCH: 'text-purple-500 bg-purple-50',
          }[method] || 'text-gray-500 bg-gray-50';

        return (
          <span className={clsx('px-3.5 py-1.5 rounded-full text-xs font-medium', methodColor)}>
            {method}
          </span>
        );
      },
    },
    // {
    //   accessorKey: 'response_status_code',
    //   header: 'Status Code',
    //   cell: ({ row }) => {
    //     const statusCode = row.getValue('response_status_code') as number;
    //     const statusColor =
    //       statusCode >= 200 && statusCode < 300
    //         ? 'text-green-600 bg-green-50'
    //         : statusCode >= 400
    //           ? 'text-red-600 bg-red-50'
    //           : 'text-yellow-600 bg-yellow-50';

    //     return (
    //       <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
    //         {statusCode}
    //       </span>
    //     );
    //   },
    // },
    {
      accessorKey: 'success',
      header: 'Status',
      cell: ({ row }) => {
        const success = row.getValue('success') as boolean;
        const statusColor = success ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50';
        return (
          <span className={clsx('px-3.5 py-1.5 rounded-full text-xs font-medium', statusColor)}>
            {success ? 'Success' : 'Failed'}
          </span>
        );
      },
    },
    // {
    //   accessorKey: 'duration_ms',
    //   header: 'Duration',
    //   cell: ({ row }) => {
    //     const duration = row.getValue('duration_ms') as number;
    //     return <span className='font-mono text-sm'>{duration}ms</span>;
    //   },
    // },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      cell: ({ row }) => {
        const time = row.original?.created_at;
        return (
          <div className='flex gap-2'>
            <span>{time ? moment(time).tz(timezone).format('MMM DD, YYYY') : '-'}</span>
            <span>{moment(time).tz(timezone).format('h:mm A')}</span>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'action',
      header: 'Action',
      enableSorting: false,
      meta: {
        headerClassName: '!text-center',
        cellClassName: 'text-center',
      },
      cell: ({ row }) => {
        const rowData = row?.original;
        const retry =
          rowData?.success === false && retryableOperations.includes(rowData?.operation_type);

        const optionList: OptionListItem[] = [
          {
            label: 'View',
            onClick: () => {
              handleThirdPartyApiLogsDetails(row.original.id);
            },
            icon: 'eye',
          },
          ...(hasPermission(PermissionType.THIRD_PARTY_LOGS_RETRY)
            ? ([
                {
                  label: 'Retry',
                  onClick: () => handleRetryThirdPartyApiLog(row.original.id),
                  icon: 'sync',
                  hidden: !retry,
                  isLoading: optionLoading[`${row.original.id}-retry`],
                },
              ] as OptionListItem[])
            : []),
        ];
        return (
          <RowDropdown<HTMLDivElement> content={() => <OptionsList items={optionList} />}>
            {({ onToggle, targetRef }) => (
              <div
                ref={targetRef}
                onClick={() => onToggle()}
                className='cursor-pointer inline-block py-2'
              >
                <Icon name='threedots' className='text-blackdark' />
              </div>
            )}
          </RowDropdown>
        );
      },
    },
  ];

  return {
    data: data?.data || [],
    total: data?.total || 0,
    isLoading,
    dataUpdatedAt,
    columns,
    onSortingChange,
    sorting,
    setSorting,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    searchQuery,
    setSearchQuery,
    handleSearchChange,
  };
};
