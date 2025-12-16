import { RolePermissionModal } from '@/features/admin/components/RolePermission/components/RolePermissionModal';
import { useRolesPermissions } from '@/features/admin/components/RolePermission/hooks/useRolesPermissions';
import type { Role } from '@/features/admin/components/RolePermission/type';
import Button from '@/stories/Common/Button';
import { DeleteModal } from '@/stories/Common/DeleteModal';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import Table from '@/stories/Common/Table';

const RolesPermissions: React.FC = () => {
  const {
    // handleSubmit,
    handleSearch,
    total,
    isLoading,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    searchQuery,
    setSorting,
    sorting,
    onSortingChange,
    isDeleting,
    data,
    columns,
    openModal,
    onCloseModal,
    onDeleteRole,
    openCloseModal,
  } = useRolesPermissions();

  return (
    <div className='bg-white rounded-xl border border-solid border-surface p-5'>
      <div className='flex items-center flex-wrap gap-5 mb-5'>
        <h2 className='text-lg font-bold leading-6 text-blackdark mr-auto order-1 lg:order-none'>
          Roles & Permissions
        </h2>
        <InputField
          name='search'
          type='text'
          placeholder='Search'
          value={searchQuery}
          icon='search'
          iconFirst
          iconClassName='text-primarygray'
          onChange={handleSearch}
          parentClassName='w-full lg:w-76 xl:w-360px order-3 lg:order-none'
        />
        <Button
          title='Add Role'
          variant='filled'
          type='button'
          className='rounded-lg'
          parentClassName='order-2 lg:order-none'
          onClick={() => openCloseModal('add', true)}
          icon={<Icon name='plus' />}
          isIconFirst
        />
      </div>
      {isLoading ? (
        <div className='text-center py-4'>Loading...</div>
      ) : (
        <Table<Role>
          data={data}
          columns={columns}
          totalCount={total}
          sorting={sorting}
          setSorting={setSorting}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
          onSortingChange={onSortingChange}
          className='w-full'
          isLoading={isLoading}
        />
      )}
      {openModal.delete && (
        <DeleteModal
          isOpen={openModal.delete}
          onClose={() => onCloseModal('delete')}
          onSubmit={onDeleteRole}
          isSubmitLoading={isDeleting}
          title='Delete Roles'
          message='Are you sure you want to delete this Role?'
        />
      )}

      {(openModal.add || (openModal.update && openModal.id) || openModal.view) && (
        <RolePermissionModal
          isOpen={openModal.add || openModal.update || openModal.view}
          onClose={() => {
            if (openModal.update) {
              onCloseModal('update');
            } else if (openModal.view) {
              onCloseModal('view');
            } else {
              onCloseModal('add');
            }
          }}
          roleId={openModal.id}
          isView={openModal.view}
        />
      )}
    </div>
  );
};

export default RolesPermissions;
