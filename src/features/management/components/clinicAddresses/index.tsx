import { PermissionType } from '@/enums';
import AddEditClinicAddressesModal from '@/features/management/components/clinicAddresses/addEditClinicAddressesModal';
import useClinicAddresses from '@/features/management/components/clinicAddresses/hooks';
import ViewClinicDetailsModal from '@/features/management/components/clinicAddresses/viewClinicAddressesModal';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import Button from '@/stories/Common/Button';
import { DeleteModal } from '@/stories/Common/DeleteModal';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import Table from '@/stories/Common/Table';

const ClinicAddresses = () => {
  const {
    columns,
    data,
    openModal,
    openCloseModal,
    onCloseModal,
    total,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    handleDeleteClinicAddress,
    handleSearchChange,
    searchQuery,
    onSortingChange,
    sorting,
    setSorting,
    isLoading,
  } = useClinicAddresses();

  const { hasPermission } = useRoleBasedRouting();
  return (
    <div className='bg-white rounded-20px border border-solid border-surface p-5'>
      <div className='flex items-center flex-wrap gap-5 mb-5'>
        <h5 className='text-lg leading-6 font-bold text-blackdark'>Clinic Addresses</h5>
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
        {hasPermission(PermissionType.CLINIC_ADDRESSES_ADD) && (
          <Button
            variant='filled'
            title='Add Clinic Address'
            icon={<Icon name='plus' />}
            isIconFirst
            className='rounded-lg'
            onClick={() => {
              openCloseModal('addEdit', true);
            }}
          />
        )}
      </div>
      <Table
        data={Array.isArray(data) ? data : []}
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
        isLoading={isLoading}
      />
      <ViewClinicDetailsModal
        isOpen={openModal.viewDetails}
        onClose={() => onCloseModal('viewDetails')}
        clinicData={openModal.data}
      />
      <AddEditClinicAddressesModal
        isOpen={openModal.addEdit}
        onClose={() => onCloseModal('addEdit')}
        id={openModal.id}
      />

      <DeleteModal
        isOpen={openModal.delete}
        onClose={() => onCloseModal('delete')}
        onSubmit={handleDeleteClinicAddress}
        isSubmitLoading={false}
        message={
          openModal.is_used
            ? `Are you sure you want to delete this address? It will be deleted from all the items used at.`
            : `Are you sure you want to delete this address?`
        }
        cancelButton={true}
        confirmButtonText='Delete'
        size='xs'
        title='Confirm Delete'
      />
    </div>
  );
};

export default ClinicAddresses;
