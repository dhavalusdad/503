import { useNavigate } from 'react-router-dom';

import FilterButton from '@/components/layout/Filter/FilterButton';
import { ROUTES } from '@/constants/routePath';
import useStaffManagement from '@/pages/Admin/StaffManagement/hooks';
import { AlertModal } from '@/stories/Common/AlertModal';
import Button from '@/stories/Common/Button';
import { DeleteModal } from '@/stories/Common/DeleteModal';
import InputField from '@/stories/Common/Input';
import Spinner from '@/stories/Common/Loader/Spinner.tsx';
import Table from '@/stories/Common/Table';

const StaffManagement = () => {
  const navigate = useNavigate();
  const {
    columns,
    data,
    total,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    handleSearchChange,
    searchQuery,
    onSortingChange,
    sorting,
    setSorting,
    isVisible,
    isGetStaffListApiPending,
    openModal,
    openCloseModal,
    onDeleteStaffMember,
    isDeleteStaffMemberApiPending,
    onSubmitStatus,
    setIsVisible,
    onClearFilter,
    handleApplyFilter,
    filterFields,
    filters,
    isLoading,
  } = useStaffManagement();

  return (
    <div className='bg-white rounded-20px border border-solid border-surface p-5'>
      <div className='flex items-center flex-wrap gap-5 mb-5'>
        <h5 className='text-lg leading-6 font-bold text-blackdark'>Staff Management</h5>
        <InputField
          type='Search'
          placeholder='Search'
          icon='search'
          iconFirst
          iconClassName='text-primarygray'
          onChange={handleSearchChange}
          value={searchQuery}
          parentClassName='w-full sm:w-360px ml-auto'
        />
        <FilterButton
          isVisible={isVisible}
          setIsVisible={setIsVisible}
          onClearFilter={onClearFilter}
          handleApplyFilter={handleApplyFilter}
          filterFields={filterFields}
          isLoading={isGetStaffListApiPending}
          defaultValues={filters}
        />
        <Button
          variant='filled'
          title='Add New'
          icon={<Icon name='plus' />}
          isIconFirst
          className='rounded-lg'
          onClick={() => navigate(ROUTES.ADD_STAFF_MEMBER.path)}
        />
      </div>
      {isGetStaffListApiPending ? (
        <Spinner />
      ) : (
        <Table
          data={data}
          columns={columns}
          className={'w-full'}
          totalCount={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          sorting={sorting}
          setSorting={setSorting}
          onPageSizeChange={setPageSize}
          onSortingChange={onSortingChange}
          isLoading={isLoading}
        />
      )}
      <DeleteModal
        isOpen={openModal.deleteStaff}
        onClose={() => openCloseModal('deleteStaff', false)}
        onSubmit={onDeleteStaffMember}
        isSubmitLoading={openModal.deleteStaff && isDeleteStaffMemberApiPending}
        title='Delete Staff Member'
        message={`Are you sure you want to delete this Staff Member?`}
      />
      {openModal.statusConfirm && (
        <AlertModal
          isOpen={openModal.statusConfirm}
          onClose={() => openCloseModal('statusConfirm', false)}
          onSubmit={onSubmitStatus}
          alertMessage='Are you sure you want to update the status?'
          title='Confirm Update'
          closeButton={false}
          confirmButtonClassName='!bg-primary hover:!bg-primary/85 !border-primary hover:!border-primary/85'
        />
      )}
    </div>
  );
};

export default StaffManagement;
