import React from 'react';

import { useSelector } from 'react-redux';

import { userQueryKey } from '@/api/common/user.queryKey';
import type { Patient } from '@/api/types/user.dto';
import { getPatientList } from '@/api/user';
import createImage from '@/assets/images/create-option.webp';
import { PermissionType } from '@/enums';
import type { OptionType } from '@/features/calendar/types';
import { getPermissions } from '@/redux/ducks/permissions';
import Image from '@/stories/Common/Image';
import { CustomAsyncSelect } from '@/stories/Common/Select';

const ADD_PATIENT = 'Add New Patient';
const SERVER_URL = import.meta.env.VITE_BASE_URL;

type PatientOption = OptionType & { image?: string | null; data?: Patient };

const loadPatientOptions = async (
  page?: number,
  searchTerm?: string
): Promise<{ data: PatientOption[]; hasMore: boolean }> => {
  const response = await getPatientList(page, searchTerm);
  return response ?? { data: [], hasMore: false };
};

interface PatientSelectionProps {
  onPatientSelect: (patientId: string) => void;
  onAddNewPatient: () => void;
  patientId: string;
}

const PatientSelection: React.FC<PatientSelectionProps> = ({
  patientId,
  onPatientSelect,
  onAddNewPatient,
}) => {
  const permissions = useSelector(getPermissions);
  const hasAddPatientPermission = permissions.find(p => p.name === PermissionType.PATIENT_ADD);

  return (
    <div className='flex flex-col'>
      <CustomAsyncSelect
        value={patientId}
        loadOptions={loadPatientOptions}
        {...(hasAddPatientPermission && {
          AddOption: {
            value: 'CREATE',
            label: ADD_PATIENT,
            image: createImage,
          },
        })}
        queryKey={userQueryKey.getPatientList()}
        pageSize={10}
        onChange={value => {
          const selectedValue = value as PatientOption | null;
          if (!selectedValue) return onPatientSelect('');
          if (selectedValue.label === ADD_PATIENT) return onAddNewPatient();

          return onPatientSelect(String(selectedValue.value ?? ''));
        }}
        placeholder='Select Patient'
        isSearchable
        AddOptionAction={onAddNewPatient}
        isClearable
        error=''
        StylesConfig={{
          control: () => ({
            minHeight: '50px',
            padding: '4px 6px',
            fontSize: '16px',
          }),
          singleValue: () => ({
            fontSize: '16px',
          }),
          menu: () => ({
            padding: '14px',
          }),
          menuList: () => ({
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#43573C' : state.isFocused ? '#E8ECF3' : '',
            color: state.isSelected ? 'white' : '#2E3139',
            padding: '0',
            fontSize: '16px',
            borderRadius: '10px',
            '&:hover': {
              background: '#E8ECF3',
            },
          }),
        }}
        formatOptionLabel={({ data, value, image, label }: PatientOption) => {
          const isCreateOption = value === 'CREATE';

          return (
            <div className='flex items-center gap-2.5 p-1.5'>
              {isCreateOption ? (
                <Image
                  className='w-10 h-10 rounded-full bg-Gray border border-solid border-white'
                  imageClassName='w-full h-full object-cover object-center rounded-full'
                  imgPath={image || ''}
                  alt={label as string}
                />
              ) : (
                <Image
                  imgPath={image ? SERVER_URL + image : ''}
                  firstName={data?.user?.first_name}
                  lastName={data?.user?.last_name}
                  alt='User Avatar'
                  className='w-10 h-10 rounded-full bg-Gray border border-solid border-white'
                  imageClassName='w-full h-full object-cover object-center rounded-full'
                  initialClassName='!text-base'
                />
              )}

              <p className={`text-base truncate font-semibold ${label === ADD_PATIENT ? '' : ''}`}>
                {label}
              </p>
            </div>
          );
        }}
      />
    </div>
  );
};

export default PatientSelection;
