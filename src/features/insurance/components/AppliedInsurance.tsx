import clsx from 'clsx';

import type { AppointmentDetailsInsurance } from '@/api/types/calendar.dto';
import DataNotFound from '@/components/common/DataNotFound';

export const AppliedInsurance = ({
  insurancesData = [],
}: {
  insurancesData: AppointmentDetailsInsurance[];
}) => {
  const getInsuranceStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700 border border-solid border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border border-solid border-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border border-solid border-red-300';
      case 'expired':
        return 'bg-gray-300 text-gray-700 border border-solid border-gray-500';
      default:
        return 'bg-gray-300 text-gray-700 border border-solid border-gray-500';
    }
  };

  const getInsuranceStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <div className='grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4'>
      {insurancesData && insurancesData.length > 0 ? (
        insurancesData.map((insurance: AppointmentDetailsInsurance) => (
          <div
            key={insurance.id}
            className='flex items-center justify-between bg-Gray border border-solid border-surface rounded-10px p-3.5'
          >
            <p className='text-base font-medium text-blackdark leading-5 flex-1 truncate'>
              {insurance.insurance.carrier_name}
            </p>
            <span
              className={clsx(
                'text-13px leading-4 font-semibold uppercase px-3 py-1 rounded-full',
                getInsuranceStatusClass(insurance.verification_status)
              )}
            >
              {getInsuranceStatusLabel(insurance.verification_status)}
            </span>
          </div>
        ))
      ) : (
        <div className='col-span-4 text-center'>
          <DataNotFound />
        </div>
      )}
    </div>
  );
};
