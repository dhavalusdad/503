import React from 'react';

import type { Appointment } from '@/api/types/calendar.dto';
import FilterButton from '@/components/layout/Filter/FilterButton';
import useTherapistAppointment from '@/pages/Appointment/hooks';
import InputField from '@/stories/Common/Input';
import Spinner from '@/stories/Common/Loader/Spinner.tsx';
import { Table } from '@/stories/Common/Table';

const TherapistAppointment: React.FC = () => {
  const {
    onSearchChange,
    setPageIndex,
    pageIndex,
    columns,
    pageSize,
    setPageSize,
    onSortingChange,
    sorting,
    setSorting,
    searchQuery,
    isVisible,
    setIsVisible,
    onClearFilter,
    handleApplyFilter,
    filters,
    appointmentsData,
    isAppointmentDataLoading,
    filterFields,
    isLoading,
  } = useTherapistAppointment();

  return (
    <div className='bg-white rounded-20px border border-solid border-surface p-5'>
      <div className='flex items-center flex-wrap gap-5 mb-5'>
        <h4 className='text-lg font-bold text-blackdark mr-auto order-1 lg:order-none'>
          All Appointment
        </h4>
        <InputField
          type='Search'
          placeholder='Search'
          icon='search'
          iconFirst
          iconClassName='text-primarygray'
          value={searchQuery}
          onChange={onSearchChange}
          parentClassName='w-full lg:w-76 xl:w-360px order-3 lg:order-none'
        />
        <div className='order-2 lg:order-none'>
          <FilterButton
            isVisible={isVisible}
            setIsVisible={setIsVisible}
            onClearFilter={onClearFilter}
            handleApplyFilter={handleApplyFilter}
            filterFields={filterFields}
            isLoading={isAppointmentDataLoading}
            defaultValues={filters}
          />
        </div>
      </div>
      {isAppointmentDataLoading ? (
        <Spinner />
      ) : (
        <Table<Appointment>
          data={
            Array.isArray(appointmentsData?.data) ? (appointmentsData?.data as Appointment[]) : []
          }
          columns={columns}
          className='w-full'
          totalCount={appointmentsData?.total || 0}
          pageIndex={pageIndex}
          pageSize={pageSize}
          sorting={sorting}
          setSorting={setSorting}
          onSortingChange={onSortingChange}
          onPageChange={pageIndex => setPageIndex(pageIndex)}
          onPageSizeChange={pageSize => setPageSize(pageSize)}
          pagination={true}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default TherapistAppointment;
