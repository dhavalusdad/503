import { PermissionType } from '@/enums';
import AddEditUserTagModal from '@/features/management/components/userTags/addEditAlertTagModal';
import useTag from '@/features/management/components/userTags/hooks';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import Button from '@/stories/Common/Button';
import { DeleteModal } from '@/stories/Common/DeleteModal';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import Table from '@/stories/Common/Table';

const Tag = () => {
  const {
    columns,
    data,
    openAddEditTagModal,
    toggleAddEditTagModal,
    openDeleteTagModal,
    toggleDeleteTagModal,
    total,
    id,
    setId,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    handleDeleteTags,
    handleSearchChange,
    searchQuery,
    onSortingChange,
    sorting,
    setSorting,
    warning,
    isLoading,
  } = useTag();
  const { hasPermission } = useRoleBasedRouting();
  return (
    <div className='bg-white rounded-20px border border-solid border-surface p-5'>
      <div className='flex items-center flex-wrap gap-5 mb-5'>
        <h5 className='text-lg leading-6 font-bold text-blackdark'>Alert Tags</h5>
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
        {hasPermission(PermissionType.ALERT_TAGS_ADD) && (
          <Button
            variant='filled'
            title='Add Tag'
            icon={<Icon name='plus' />}
            isIconFirst
            className='rounded-lg'
            onClick={() => {
              setId('');
              toggleAddEditTagModal();
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
      <AddEditUserTagModal
        isOpen={openAddEditTagModal}
        onClose={() => {
          toggleAddEditTagModal();
          setId('');
        }}
        isEdit={!!id}
        id={id}
      />

      <DeleteModal
        isOpen={openDeleteTagModal}
        onClose={() => toggleDeleteTagModal(false)}
        onSubmit={() => {
          handleDeleteTags(id);
        }}
        isSubmitLoading={false}
        message={
          warning
            ? `Are you sure you want to delete this tag ?.It will be deleted from all the items used at`
            : 'Are you sure you want to delete this tag ?'
        }
        cancelButton={true}
        confirmButtonText='Delete'
        size='xs'
        title='Confirm Delete'
      />
    </div>
  );
};

export default Tag;
