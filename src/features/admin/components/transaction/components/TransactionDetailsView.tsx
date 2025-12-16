import { useState } from 'react';

import clsx from 'clsx';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { useGetTransactionById } from '@/api/transaction';
import { ROUTES } from '@/constants/routePath';
import { TransactionStatus } from '@/enums';
import {
  StatusBadge,
  TransactionStatusBadge,
} from '@/features/admin/components/transaction/components/StatusBadge';
import type { TransactionData } from '@/features/admin/components/transaction/types';
import { currentUser } from '@/redux/ducks/user';
import SectionLoader from '@/stories/Common/Loader/Spinner';
import Table from '@/stories/Common/Table';
import Tooltip from '@/stories/Common/Tooltip/Tooltip';

import type { ColumnDef, SortingState } from '@tanstack/react-table';

const getStatusBadge = (status: string) => {
  const normalized = status.toLowerCase();

  let label = '';
  let classes = '';

  switch (normalized) {
    case 'success':
      label = 'Success';
      classes = 'bg-green-100 text-green-800 border-green-200';
      break;

    case 'pending':
      label = 'Pending';
      classes = 'bg-yellow-100 text-yellow-800 border-yellow-300';
      break;
    case 'cancelled':
      label = 'Cancelled';
      classes = 'bg-red-100 text-red-800 border-red-200';
      break;
    case 'expired':
      label = 'Expired';
      classes = 'bg-red-100 text-red-800 border-red-200';
      break;
    default:
      label = 'Failed';
      classes = 'bg-red-100 text-red-800 border-red-200';
      break;
  }

  return (
    <span
      className={clsx(
        'px-3 py-1 rounded-full text-sm leading-3.5 block font-medium border',
        classes
      )}
    >
      {label}
    </span>
  );
};

export const TransactionDetailsView = () => {
  const { id } = useParams();
  const { data, isLoading } = useGetTransactionById(id);
  const { timezone } = useSelector(currentUser);

  if (isLoading) return <SectionLoader />;
  if (!data) return <div>No data found</div>;

  const transaction: TransactionData = data;
  const responseInfo = transaction.response_info || {};
  const transactionResponse = responseInfo.transactionResponse ?? {};
  const transactionMessages = transactionResponse.messages ?? [];
  const transactionErrors = transactionResponse.errors ?? [];

  return (
    <div className='p-5 bg-white rounded-20px border border-solid border-surface'>
      <div className=' flex flex-col gap-5'>
        <div className='w-full'>
          <div className='bg-white border border-solid border-surface rounded-lg p-5'>
            <div className='flex items-start justify-between mb-5'>
              <h3 className='text-lg font-bold text-blackdark leading-6'>Transaction Details</h3>
              <div>{getStatusBadge(transaction.status)}</div>
            </div>

            <div className='flex flex-col gap-3.5 mb-6'>
              <div className='flex items-center justify-between'>
                <span className='text-base font-semibold text-blackdark leading-22px'>
                  Transaction ID :
                </span>
                <span className='text-base font-normal text-primarygray leading-22px break-all text-right'>
                  {transaction.transaction_id}
                </span>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-base font-semibold text-blackdark leading-22px'>
                  Amount :
                </span>
                <span className='text-base font-normal text-primarygray leading-22px'>
                  ${transaction.amount}
                </span>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-base font-semibold text-blackdark leading-22px'>Type :</span>
                <span className='text-base font-normal text-primarygray leading-22px capitalize'>
                  {transaction.transaction_type}
                </span>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-base font-semibold text-blackdark leading-22px'>
                  Partial Payment :
                </span>
                <span
                  className={clsx(
                    'text-base font-normal leading-22px',
                    transaction.is_partial_payment ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {transaction.is_partial_payment ? 'Yes' : 'No'}
                </span>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-base font-semibold text-blackdark leading-22px'>
                  Settled :
                </span>
                <span
                  className={clsx(
                    'text-base font-normal leading-22px',
                    transaction.is_settled ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {transaction.is_settled ? 'Yes' : 'No'}
                </span>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-base font-semibold text-blackdark leading-22px'>
                  Transaction Date :
                </span>
                <span className='text-base font-normal text-primarygray leading-22px flex items-center gap-2'>
                  <span>{moment(transaction.created_at).tz(timezone).format('MMM DD, YYYY')}</span>
                  <span>{moment(transaction.created_at).tz(timezone).format('h:mm A')}</span>
                </span>
              </div>

              {transaction?.reason && (
                <div className='flex items-center justify-between'>
                  <span className='text-base font-semibold text-blackdark leading-22px'>
                    Reason :
                  </span>
                  <span className='text-base font-normal text-primarygray leading-22px capitalize'>
                    {transaction?.reason || '-'}
                  </span>
                </div>
              )}

              {transaction?.note && (
                <div className='flex items-center justify-between'>
                  <span className='text-base font-semibold text-blackdark leading-22px'>
                    Note :
                  </span>
                  <span className='text-base font-normal text-primarygray leading-22px capitalize'>
                    {transaction?.note || '-'}
                  </span>
                </div>
              )}
            </div>

            {transaction.status === TransactionStatus.SUCCESS ||
            transaction.status === TransactionStatus.PENDING ||
            transaction.status === TransactionStatus.FAILED ? (
              <div className='pt-4 border-t border-solid border-surface'>
                {transactionErrors.length === 0 && transactionMessages.length === 0 && (
                  <div className='text-sm text-primarygray'>No response messages available.</div>
                )}

                <div className='flex flex-col gap-3'>
                  {transactionErrors.length > 0 && (
                    <div className='rounded-lg border border-red-300 bg-red-50/80 p-3'>
                      <div className='flex items-center justify-between mb-2'>
                        <strong className='text-sm text-red-700'>Errors</strong>
                      </div>
                      <ul className='list-disc pl-5 space-y-1'>
                        {transactionErrors.map((err, i) => (
                          <li key={i} className='text-sm text-red-700'>
                            {err.errorText}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {transactionMessages.length > 0 && (
                    <div className='rounded-lg border border-green-300 bg-green-50/80 p-3'>
                      <div className='flex items-center justify-between mb-2'>
                        <strong className='text-sm text-green-700'>Message</strong>
                      </div>
                      <ul className='list-disc pl-5 space-y-1'>
                        {transactionMessages.map((msg, i) => (
                          <li key={i} className='text-sm text-green-700'>
                            {msg.description || msg.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className='rounded-lg border border-red-300 bg-red-50/80 p-3'>
                <div className='flex items-center justify-between mb-2'>
                  <strong className='text-sm text-red-700'>Errors</strong>
                </div>
                <p className='text-sm text-red-700'>
                  {transaction.status === TransactionStatus.CANCELLED
                    ? 'Transaction has been cancelled.'
                    : 'Transaction expired due to timeout'}
                </p>
              </div>
            )}
          </div>
        </div>

        {transaction?.childTransactions && transaction.childTransactions.length > 0 && (
          <div className='bg-white border border-solid border-surface rounded-lg p-5'>
            <div className='flex flex-col gap-5'>
              <h3 className='text-lg font-bold text-blackdark leading-6'>Related Transactions</h3>
              <ChildTransactionsTable data={transaction.childTransactions} timezone={timezone} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ChildTransactionsTable = ({
  data,
  timezone,
}: {
  data: TransactionData[];
  timezone: string;
}) => {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<TransactionData>[] = [
    {
      accessorKey: 'transaction_id',
      header: 'Transaction ID',
      cell: ({ row }) => (
        <span
          onClick={() => navigate(ROUTES.TRANSACTION_DETAILS.navigatePath(row.original.id))}
          className='hover:text-primary hover:underline cursor-pointer underline-offset-2'
        >
          {row.original.transaction_id}
        </span>
      ),
    },
    {
      accessorKey: 'transaction_type',
      header: 'Type',
      cell: ({ row }) => <TransactionStatusBadge status={row.original.transaction_type || ''} />,
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => <>${row.original.amount}</>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }) => (
        <>{moment(row.original.created_at).tz(timezone).format('MMM DD, YYYY h:mm A')}</>
      ),
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => <>{row.original.reason || '-'}</>,
    },
    {
      accessorKey: 'note',
      header: 'Note',
      meta: {
        cellClassName: 'max-w-96',
      },
      cell: ({ row }) => (
        <Tooltip
          placement='auto'
          className='bg-primary text-white text-sm px-3 py-1 rounded-lg shadow-lg max-w-96'
          label={row.original.note || '-'}
        >
          <span className='truncate w-full block'>{row.original.note || '-'}</span>
        </Tooltip>
      ),
    },
  ];

  return (
    <Table
      data={data}
      columns={columns}
      totalCount={data.length}
      pageIndex={0}
      pageSize={data.length}
      sorting={sorting}
      setSorting={setSorting}
      pagination={false}
    />
  );
};
