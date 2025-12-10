import FilterButton from '@/components/layout/Filter/FilterButton';
import QueueStatusEditModal from '@/features/admin/components/backofficeQueue/components/QueueStatusEditModal';
import StaffMemberConfirmationModal from '@/features/admin/components/backofficeQueue/components/StaffMemberConfirmationModal';
import useGetQueueManagement from '@/features/admin/components/backofficeQueue/hooks/useQueueManagement';
import type {
  QueueDataType,
  QueueFilterDataType,
} from '@/features/admin/components/backofficeQueue/types';
import InputField from '@/stories/Common/Input';
import Spinner from '@/stories/Common/Loader/Spinner.tsx';
import { Table } from '@/stories/Common/Table';

const BackofficeQueue = () => {
  const {
    columns,
    data,
    total,
    currentPage: pageIndex,
    pageSize,
    setCurrentPage: setPageIndex,
    setPageSize,
    onSortingChange,
    sorting,
    setSorting,
    handleSearchChange,
    filters,
    filterFields,
    handleApplyFilter,
    onClearFilter,
    isVisible,
    setIsVisible,
    isQueueListDataFetching,
    openModal,
    setOpenModal,
    isLoading,
  } = useGetQueueManagement();

  return (
    <div className='bg-white rounded-20px border border-solid border-surface p-5'>
      <div className='flex items-center flex-wrap gap-5 mb-5'>
        <h5 className='text-lg leading-6 font-bold text-blackdark'>BackOffice Queue</h5>
        <InputField
          type='Search'
          placeholder='Search'
          icon='search'
          iconFirst
          onChange={handleSearchChange}
          iconClassName='text-primarygray'
          parentClassName='w-full sm:w-360px ml-auto'
        />
        <FilterButton<QueueFilterDataType>
          isVisible={isVisible}
          setIsVisible={setIsVisible}
          onClearFilter={onClearFilter}
          handleApplyFilter={handleApplyFilter}
          filterFields={filterFields}
          isLoading={isQueueListDataFetching}
          defaultValues={filters}
        />
      </div>

      {isQueueListDataFetching ? (
        <Spinner />
      ) : (
        <Table<QueueDataType>
          data={data || []}
          columns={columns}
          className='w-full !overflow-visible'
          totalCount={total ?? 0}
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
      {openModal && openModal?.modal === 'status' && (
        <QueueStatusEditModal
          queueId={openModal.queue_id}
          isOpen={openModal[openModal['status']] || false}
          onClose={() => setOpenModal(false)}
          status={openModal.status}
        />
      )}

      {openModal && openModal?.modal === 'staffMemberModal' && (
        <StaffMemberConfirmationModal
          isOpen={true}
          onClose={() => setOpenModal(false)}
          queueId={openModal?.queue_id}
          staffMemberId={openModal?.status}
        />
      )}
    </div>
  );
};

export default BackofficeQueue;
