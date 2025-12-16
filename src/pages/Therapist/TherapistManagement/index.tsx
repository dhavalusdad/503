import FilterButton from '@/components/layout/Filter/FilterButton';
import ProviderSyncModal from '@/pages/Therapist/TherapistManagement/components/ProviderSyncModal';
import useTherapistManagement from '@/pages/Therapist/TherapistManagement/hooks';
import { AlertModal } from '@/stories/Common/AlertModal';
import InputField from '@/stories/Common/Input';
import Spinner from '@/stories/Common/Loader/Spinner.tsx';
import { Table } from '@/stories/Common/Table';

const TherapistManagement = () => {
  // ** Custom Hooks **

  const {
    onSearchChange,
    therapistData,
    isGetTherapistListApiPending,
    isUpdateStatusLoading,
    setPageIndex,
    pageIndex,
    columns,
    pageSize,
    setPageSize,
    onSortingChange,
    sorting,
    setSorting,
    openModal,
    onCloseModal,
    onUpdateStatus,
    searchQuery,
    isVisible,
    setIsVisible,
    onClearFilter,
    handleApplyFilter,
    filters,
    filterFields,
    isLookupProvidersLoading,
    providerLookupData,
    isLoading,
  } = useTherapistManagement();

  return (
    <div className='bg-white border border-solid border-surface rounded-20px p-5'>
      <div className='flex items-center flex-wrap gap-5 mb-5'>
        <h5 className='text-lg leading-6 font-bold text-blackdark mr-auto order-1 lg:order-none'>
          Therapist Management
        </h5>
        <InputField
          type='Search'
          placeholder='Search'
          icon='search'
          iconFirst
          iconClassName='text-primarygray'
          onChange={onSearchChange}
          parentClassName='w-full lg:w-76 xl:w-360px order-3 lg:order-none'
          value={searchQuery}
        />
        <div className='order-2 lg:order-none'>
          <FilterButton
            isVisible={isVisible}
            setIsVisible={setIsVisible}
            onClearFilter={onClearFilter}
            handleApplyFilter={handleApplyFilter}
            filterFields={filterFields}
            isLoading={isGetTherapistListApiPending}
            defaultValues={filters}
          />
        </div>
      </div>
      {isGetTherapistListApiPending ? (
        <Spinner />
      ) : (
        <Table
          data={therapistData ? therapistData?.data : []}
          columns={columns}
          className={'w-full'}
          totalCount={therapistData?.total ?? 0}
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
      {openModal.updateStatus && (
        <AlertModal
          isOpen={openModal.updateStatus}
          onClose={() => onCloseModal('updateStatus')}
          onSubmit={onUpdateStatus}
          alertMessage='Are you sure you want to update the status?'
          title='Confirm Update'
          isSubmitLoading={isUpdateStatusLoading}
          closeButton={false}
          confirmButtonClassName='!bg-primary hover:!bg-primary/85 !border-primary hover:!border-primary/85'
        />
      )}
      {openModal.syncProvider && (
        <ProviderSyncModal
          isOpen={openModal.syncProvider}
          onClose={() => onCloseModal('syncProvider')}
          data={providerLookupData}
          isLoading={isLookupProvidersLoading}
          therapistId={openModal.id ?? ''}
        />
      )}
    </div>
  );
};

export default TherapistManagement;
