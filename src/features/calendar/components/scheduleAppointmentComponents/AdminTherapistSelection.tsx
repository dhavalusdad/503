import React, { useCallback } from 'react';

import { getTherapistListForAdmin } from '@/api/therapist';
import type { NavigationState } from '@/features/appointment/component/ClientAppointmentsBooking/types';
import type { OptionType } from '@/features/calendar/types';
import Image from '@/stories/Common/Image';
import { CustomAsyncSelect } from '@/stories/Common/Select';

const SERVER_URL = import.meta.env.VITE_BASE_URL;
interface AdminTherapistSelectionProps {
  onTherapistSelect: (therapist: NavigationState['patient']) => void;
  therapist: NavigationState['patient'];
  isDisabled?: boolean;
  filters: Record<string, string>;
  isRequired?: boolean;
}

const AdminTherapistSelection: React.FC<AdminTherapistSelectionProps> = ({
  onTherapistSelect,
  therapist,
  isDisabled = false,
  filters,
  isRequired = false,
}) => {
  const loadOptions = useCallback(
    (page: number, searchTerm: string) => getTherapistListForAdmin(page, searchTerm, filters),
    [filters]
  );

  return (
    <CustomAsyncSelect
      isRequired={isRequired}
      isDisabled={isDisabled}
      refetchOnChangeValue={[filters]}
      queryKey={['therapist-selection', 'therapist-list-for-admin']}
      loadOptions={loadOptions}
      pageSize={10}
      value={therapist?.value ? { ...therapist } : ''}
      onChange={value => {
        const selectedValue = value as OptionType | null;
        onTherapistSelect({ ...selectedValue });
      }}
      placeholder='Select Therapist'
      isSearchable
      isClearable
      error=''
      label={`Select Therapist`}
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
          {data.value.id === 'CREATE' ? (
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
              initialClassName='!text-base'
            />
          )}

          <p className={`text-base leading-5 truncate`}>{data.label}</p>
        </div>
      )}
    />
  );
};

export default AdminTherapistSelection;
