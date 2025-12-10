import clsx from 'clsx';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { useGetTransactionById } from '@/api/transaction';
import { currentUser } from '@/redux/ducks/user';
import SectionLoader from '@/stories/Common/Loader/Spinner';

import type { TransactionData } from '../types';

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
      {/* --- Two column grid --- */}
      <div className='grid grid-cols-1 xl:grid-cols-2 gap-5'>
        {/* ---------------- Left Section ---------------- */}
        <div className='flex flex-col gap-5'>
          {/* Basic transaction info */}
          <div className='bg-white border border-solid border-surface rounded-lg p-5'>
            <h3 className='text-lg font-bold text-blackdark leading-6 mb-5'>Transaction Details</h3>
            <div className='flex flex-col gap-3.5'>
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
                  Status :
                </span>
                <span className='text-base font-normal text-primarygray leading-22px capitalize'>
                  {getStatusBadge(transaction.status)}
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
                    `text-base font-normal leading-22px`,
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
                    `text-base font-normal leading-22px`,
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
            </div>
          </div>
          {/* Transaction Response Details */}
          <div className='bg-white border border-solid border-surface rounded-lg p-5'>
            <h3 className='text-lg font-bold text-blackdark leading-6 mb-5'>
              Transaction Response
            </h3>
            {/* Errors (if any) */}
            {transactionErrors.length > 0 && (
              <div className='bg-red-100/50 text-red-600 p-5 rounded-lg border border-red-300'>
                <h4 className='font-bold mb-3 text-lg leading-5'>Errors:</h4>
                <ul className='list-disc pl-5'>
                  {transactionErrors.map((err, i) => (
                    <li className='text-base' key={i}>
                      {err.errorText}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Success Messages */}
            {transactionMessages.length > 0 && (
              <div className='bg-green-100/50 text-green-600 p-5 rounded-lg border border-green-300'>
                <h4 className='font-bold mb-3 text-lg leading-5'>Messages:</h4>
                <ul className='list-disc pl-5'>
                  {transactionMessages.map((msg, i) => (
                    <li className='text-base' key={i}>
                      {msg.description || msg.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        {/* ---------------- Right Section (JSON Viewer) ---------------- */}
        <div className='bg-Gray rounded-lg p-5 border border-solid border-surface'>
          <h3 className='font-bold text-blackdark text-lg leading-6 mb-5'>
            Raw Response Info (JSON)
          </h3>
          <pre className='text-xs bg-white p-3 border border-solid border-surface rounded-lg overflow-auto max-h-443px'>
            {JSON.stringify(responseInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
