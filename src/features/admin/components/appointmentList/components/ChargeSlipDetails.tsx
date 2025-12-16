import React from 'react';

import { PermissionType } from '@/enums';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import Button from '@/stories/Common/Button';

interface ChargeSlipDetailsProps {
  chargeSlipDate: string;
  totalAmount: number;
  amountPaidByInsurance: number;
  selfPay: number;
  onUpdate?: () => void;
  remainingBalanceToPay: number;
  isLoading: boolean;
  onCharge: () => void;
}

const ChargeSlipDetails: React.FC<ChargeSlipDetailsProps> = ({
  chargeSlipDate,
  totalAmount,
  amountPaidByInsurance,
  selfPay,
  remainingBalanceToPay,
  isLoading,
  onUpdate,
  onCharge,
}) => {
  const { hasPermission } = useRoleBasedRouting();
  return (
    <div className='bg-white rounded-20px flex flex-col gap-5'>
      <div className='grid grid-cols-2 lg:grid-cols-3 gap-5'>
        <div className='flex flex-col gap-2'>
          <h6 className='text-blackdark text-base font-semibold leading-5'>Charge Slip Date</h6>
          <p className='font-normal text-primarygray text-sm leading-5'>{chargeSlipDate}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <h6 className='text-blackdark text-base font-semibold leading-5'>Total Amount</h6>
          <p className='font-normal text-primarygray text-sm leading-5'>${totalAmount}</p>
        </div>

        <div className='flex flex-col gap-2'>
          <h6 className='text-blackdark text-base font-semibold leading-5'>
            Amount Paid by Insurance
          </h6>
          <p className='font-normal text-primarygray text-sm leading-5'>${amountPaidByInsurance}</p>
        </div>

        <div className='flex flex-col gap-2'>
          <h6 className='text-blackdark text-base font-semibold leading-5'>Self Pay</h6>
          <p className='font-normal text-primarygray text-sm leading-5'>${selfPay}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <h6 className='text-blackdark text-base font-semibold leading-5'>
            Remaining Balance To Pay
          </h6>
          <p className='font-normal text-primarygray text-sm leading-5'>${remainingBalanceToPay}</p>
        </div>
      </div>
      {remainingBalanceToPay > 0 && (
        <div className='flex items-center justify-end gap-5'>
          {hasPermission(PermissionType.APPOINTMENT_EDIT) && (
            <Button
              variant='filled'
              title='Charge'
              parentClassName='self-end'
              className='rounded-10px !px-6'
              onClick={onCharge}
            />
          )}
          <Button
            onClick={onUpdate}
            title='Update'
            isLoading={isLoading}
            variant='filled'
            className='rounded-10px !px-6'
          />
        </div>
      )}
    </div>
  );
};

export default ChargeSlipDetails;
