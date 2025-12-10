import { useSelector } from 'react-redux';

import { UserRole } from '@/api/types/user.dto';
import { PermissionType } from '@/enums';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import { DeleteModal } from '@/stories/Common/DeleteModal';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import Table from '@/stories/Common/Table';

import useCredentialListing from './hooks';

const CredentialItemsListing = () => {
  const { role } = useSelector(currentUser);
  const { hasPermission } = useRoleBasedRouting();
  const {
    columns,
    data,
    total,
    setId,
    toggleAddEdit,
    toggleDeleteModal,
    pageIndex,
    pageSize,
    setPageIndex,
    openDeleteModal,
    handleDelete,
    setPageSize,
    handleSearchChange,
    searchQuery,
    onSortingChange,
    sorting,
    setSorting,
    isLoading,
  } = useCredentialListing();

  return (
    <div className='bg-white rounded-20px border border-solid border-surface p-5'>
      <div className='flex items-center flex-wrap gap-5 mb-5'>
        <h5 className='text-lg leading-6 font-bold text-blackdark'>Credential Items</h5>
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
        {(role === UserRole.ADMIN ||
          (role === UserRole.BACKOFFICE && hasPermission(PermissionType.THERAPIST_EDIT))) && (
          <Button
            variant='filled'
            title='Add Credential Items'
            icon={<Icon name='plus' />}
            isIconFirst={true}
            className='rounded-lg'
            onClick={() => {
              setId('');
              toggleAddEdit();
            }}
          />
        )}
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
        isLoading={isLoading}
      />
      <DeleteModal
        isOpen={openDeleteModal}
        onClose={() => toggleDeleteModal(true)}
        onSubmit={handleDelete}
        isSubmitLoading={false}
        message={`Are you sure you want to delete this Credential Items?`}
        cancelButton={true}
        confirmButtonText='Delete'
        size='xs'
        title='Delete State'
      />
    </div>
  );
};

export default CredentialItemsListing;
