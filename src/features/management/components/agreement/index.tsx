import clsx from 'clsx';

import { PermissionType } from '@/enums';
import AddEditAgreementModal from '@/features/management/components/agreement/addEditAgreementModal';
import useAgreement from '@/features/management/components/agreement/hooks';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import Button from '@/stories/Common/Button';
import { DeleteModal } from '@/stories/Common/DeleteModal';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import Table from '@/stories/Common/Table';
import { WarningModal } from '@/stories/Common/WarningModal';

const Agreement = () => {
  const {
    columns,
    data,
    openAddEditAgreementModal,
    toggleAddEditAgreementModal,
    openDeleteAgreementModal,
    toggleDeleteAgreementModal,
    total,
    pageSize,
    id,
    setId,
    pageIndex,
    setPageIndex,
    setPageSize,
    handleDeleteAgreement,
    handleSearchChange,
    searchQuery,
    onSortingChange,
    sorting,
    setSorting,
    canDelete,
    openValidationMessageModal,
    setOpenValidationMessageModal,
    isLoading,
  } = useAgreement();
  const { hasPermission } = useRoleBasedRouting();

  return (
    <div className='bg-white rounded-20px border border-solid border-surface p-5'>
      <div className='flex items-center flex-wrap gap-5 mb-5'>
        <h5 className='text-lg leading-6 font-bold text-blackdark mr-auto order-1 lg:order-none'>
          Agreements
        </h5>
        <InputField
          type='search'
          placeholder='Search agreements...'
          icon='search'
          iconFirst
          iconClassName='text-primarygray'
          onChange={handleSearchChange}
          value={searchQuery}
          parentClassName={clsx(
            hasPermission(PermissionType.AGREEMENTS_ADD)
              ? 'w-full lg:w-76 xl:w-360px order-3 lg:order-none'
              : 'w-76 xl:w-360px order-2 lg:order-none'
          )}
        />
        {hasPermission(PermissionType.AGREEMENTS_ADD) && (
          <Button
            variant='filled'
            title='Add Agreement'
            icon={<Icon name='plus' />}
            isIconFirst
            className='rounded-lg'
            parentClassName='order-2 lg:order-none'
            onClick={() => {
              setId('');
              toggleAddEditAgreementModal();
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

      {openAddEditAgreementModal && (
        <AddEditAgreementModal
          isOpen={openAddEditAgreementModal}
          onClose={() => {
            toggleAddEditAgreementModal();
            setId('');
          }}
          isEdit={!!id}
          id={id}
        />
      )}

      {canDelete ? (
        <DeleteModal
          isOpen={openDeleteAgreementModal}
          onClose={() => toggleDeleteAgreementModal(false, true)}
          onSubmit={() => {
            handleDeleteAgreement(id);
          }}
          isSubmitLoading={false}
          message={`Are you sure you want to delete this Agreement ?`}
          cancelButton={true}
          confirmButtonText='Delete'
          size='xs'
          title='Confirm Delete'
        />
      ) : (
        <WarningModal
          isOpen={openValidationMessageModal}
          onClose={() => setOpenValidationMessageModal(false)}
          message='This Agreement is already in use?'
          title='Already In use!'
        />
      )}
    </div>
  );
};

export default Agreement;
