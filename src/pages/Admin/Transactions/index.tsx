import { useMemo, useState } from 'react';

import { useSelector } from 'react-redux';

import { getClientsAsync } from '@/api/clientManagement';
import { useSendApprovalTransaction } from '@/api/transaction';
import type { CommonFilterField } from '@/components/layout/Filter';
import FilterButton from '@/components/layout/Filter/FilterButton';
import { FIELD_TYPE } from '@/constants/CommonConstant';
import { SessionType, TransactionAction, TransactionStatus, TransactionType } from '@/enums';
import useTransaction, {
  type TransactionFilterType,
} from '@/features/admin/components/transaction/hooks';
import type { Transaction } from '@/features/admin/components/transaction/types';
import { isAdminPanelRole } from '@/helper';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import InputField from '@/stories/Common/Input';
import Modal from '@/stories/Common/Modal';
import { Table } from '@/stories/Common/Table';

const SESSION_TYPE_OPTION = [
  { value: SessionType.VIRTUAL, label: 'Virtual' },
  { value: SessionType.CLINIC, label: 'Clinic' },
];

const TRANSACTION_TYPE_OPTION = [
  { value: TransactionType.CHARGE, label: 'Charge' },
  { value: TransactionType.REFUND, label: 'Refund' },
];
const TRANSACTION_STATUS_OPTION = [
  { value: TransactionStatus.SUCCESS, label: 'Success' },
  { value: TransactionStatus.FAILED, label: 'Failed' },
  { value: TransactionStatus.PENDING, label: 'Pending' },
];

const Transactions = () => {
  const [filters, setFilters] = useState<TransactionFilterType>({});
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const { role } = useSelector(currentUser);

  const { mutate: sendApproval, isPending, isError } = useSendApprovalTransaction();

  const {
    columns,
    data,
    total,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    handleSearchChange,
    searchQuery,
    onSortingChange,
    sorting,
    setSorting,
    isLoading,
    toggleDeclineModal,
    setToggleDeclineModal,
    toggleApprovalModal,
    setToggleApprovalModal,
  } = useTransaction(filters);

  const filterFields: CommonFilterField<TransactionFilterType>[] = useMemo(
    () => [
      {
        type: FIELD_TYPE.DATE_RANGE,
        name: 'created_at' as const,
        label: 'Transaction Date',
      },
      ...(isAdminPanelRole(role)
        ? [
            {
              type: FIELD_TYPE.ASYNC_SELECT,
              name: 'client_id' as const,
              label: 'Client',
              isMulti: true,
              queryFn: getClientsAsync,
              queryKey: 'third-party-api-logs-clients',
            },
          ]
        : []),
      {
        type: FIELD_TYPE.SELECT,
        name: 'session_type' as const,
        label: 'Session Type',
        options: SESSION_TYPE_OPTION,
      },
      {
        type: FIELD_TYPE.SELECT,
        name: 'transaction_type' as const,
        label: 'Transaction Type',
        options: TRANSACTION_TYPE_OPTION,
      },
      {
        type: FIELD_TYPE.SELECT,
        name: 'transaction_status' as const,
        label: 'Transaction Status',
        options: TRANSACTION_STATUS_OPTION,
        isMulti: true,
      },
    ],
    []
  );

  const handleApplyFilter = (vals: TransactionFilterType) => {
    setFilters({ ...vals });
    setIsFilterVisible(false);
    setPageIndex(1);
  };

  const handleClearFilter = () => {
    setFilters({});
    setIsFilterVisible(false);
    setPageIndex(1);
  };

  return (
    <div className='bg-white rounded-20px border border-solid border-surface p-5'>
      <div className='flex items-center flex-wrap gap-5 mb-5'>
        <h5 className='text-lg leading-6 font-bold text-blackdark mr-auto order-1 lg:order-none'>
          Transactions
        </h5>
        <InputField
          type='Search'
          placeholder='Search'
          icon='search'
          iconFirst
          iconClassName='text-primarygray'
          onChange={handleSearchChange}
          value={searchQuery}
          parentClassName='w-full lg:w-76 xl:w-360px order-3 lg:order-none'
        />
        <div className='order-2 lg:order-none'>
          <FilterButton<TransactionFilterType>
            isVisible={isFilterVisible}
            setIsVisible={setIsFilterVisible}
            onClearFilter={handleClearFilter}
            handleApplyFilter={handleApplyFilter}
            filterFields={filterFields}
            defaultValues={filters}
            isLoading={isLoading}
          />
        </div>
      </div>
      <Table
        data={data as unknown as Transaction[]}
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
      <Modal
        isOpen={toggleApprovalModal.isModalOpen}
        onClose={() => setToggleApprovalModal({ transaction_id: null, isModalOpen: false })}
        title={`Approve Transaction Request`}
        size='xs'
        closeButton={false}
        contentClassName='pt-30px'
        footerClassName='flex items-center justify-between gap-5'
        footer={
          <>
            <Button
              variant='outline'
              title='Cancel'
              onClick={() => setToggleApprovalModal({ transaction_id: null, isModalOpen: false })}
              className='rounded-10px !leading-5 !px-6 w-full'
              parentClassName='w-2/4'
            />
            <Button
              variant='filled'
              title='Confirm'
              isLoading={isPending}
              isDisabled={isPending}
              onClick={async () => {
                await sendApproval({
                  transaction_id: toggleApprovalModal.transaction_id,
                  action: TransactionAction.APPROVE,
                });
                setToggleApprovalModal({ transaction_id: null, isModalOpen: false });
              }}
              className='rounded-10px !leading-5 !px-6 w-full'
              parentClassName='w-2/4'
            />
          </>
        }
      >
        <p className='text-lg font-semibold text-blackdark leading-7 text-center'>
          Do you want to approve this transaction? <br /> This action cannot be undone.
        </p>
      </Modal>
      <Modal
        isOpen={toggleDeclineModal.isModalOpen && !isError}
        onClose={() => setToggleDeclineModal({ transaction_id: null, isModalOpen: false })}
        title={`Decline Transaction Request`}
        size='xs'
        closeButton={false}
        contentClassName='pt-30px'
        footerClassName='flex items-center justify-between gap-5'
        footer={
          <>
            <Button
              variant='outline'
              title='Cancel'
              onClick={() => setToggleDeclineModal({ transaction_id: null, isModalOpen: false })}
              className='rounded-10px !leading-5 !px-6 w-full'
              parentClassName='w-2/4'
            />
            <Button
              variant='filled'
              title='Confirm'
              isLoading={isPending}
              isDisabled={isPending}
              onClick={async () => {
                await sendApproval({
                  transaction_id: toggleDeclineModal.transaction_id,
                  action: TransactionAction.DECLINE,
                });
                setToggleDeclineModal({ transaction_id: null, isModalOpen: false });
              }}
              className='rounded-10px !leading-5 !px-6 w-full'
              parentClassName='w-2/4'
            />
          </>
        }
      >
        <p className='text-lg font-semibold text-blackdark leading-7 text-center'>
          Do you want to decline this transaction? <br /> This action cannot be undone"
        </p>
      </Modal>
    </div>
  );
};

export default Transactions;
