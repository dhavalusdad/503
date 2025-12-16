import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import FilterButton from '@/components/layout/Filter/FilterButton';
import { ROUTES } from '@/constants/routePath';
import { PermissionType } from '@/enums';
import AppointmentEditModal from '@/features/admin/components/appointmentList/components/AppointmentEditModal';
import { useAppointmentList } from '@/features/admin/components/appointmentList/hooks/useAppointmentList';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import { clearAppointmentFilters } from '@/redux/ducks/appointment-filters';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import Spinner from '@/stories/Common/Loader/Spinner.tsx';
import Table from '@/stories/Common/Table';

const AppointmentList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hasPermission } = useRoleBasedRouting();

  const {
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    onSortingChange,
    sorting,
    setSorting,
    columns,
    appointmentData,
    total,
    isAppointmentListLoading,
    isVisible,
    handleSearchChange,
    setIsVisible,
    openCloseModal,
    modalState,
    filterFields,
    handleApplyFilter,
    filters,
    onClearFilter,
    isLoading,
  } = useAppointmentList();

  return (
    <div className='bg-white rounded-20px border border-solid border-surface p-5'>
      {/* Header */}
      <div className='flex items-center flex-wrap gap-5 mb-5'>
        <h2 className='text-lg font-bold leading-6 text-blackdark mr-auto order-1 lg:order-none'>
          Appointment List
        </h2>
        <InputField
          type='Search'
          placeholder='Search'
          icon='search'
          iconFirst
          iconClassName='text-primarygray'
          onChange={handleSearchChange}
          name='search'
          parentClassName='w-full lg:w-76 xl:w-360px order-4 lg:order-none'
        />
        <div className='order-3 lg:order-none'>
          <FilterButton
            isVisible={isVisible}
            setIsVisible={setIsVisible}
            onClearFilter={onClearFilter}
            handleApplyFilter={handleApplyFilter}
            filterFields={filterFields}
            isLoading={isAppointmentListLoading}
            defaultValues={filters}
          />
        </div>
        {hasPermission(PermissionType.APPOINTMENT_ADD) && (
          <Button
            variant='filled'
            title='Book an Appointment'
            icon={<Icon name='plus' />}
            isIconFirst
            className='rounded-lg'
            parentClassName='order-2 lg:order-none'
            onClick={() => {
              dispatch(clearAppointmentFilters());
              navigate(ROUTES.ADMIN_BOOK_APPOINTMENT.path);
            }}
          />
        )}
      </div>
      {/* Table */}
      {isAppointmentListLoading ? (
        <Spinner />
      ) : (
        <Table
          data={appointmentData ? appointmentData : []}
          columns={columns}
          className={'w-full'}
          totalCount={total ?? 0}
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

      {modalState.editAppointment && modalState.appointment && (
        <AppointmentEditModal
          isOpen={modalState.editAppointment}
          onClose={() => openCloseModal('editAppointment', false)}
          selectedAppointment={modalState.appointment}
        />
      )}
    </div>
  );
};

export default AppointmentList;
