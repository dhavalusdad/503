import React, { useCallback } from 'react';

import { getClientListForAdmin } from '@/api/clientManagement';
import type { NavigationState } from '@/features/appointment/component/ClientAppointmentsBooking/types';
import type { OptionType } from '@/features/calendar/types';
import Image from '@/stories/Common/Image';
import { CustomAsyncSelect } from '@/stories/Common/Select';

const SERVER_URL = import.meta.env.VITE_BASE_URL;

interface AdminPatientSelectionProps {
  onPatientSelect: (patient: NavigationState['patient']) => void;
  patient: NavigationState['patient'];
  carrier: string;
  isDisabled: boolean;
  paymentMethod: string;
  isRequired?: boolean;
}

const AdminPatientSelection: React.FC<AdminPatientSelectionProps> = ({
  onPatientSelect,
  patient,
  carrier,
  isDisabled,
  paymentMethod,
  isRequired = false,
}) => {
  const loadOptions = useCallback(
    (page: number, searchTerm: string) =>
      getClientListForAdmin(page, searchTerm, {
        carrier: carrier,
      }),
    [carrier]
  );

  return (
    <CustomAsyncSelect
      isRequired={isRequired}
      isDisabled={isDisabled}
      queryKey={['patient-selection', 'patient-list-for-admin']}
      loadOptions={loadOptions}
      refetchOnChangeValue={[carrier, paymentMethod]}
      pageSize={10}
      value={patient.value ? { ...patient } : ''}
      onChange={value => {
        const selectedValue = value as OptionType | null;
        onPatientSelect({ ...selectedValue });
      }}
      placeholder='Select Patient'
      isSearchable={true}
      isClearable
      error=''
      label={`Select Patient`}
      labelClassName='!text-base !leading-5'
      StylesConfig={{
        control: () => ({
          minHeight: '50px',
          padding: '4px 6px',
          fontSize: '16px',
        }),
      }}
      formatOptionLabel={(data: OptionType) => (
        <div className='flex items-center gap-2.5'>
          {data.value === 'CREATE' ? (
            <Image
              className='w-8 h-8 rounded-full bg-Gray border border-solid border-white'
              imageClassName='w-full h-full object-cover object-center rounded-full'
              imgPath={data.image || ''}
              alt={data.label}
            />
          ) : (
            <Image
              imgPath={data.image ? SERVER_URL + data.image : ''}
              firstName={data?.first_name}
              lastName={data?.last_name}
              alt='User Avatar'
              className='w-8 h-8 rounded-full bg-Gray border border-solid border-white'
              imageClassName='w-full h-full object-cover object-center rounded-full'
              initialClassName='!text-sm'
            />
          )}

          <p className={`text-base leading-5 truncate`}>{data.label}</p>
        </div>
      )}
    />
  );
};

export default AdminPatientSelection;
