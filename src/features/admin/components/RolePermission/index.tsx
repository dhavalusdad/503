import { RolePermissionModal } from '@/features/admin/components/RolePermission/components/RolePermissionModal';
import { useRolesPermissions } from '@/features/admin/components/RolePermission/hooks/useRolesPermissions';
import type { Role } from '@/features/admin/components/RolePermission/type';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import Table from '@/stories/Common/Table';

const RolesPermissions: React.FC = () => {
  const {
    useRolePermissionTable,
    onCloseDeleteModal,
    handleEditRole,
    handleSubmit,
    handleModalClose,
    handleAddRole,
    confirmAndDeleteRole,
    handleDeleteRole,
    handleView,
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
    selectedPermission,
    showModal,
    isDeleting,
    deleteModal,
    selectedRoleData,
    backOfficeRoles,
    permissionList,
  } = useRolesPermissions();

  return (
    <div className='bg-white rounded-xl border border-solid border-surface p-5'>
      <div className='flex items-center flex-wrap gap-5 mb-5'>
        <h2 className='text-lg font-bold leading-6 text-blackdark'>Roles & Permissions</h2>
        <InputField
          name='search'
          type='text'
          placeholder='Search'
          value={searchQuery}
          icon='search'
          iconFirst
          iconClassName='text-primarygray'
          onChange={handleSearch}
          parentClassName='w-360px ml-auto'
        />
        <Button
          title='Add Role'
          variant='filled'
          type='button'
          className='rounded-lg'
          onClick={handleAddRole}
          icon={<Icon name='plus' />}
          isIconFirst
        />
      </div>
      {isLoading ? (
        <div className='text-center py-4'>Loading...</div>
      ) : (
        <Table<Role>
          data={backOfficeRoles}
          columns={useRolePermissionTable({
            onEdit: handleEditRole,
            onDelete: handleDeleteRole,
            onView: handleView,
          })}
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
      {deleteModal.isOpen && (
        <DeleteModal
          isOpen={deleteModal.isOpen}
          onClose={onCloseDeleteModal}
          onSubmit={confirmAndDeleteRole}
          isSubmitLoading={isDeleting}
          title='Delete Roles'
          message='Are you sure you want to delete this Role?'
        />
      )}

      {showModal && (
        <RolePermissionModal
          isOpen={showModal}
          onClose={handleModalClose}
          onSubmit={handleSubmit}
          permissionList={permissionList}
          defaultValues={
            selectedRoleData
              ? {
                  name: selectedRoleData.name,
                  permissions: {
                    selected: selectedPermission.selected,
                    notSelected: selectedPermission.notSelected,
                  },
                  isAssignFormToPatient: selectedRoleData.isAssignFormToPatient,
                  isPasswordResetTherapist: selectedRoleData.isPasswordResetTherapist,
                  isPasswordResetClient: selectedRoleData.isPasswordResetClient,
                  readOnly: selectedRoleData.readOnly,
                }
              : undefined
          }
          isEditing={!!selectedRoleData}
        />
      )}
    </div>
  );
};

export default RolesPermissions;
