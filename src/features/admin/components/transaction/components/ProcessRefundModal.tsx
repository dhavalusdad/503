import { useMemo, useEffect, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import { useRevertTransaction } from '@/api/transaction';
import type { SelectOption } from '@/features/calendar/types';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import Modal from '@/stories/Common/Modal';
import RadioField from '@/stories/Common/RadioBox';
import Select from '@/stories/Common/Select';
import TextArea from '@/stories/Common/Textarea';

import type { Transaction } from '../types';

interface ProcessRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export interface ProcessRefundFormValues {
  refundAmount: string;
  refundType: 'refund' | 'void';
  reason: { label: string; value: string };
  notes: string;
}

const REASON_OPTIONS = [
  { label: 'Duplicate Charge', value: 'Duplicate Charge' },
  { label: 'Fraudulent', value: 'Fraudulent' },
  { label: 'Requested by Customer', value: 'Requested by Customer' },
  { label: 'Other', value: 'Other' },
];

export const ProcessRefundModal: React.FC<ProcessRefundModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const { mutate: revertTransaction, isPending: isRevertPending } = useRevertTransaction(
    transaction?.appointment_id || transaction?.appointment?.id
  );

  const validationSchema = useMemo(() => {
    return yup.object().shape({
      refundAmount: yup
        .string()
        .required('Refund amount is required')
        .test('is-number', 'Must be a valid number', val => !isNaN(Number(val)))
        .test('positive', 'Amount must be greater than 0', val => Number(val) > 0)
        .test(
          'max-amount',
          `Maximum refundable: $${Number(transaction?.amount || '0') - Number(transaction?.refunded_amount || '0') || '0'}`,
          val => {
            return (
              Number(val) <=
              Number(transaction?.amount || '0') - Number(transaction?.refunded_amount || '0')
            );
          }
        ),
      refundType: yup.string().oneOf(['refund', 'void']).required('Refund type is required'),
      reason: yup
        .object()
        .shape({
          label: yup.string().required('Reason is required'),
          value: yup.string().required('Reason is required'),
        })
        .required('Reason is required'),
      notes: yup.string().required('Notes is required'),
    });
  }, [transaction]);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ProcessRefundFormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      refundType: transaction?.is_settled ? 'refund' : 'void',
      refundAmount: transaction?.is_settled ? '' : transaction?.amount,
      notes: '',
      reason: undefined,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (isOpen && transaction) {
      reset({
        refundType: transaction?.is_settled ? 'refund' : 'void',
        refundAmount: getValues('refundType') === 'void' ? transaction?.amount : '',
        notes: '',
        reason: undefined,
      });
      setStep(1);
    }
  }, [isOpen, transaction, reset]);

  const handleFormSubmit = () => {
    setStep(2);
  };

  const handleConfirm = () => {
    if (!transaction?.id) return;
    const values = getValues();
    revertTransaction(
      {
        transactionId: transaction.id,
        data: {
          amount: Number(values.refundAmount),
          reason: values.reason.label,
          note: values.notes,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const renderConfirmationStep = () => {
    const values = getValues();
    return (
      <div className='flex flex-col items-center gap-5'>
        <div className='flex flex-col items-center gap-2'>
          <div className='w-16 h-16 rounded-full bg-yellow/10 flex items-center justify-center'>
            <Icon name='warning' className='text-yellow w-8 h-8' />
          </div>
          <h3 className='text-lg font-bold text-blackdark'>
            Confirm {values.refundType === 'refund' ? 'Refund' : 'Void'}
          </h3>
          <p className='text-sm text-primarygray'>
            Please review the {values.refundType} details before confirming
          </p>
        </div>

        <div className='w-full border border-surface rounded-10px p-4 flex flex-col gap-4'>
          <div className='flex justify-between items-center'>
            <span className='text-sm text-primarygray'>Transaction ID</span>
            <span className='text-sm font-bold text-blackdark'>
              {transaction?.transaction_id || '-'}
            </span>
          </div>
          <div className='bg-surface h-[1px] w-full' />
          <div className='flex justify-between items-center'>
            <span className='text-sm text-primarygray'>Customer ID</span>
            <span className='text-sm font-bold text-blackdark'>
              {transaction?.client?.customer_profile_id || '-'}
            </span>
          </div>
          <div className='bg-surface h-[1px] w-full' />
          <div className='flex justify-between items-center'>
            <span className='text-sm text-primarygray'>Original Amount</span>
            <span className='text-sm font-bold text-blackdark'>$ {transaction?.amount || '0'}</span>
          </div>
          <div className='bg-surface h-[1px] w-full' />
          <div className='flex justify-between items-center'>
            <span className='text-sm text-primarygray'>
              {values.refundType === 'refund' ? 'Refund' : 'Void'} Amount
            </span>
            <span className='text-sm font-bold text-red-500'>$ {values.refundAmount}</span>
          </div>
          <div className='bg-surface h-[1px] w-full' />
          <div className='flex justify-between items-center'>
            <span className='text-sm text-primarygray'>Type</span>
            <span className='text-sm font-bold text-blackdark capitalize'>{values.refundType}</span>
          </div>
          <div className='bg-surface h-[1px] w-full' />
          <div className='flex justify-between items-center'>
            <span className='text-sm text-primarygray'>Reason</span>
            <span className='text-sm font-bold text-blackdark'>{values.reason?.label}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      id='refund-modal'
      isOpen={isOpen}
      onClose={handleClose}
      closeButton={false}
      title={
        <div className='flex items-center gap-3'>
          {step === 2 && (
            <div
              className='cursor-pointer hover:bg-surface rounded-full p-1 transition-all'
              onClick={() => setStep(1)}
            >
              <Icon name='arrowLeft' className='w-6 h-6 text-blackdark' />
            </div>
          )}
          <span>
            {step === 1
              ? transaction?.is_settled
                ? 'Process Refund'
                : 'Void Transaction'
              : `Confirm ${getValues('refundType') === 'refund' ? 'Refund' : 'Void'}`}
          </span>
        </div>
      }
      size='lg'
      footer={
        <div className='flex items-center justify-end gap-3 w-full'>
          <Button
            variant='outline'
            title={step === 1 ? 'Cancel' : 'No'}
            onClick={step === 1 ? handleClose : () => setStep(1)}
            className='rounded-10px !px-6'
          />
          <Button
            variant='filled'
            title={
              step === 1
                ? 'Continue'
                : `Confirm ${getValues('refundType') === 'refund' ? 'Refund' : 'Void'}`
            }
            onClick={step === 1 ? handleSubmit(handleFormSubmit) : handleConfirm}
            isLoading={isRevertPending}
            className='rounded-10px !px-6'
          />
        </div>
      }
    >
      {step === 1 ? (
        <div className='flex flex-col gap-5'>
          <div className='flex items-center justify-between bg-surface/30 p-4 rounded-10px border border-surface'>
            <div>
              <p className='text-xs text-primarygray mb-1'>Transaction ID</p>
              <p className='text-sm font-bold text-blackdark'>
                {transaction?.transaction_id || '-'}
              </p>
            </div>
            <div className='text-right'>
              <p className='text-xs text-primarygray mb-1'>Customer ID</p>
              <p className='text-sm font-bold text-blackdark'>
                {transaction?.client?.customer_profile_id || '-'}
              </p>
            </div>
          </div>

          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-normal text-blackdark'>Original Amount</label>
            <div className='w-full py-3.5 px-3.5 border border-solid border-surface rounded-10px text-sm text-blackdark bg-gray-50'>
              $ {transaction?.amount || '0'}
            </div>
          </div>

          <InputField
            label='Refund Amount'
            isRequired
            placeholder={getValues('refundType') === 'void' ? transaction?.amount : '$ 0.00'}
            type='number'
            name='refundAmount'
            register={register}
            error={errors.refundAmount?.message}
            isDisabled={getValues('refundType') === 'void'}
            info={`Maximum refundable: $${Number(transaction?.amount || '0') - Number(transaction?.refunded_amount || '0')}`}
          />

          <div className='flex flex-col gap-2'>
            <label className='text-sm font-normal text-blackdark'>
              Type <span className='text-red-500'>*</span>
            </label>
            <div className='flex gap-4'>
              {transaction?.is_settled ? (
                <div
                  className={`flex-1 p-4 border rounded-10px cursor-pointer transition-all ${getValues('refundType') === 'refund' ? 'border-primary bg-primary/5' : 'border-surface'}`}
                  onClick={() => setValue('refundType', 'refund', { shouldValidate: true })}
                >
                  <div className='flex items-start gap-3'>
                    <RadioField
                      id='refund-radio'
                      name='refundType'
                      value='refund'
                      isChecked={getValues('refundType') === 'refund'}
                      onChange={() => setValue('refundType', 'refund', { shouldValidate: true })}
                    />
                    <div>
                      <p className='text-sm font-bold text-blackdark'>Refund</p>
                      <p className='text-xs text-primarygray'>Standard refund</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`flex-1 p-4 border rounded-10px cursor-pointer transition-all ${getValues('refundType') === 'void' ? 'border-primary bg-primary/5' : 'border-surface'}`}
                  onClick={() => setValue('refundType', 'void', { shouldValidate: true })}
                >
                  <div className='flex items-start gap-3'>
                    <RadioField
                      id='void-radio'
                      name='refundType'
                      value='void'
                      isChecked={getValues('refundType') === 'void'}
                      onChange={() => setValue('refundType', 'void', { shouldValidate: true })}
                    />
                    <div>
                      <p className='text-sm font-bold text-blackdark'>Void</p>
                      <p className='text-xs text-primarygray'>Same-day unsettled</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {errors.refundType?.message && (
              <p className='text-xs text-red-500'>{errors.refundType?.message}</p>
            )}
          </div>

          <Select
            label='Reason'
            isRequired
            options={REASON_OPTIONS}
            placeholder='Select a reason'
            name='reason'
            value={getValues('reason')}
            onChange={value => setValue('reason', value as SelectOption, { shouldValidate: true })}
            error={errors.reason?.value?.message}
            portalRootId='refund-modal'
          />

          <TextArea
            label='Notes'
            placeholder='Enter notes'
            rows={4}
            value={getValues('notes')}
            onChange={e => setValue('notes', e.target.value, { shouldValidate: true })}
            name='notes'
            error={errors.notes?.message}
          />
        </div>
      ) : (
        renderConfirmationStep()
      )}
    </Modal>
  );
};
