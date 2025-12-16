import clsx from 'clsx';

import { PermissionType } from '@/enums';
import AddEditAreaOfFocusModal from '@/features/management/components/areaOfFocus/addEditAreaOfFocusModal';
import useAreaOfFocus from '@/features/management/components/areaOfFocus/hooks';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import Button from '@/stories/Common/Button';
import { DeleteModal } from '@/stories/Common/DeleteModal';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import Table from '@/stories/Common/Table';

// import DeleteAreaOfFocusModal from './DeleteAreaOfFocusModal';

const AreaOfFocus = () => {
  const {
    columns,
    data,
    openAddEditAreaOfFocusModal,
    toggleAddEditAreaOfFocusModal,
    openDeleteAreaOfFocusModal,
    toggleDeleteAreaOfFocusModal,
    total,
    id,
    setId,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    handleDeleteAreaOfFocus,
    handleSearchChange,
    searchQuery,
    onSortingChange,
    sorting,
    setSorting,
    isLoading,
  } = useAreaOfFocus();

  const { hasPermission } = useRoleBasedRouting();

  return (
    <div className='bg-white rounded-20px border border-solid border-surface p-5'>
      <div className='flex items-center flex-wrap gap-5 mb-5'>
        <h5 className='text-lg leading-6 font-bold text-blackdark mr-auto order-1 lg:order-none'>
          Area of Focus
        </h5>
        <InputField
          type='Search'
          placeholder='Search'
          icon='search'
          iconFirst
          iconClassName='text-primarygray'
          onChange={handleSearchChange}
          value={searchQuery}
          parentClassName={clsx(
            hasPermission(PermissionType.AREA_OF_FOCUS_ADD)
              ? 'w-full lg:w-76 xl:w-360px order-3 lg:order-none'
              : 'w-76 xl:w-360px order-2 lg:order-none'
          )}
        />
        {hasPermission(PermissionType.AREA_OF_FOCUS_ADD) && (
          <Button
            variant='filled'
            title='Add Area of Focus'
            icon={<Icon name='plus' />}
            isIconFirst={true}
            className='rounded-lg'
            parentClassName='order-2 lg:order-none'
            onClick={() => {
              setId('');
              toggleAddEditAreaOfFocusModal();
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
      <AddEditAreaOfFocusModal
        isOpen={openAddEditAreaOfFocusModal}
        onClose={() => {
          toggleAddEditAreaOfFocusModal();
          setId('');
        }}
        isEdit={!!id}
        id={id}
      />

      <DeleteModal
        isOpen={openDeleteAreaOfFocusModal}
        onClose={() => toggleDeleteAreaOfFocusModal(true)}
        onSubmit={() => {
          handleDeleteAreaOfFocus(id);
        }}
        isSubmitLoading={false}
        message={`Are you sure you want to delete this Area of focus?`}
        cancelButton={true}
        confirmButtonText='Delete'
        size='xs'
        title='Delete Area of Focus'
      />
    </div>
  );
};

export default AreaOfFocus;
