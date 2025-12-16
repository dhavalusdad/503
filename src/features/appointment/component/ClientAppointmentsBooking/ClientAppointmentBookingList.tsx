import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import FilterButton from '@/components/layout/Filter/FilterButton';
import { ROUTES } from '@/constants/routePath';
import useClientAppointmentBooking from '@/features/appointment/component/ClientAppointmentsBooking/hooks/useClientAppointmentBooking';
import AppointmentDetailsModal from '@/features/appointment/component/TherapistAppointment/AppointmentDetailsModal';
import appointmentManagement from '@/features/appointment/hooks';
import { clearAppointmentFilters } from '@/redux/ducks/appointment-filters';
import { selectIsTourActive } from '@/redux/ducks/tour';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import { Table } from '@/stories/Common/Table';

const ClientAppointmentBooking = () => {
  // ** Custom Hooks **
  const { openAppointmentDetailModal, setOpenAppointmentDetailModal } = appointmentManagement();

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const {
    columns,
    total,
    data,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    handleSearchChange,
    searchQuery,
    onSortingChange,
    sorting,
    setSorting,
    filterFields,
    filters,
    handleApplyFilter,
    isVisible,
    onClearFilter,
    setIsVisible,
    isClientAppointmentListFetching,
    isLoading,
  } = useClientAppointmentBooking();

  const isTourActive = useSelector(selectIsTourActive);
  const showTourSkeleton = data.length == 0 && isTourActive;

  return (
    <>
      <div className='bg-white rounded-20px border border-solid border-surface p-5'>
        <div className='flex items-center flex-wrap gap-5 mb-5'>
          <h3 className='text-lg font-bold text-blackdark mr-auto order-1 lg:order-none'>
            My Appointments
          </h3>
          <InputField
            type='Search'
            placeholder='Search'
            icon='search'
            onChange={handleSearchChange}
            iconFirst
            value={searchQuery}
            iconClassName='text-primarygray'
            parentClassName='w-full lg:w-76 xl:w-360px order-4 lg:order-none'
          />
          <div className='relative order-3 lg:order-none'>
            <FilterButton
              isVisible={isVisible}
              setIsVisible={setIsVisible}
              onClearFilter={onClearFilter}
              handleApplyFilter={handleApplyFilter}
              filterFields={filterFields}
              isLoading={isClientAppointmentListFetching}
              defaultValues={filters}
            />
          </div>
          <Button
            variant='filled'
            title='Book an Appointment'
            icon={<Icon name='plus' />}
            isIconFirst
            parentClassName='order-2 lg:order-none'
            className='rounded-lg'
            onClick={() => {
              dispatch(clearAppointmentFilters());
              navigate(ROUTES.BOOK_APPOINTMENT.path);
            }}
          />
        </div>

        <Table
          data={data}
          columns={columns}
          className='w-full'
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalCount={total}
          onSortingChange={onSortingChange}
          sorting={sorting}
          setSorting={setSorting}
          isLoading={isLoading || isClientAppointmentListFetching || showTourSkeleton}
        />
      </div>

      {openAppointmentDetailModal && (
        <AppointmentDetailsModal
          isOpen={openAppointmentDetailModal}
          onClose={() => setOpenAppointmentDetailModal(false)}
          closeButton={true}
        />
      )}
    </>
  );
};

export default ClientAppointmentBooking;
