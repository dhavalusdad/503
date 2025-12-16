import { useMemo, useRef, useState } from 'react';

import clsx from 'clsx';
import moment from 'moment';
import { useSelector } from 'react-redux';

import { useGetAppointmentHistory } from '@/api/appointment';
import { fieldOptionsQueryKey } from '@/api/common/fieldOptions.queryKey';
import { getAreaOfFocusAsync } from '@/api/field-option';
import CommonFilter, { type CommonFilterField } from '@/components/layout/Filter';
import { APPOINTMENT_STATUS_OPTIONS, FIELD_TYPE } from '@/constants/CommonConstant';
import { FieldOptionType } from '@/enums';
import useGetClientAppointmentListColumns from '@/features/admin/components/clientManagement/components/hooks/useGetClientAppointmentListColumns';
import appointmentHistory from '@/features/admin/components/clientManagement/hooks/useGetClientManagementColumns';
import type {
  AppointmentHistoryDataType,
  AppointmentHistoryFilterDataType,
} from '@/features/admin/components/clientManagement/types';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import Spinner from '@/stories/Common/Loader/Spinner.tsx';
import { Table, useTableManagement } from '@/stories/Common/Table';

type Props = {
  clientId: string;
  isTherapistPanel?: boolean;
  isAssessmentMapping?: boolean;
  selectedIds?: string[];
  setSelectedIds?: React.Dispatch<React.SetStateAction<string[]>>;
};

enum AllowedFiltersColumnName {
  DATE = 'DATE',
  STATUS = 'STATUS',
  FOCUS_AREA = 'FOCUS_AREA',
}

const AppointmentHistory = ({
  clientId,
  isTherapistPanel = false,
  isAssessmentMapping = false,
  selectedIds = [],
  setSelectedIds = () => {},
}: Props) => {
  const { historyColumn, therapistClientsAppointmentHistoryColumns } = appointmentHistory();
  const { therapistClientsAppointmentColumns } = useGetClientAppointmentListColumns(
    selectedIds,
    setSelectedIds
  );
  const [isVisible, setIsVisible] = useState(false);
  const [filters, setFilters] = useState<AppointmentHistoryFilterDataType>({});

  const { timezone } = useSelector(currentUser);
  const filterButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleToggle = () => {
    setIsVisible(prev => !prev);
  };

  const ALLOWED_FILTERS = isTherapistPanel
    ? [AllowedFiltersColumnName.DATE, AllowedFiltersColumnName.FOCUS_AREA]
    : [AllowedFiltersColumnName.DATE, AllowedFiltersColumnName.STATUS];

  const filterFields: CommonFilterField<AppointmentHistoryFilterDataType>[] = ALLOWED_FILTERS.map(
    field => {
      switch (field) {
        case AllowedFiltersColumnName.DATE:
          return {
            type: FIELD_TYPE.DATE_RANGE,
            name: 'appointment_date',
            label: 'Appointment Date',
          };
        case AllowedFiltersColumnName.STATUS:
          return {
            type: FIELD_TYPE.SELECT,
            name: 'status',
            label: 'Appointment Status',
            options: APPOINTMENT_STATUS_OPTIONS,
            isMulti: true,
          };
        case AllowedFiltersColumnName.FOCUS_AREA:
          return {
            type: FIELD_TYPE.ASYNC_SELECT,
            name: 'area_of_focus',
            label: 'Focus Area',
            isMulti: true,
            queryKey: fieldOptionsQueryKey.getFieldOptionsKey(FieldOptionType.AREA_OF_FOCUS),
            queryFn: getAreaOfFocusAsync,
          };
        default:
          return null;
      }
    }
  ).filter(Boolean) as CommonFilterField<AppointmentHistoryFilterDataType>[];

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
  } = useTableManagement<AppointmentHistoryDataType, object>({
    apiCall: (params: object) =>
      useGetAppointmentHistory(clientId, {
        ...params,
        sortColumn: params.sortColumn === 'appointment_date' ? 'date' : params.sortColumn,
      }),
    initialQueryParams: {
      page: 1,
      limit: 10,
      ...(filters.appointment_date?.startDate
        ? { startDate: filters.appointment_date.startDate }
        : {}),
      ...(filters.appointment_date?.endDate ? { endDate: filters.appointment_date.endDate } : {}),
      ...(filters.area_of_focus ? { area_of_focus: filters.area_of_focus.map(a => a.value) } : {}),
      ...(filters.status ? { status: filters.status.map(a => a.value) } : {}),
      sortColumn: 'date',
      sortOrder: 'desc',
      timezone: timezone,
      columns: isTherapistPanel
        ? ['id', 'date', 'area_of_focus']
        : ['id', 'therapist_name', 'date', 'status'],
    },
  });

  const { data, isLoading } = apiData ?? {};
  const appointmentHistoryData = data?.data ?? [];
  const total = data?.total ?? 0;

  const today = moment().startOf('day'); // today at 00:00

  const upcomingAppointments =
    appointmentHistoryData && appointmentHistoryData.length > 0
      ? appointmentHistoryData.filter(app => moment(app.appointment_date).isSameOrAfter(today))
      : [];

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    setPageIndex(1);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status && filters.status.length > 0) count += filters.status.length;
    if (filters.appointment_date?.startDate || filters.appointment_date?.endDate) count++;
    if (filters.area_of_focus && filters.area_of_focus.length > 0) count++;
    return count;
  }, [filters]);

  const handleApplyFilter = (vals: AppointmentHistoryFilterDataType) => {
    setIsVisible(false);
    setFilters({ ...vals });
    setPageIndex(1);
  };

  return (
    <div className='flex flex-col gap-5 min-h-[380px]'>
      <div className='flex items-center flex-wrap gap-5'>
        <h5 className='text-lg leading-6 font-bold text-blackdark mr-auto order-1 lg:order-none'>
          Appointment History
        </h5>
        {!isTherapistPanel && (
          <InputField
            type='search'
            placeholder='Search'
            value={searchQuery}
            iconFirst
            onChange={handleSearchChange}
            iconClassName='text-primarygray'
            icon='search'
            parentClassName='w-full lg:w-76 xl:w-360px order-3 lg:order-none'
          />
        )}

        <div className={clsx('relative order-2 lg:order-none')}>
          <Button
            buttonRef={filterButtonRef}
            variant='none'
            icon={<Icon name='dropdownArrow' />}
            className='rounded-lg border-primary border border-solid py-3.5 px-6 !leading-5'
            onClick={handleToggle}
          >
            Filter By
            {activeFilterCount > 0 && (
              <span className='inline-flex items-center justify-center w-5 h-5 text-white text-xs font-semibold bg-primary rounded-full'>
                {activeFilterCount}
              </span>
            )}
          </Button>
          {isVisible && (
            <CommonFilter<AppointmentHistoryFilterDataType>
              fields={filterFields}
              timezone={timezone}
              isLoading={isLoading}
              defaultValues={filters}
              onApply={handleApplyFilter}
              onClear={() => {
                setFilters({});
                setIsVisible(false);
              }}
              onClose={() => setIsVisible(false)}
              buttonRef={filterButtonRef}
            />
          )}
        </div>
      </div>

      {isLoading ? (
        <div className='flex justify-center py-8 min-h-[320px]'>
          <Spinner />
        </div>
      ) : (
        <Table<AppointmentHistoryDataType>
          data={isAssessmentMapping ? upcomingAppointments : appointmentHistoryData}
          columns={
            isTherapistPanel
              ? isAssessmentMapping
                ? therapistClientsAppointmentColumns
                : therapistClientsAppointmentHistoryColumns
              : historyColumn
          }
          className='w-full min-h-[320px]'
          parentClassName='min-h-[320px]'
          totalCount={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
          onSortingChange={onSortingChange}
          sorting={sorting}
          setSorting={setSorting}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default AppointmentHistory;
