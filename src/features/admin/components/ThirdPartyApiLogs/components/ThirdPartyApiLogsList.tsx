import { useState, useMemo } from 'react';

import { getClientsAsync } from '@/api/clientManagement';
import { getTherapistsAsync } from '@/api/therapist';
import { getUsersWithRolesAsync } from '@/api/user';
import { type CommonFilterField } from '@/components/layout/Filter';
import FilterButton from '@/components/layout/Filter/FilterButton';
import { FIELD_TYPE } from '@/constants/CommonConstant';
import { PermissionType } from '@/enums';
import {
  useThirdPartyApiLogsManagement,
  type ThirdPartyApiLogsFilterType,
} from '@/features/admin/components/ThirdPartyApiLogs/hooks/useThirdPartyApiLogsManagement';
import type { ThirdPartyApiLog } from '@/features/admin/components/ThirdPartyApiLogs/types';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import InputField from '@/stories/Common/Input';
import Table from '@/stories/Common/Table';

const STATUS_OPTIONS = [
  { value: 'true', label: 'Success' },
  { value: 'false', label: 'Failed' },
];

const SERVICE_OPTIONS = [
  { value: 'bamboohr', label: 'BambooHR' },
  { value: 'authorize_net', label: 'Authorize.net' },
  { value: 'amd', label: 'AMD' },
  { value: 'pverify', label: 'Pverify' },
];

const ThirdPartyApiLogsList = () => {
  const [filters, setFilters] = useState<ThirdPartyApiLogsFilterType>({});
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const { hasPermission } = useRoleBasedRouting();

  const {
    data,
    columns,
    total,
    pageIndex,
    pageSize,
    onSortingChange,
    sorting,
    setSorting,
    setPageSize,
    setPageIndex,
    handleSearchChange,
    searchQuery,
    isLoading,
  } = useThirdPartyApiLogsManagement(filters);

  const filterFields: CommonFilterField<ThirdPartyApiLogsFilterType>[] = useMemo(
    () => [
      {
        type: FIELD_TYPE.DATE_RANGE,
        name: 'created_at',
        label: 'Created Date',
      },
      {
        type: FIELD_TYPE.SELECT,
        name: 'service_name',
        label: 'Service',
        options: SERVICE_OPTIONS,
        isMulti: true,
      },
      {
        type: FIELD_TYPE.SELECT,
        name: 'status',
        label: 'Status',
        options: STATUS_OPTIONS,
      },
      ...(hasPermission(PermissionType.PATIENT_VIEW)
        ? [
            {
              type: FIELD_TYPE.ASYNC_SELECT,
              name: 'client_id',
              label: 'Client',
              isMulti: true,
              queryFn: getClientsAsync,
              queryKey: 'third-party-api-logs-clients',
            },
          ]
        : []),
      ...(hasPermission(PermissionType.THERAPIST_VIEW)
        ? [
            {
              type: FIELD_TYPE.ASYNC_SELECT,
              name: 'therapist_id',
              label: 'Therapist',
              isMulti: true,
              queryFn: getTherapistsAsync,
              queryKey: 'third-party-api-logs-therapists',
            },
          ]
        : []),
      {
        type: FIELD_TYPE.ASYNC_SELECT,
        name: 'user_id',
        label: 'Created By',
        isMulti: true,
        queryFn: getUsersWithRolesAsync,
        queryKey: 'third-party-api-logs-users',
      },
    ],
    []
  );

  const handleApplyFilter = (vals: ThirdPartyApiLogsFilterType) => {
    setFilters({ ...vals });
    setIsFilterVisible(false);
    setPageIndex(1);
  };

  const handleClearFilter = () => {
    setFilters({});
    setIsFilterVisible(false);
    setPageIndex(1);
  };

  return (
    <div className='p-5 bg-white rounded-20px border border-solid border-surface'>
      <div className='flex flex-wrap gap-5 items-center mb-5'>
        <h2 className='text-lg font-bold leading-6 text-blackdark'>Third Party API Logs</h2>
        <InputField
          type='Search'
          placeholder='Search'
          icon='search'
          iconFirst
          iconClassName='text-primarygray'
          onChange={handleSearchChange}
          name='search'
          value={searchQuery}
          parentClassName='w-full sm:w-360px ml-auto'
        />
        <FilterButton<ThirdPartyApiLogsFilterType>
          isVisible={isFilterVisible}
          setIsVisible={setIsFilterVisible}
          onClearFilter={handleClearFilter}
          handleApplyFilter={handleApplyFilter}
          filterFields={filterFields}
          defaultValues={filters}
          isLoading={isLoading}
        />
      </div>
      <Table
        data={data as ThirdPartyApiLog[]}
        columns={columns}
        className={'w-full'}
        totalCount={total ?? 0}
        pageIndex={pageIndex}
        pageSize={pageSize}
        sorting={sorting}
        setSorting={setSorting}
        onSortingChange={onSortingChange}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ThirdPartyApiLogsList;
