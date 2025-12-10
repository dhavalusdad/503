import { PermissionType } from '@/enums';
import AddEditRemiderWidgetsModal from '@/features/management/components/reminderWidgets/addEditReminderModal';
import useReminderWidget from '@/features/management/components/reminderWidgets/hooks';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import Button from '@/stories/Common/Button';
import { DeleteModal } from '@/stories/Common/DeleteModal';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import Table from '@/stories/Common/Table';
const ReminderWidget = () => {
  const {
    columns,
    data,
    openAddEditReminderWidgetModal,
    toggleAddEditReminderWidgetModal,
    openDeleteReminderWidgetModal,
    toggleDeleteReminderWidgetModal,
    total,
    id,
    setId,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    handleDeleteReminderWidget,
    handleSearchChange,
    searchQuery,
    onSortingChange,
    sorting,
    setSorting,
    isLoading,
  } = useReminderWidget();

  const { hasPermission } = useRoleBasedRouting();

  return (
    <div className='bg-white rounded-20px border border-solid border-surface p-5'>
      <div className='flex items-center flex-wrap gap-5 mb-5'>
        <h5 className='text-lg leading-6 font-bold text-blackdark'>Reminder Widget</h5>
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
        {hasPermission(PermissionType.WIDGETS_ADD) && (
          <Button
            variant='filled'
            title='Add Remider Widget'
            icon={<Icon name='plus' />}
            isIconFirst
            className='rounded-lg'
            onClick={() => {
              setId('');
              toggleAddEditReminderWidgetModal();
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
      <AddEditRemiderWidgetsModal
        isOpen={openAddEditReminderWidgetModal}
        onClose={() => {
          toggleAddEditReminderWidgetModal();
          setId('');
        }}
        isEdit={!!id}
        id={id}
      />
      <DeleteModal
        isOpen={openDeleteReminderWidgetModal}
        onClose={toggleDeleteReminderWidgetModal}
        onSubmit={() => {
          handleDeleteReminderWidget(id);
        }}
        isSubmitLoading={false}
        message={`Are you sure you want to delete this Remainder Widget?`}
        cancelButton={true}
        confirmButtonText='Delete'
        size='xs'
        title='Confirm Delete'
      />
    </div>
  );
};

export default ReminderWidget;
