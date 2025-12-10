import clsx from 'clsx';
import { useFormContext } from 'react-hook-form';

import { useGetCitiesByState } from '@/api/city';
import { useGetCountries, useGetStateByCountry } from '@/api/user';
import { QUEUE_REQUEST_METADATA_FIELD_NAME } from '@/features/admin/components/backofficeQueue/constant';
import InputField from '@/stories/Common/Input';
import Select from '@/stories/Common/Select';

import ProfileTippy from './TherapistProfileTippy';

import type { TherapistProfileFormData } from '../types';

type Props = {
  checkIsRequiredField: (field: keyof TherapistProfileFormData) => boolean;
  checkIfFieldIsDisabled: (field_name: string) => boolean;
};
const TherapistAddress = (props: Props) => {
  const { checkIsRequiredField, checkIfFieldIsDisabled } = props;

  const {
    register,
    control,
    formState: { errors },
    setValue,
    getValues,
    watch,
  } = useFormContext<TherapistProfileFormData>();

  // ** Services **
  const { data: allCountries, isPending: isFetchingCountries } = useGetCountries();

  const selectedCountry = watch('country');
  const { data: allStatesResponse, isPending: isFetchingStates } = useGetStateByCountry({
    country_id: (selectedCountry?.value as string) || (getValues('country')?.value as string),
  });
  const selectedState = watch('state');
  const { data: citiesData } = useGetCitiesByState(selectedState?.value || '', {
    options: { enabled: !!selectedState?.value },
    isCredentialed: true,
  });

  return (
    <div className='bg-Gray rounded-20px p-5 relative border border-solid border-surface'>
      <h3 className='text-lg font-bold leading-6 text-blackdark mb-5'>Personal Address</h3>
      <div className='grid grid-cols-2 gap-5'>
        <ProfileTippy enable={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.ADDRESS1)}>
          <InputField
            type='text'
            register={register}
            parentClassName={clsx('col-span-2', errors.address1 ? 'border-red-500' : '')}
            error={errors.address1?.message}
            name='address1'
            label='Street 1'
            labelClass='!text-base !leading-22px'
            inputClass={'!text-base !leading-6 !p-3 bg-white'}
            isRequired={checkIsRequiredField('address1')}
            isDisabled={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.ADDRESS1)}
          />
        </ProfileTippy>
        <ProfileTippy enable={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.ADDRESS2)}>
          <InputField
            type='text'
            register={register}
            parentClassName={clsx('col-span-2', errors.address2 ? 'border-red-500' : '')}
            error={errors.address2?.message}
            name='address2'
            label='Street 2'
            labelClass='!text-base !leading-22px'
            inputClass={'!text-base !leading-6 !p-3 bg-white'}
            isRequired={checkIsRequiredField('address2')}
            isDisabled={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.ADDRESS2)}
          />
        </ProfileTippy>
        <ProfileTippy enable={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.CITY)}>
          <Select
            options={
              citiesData?.length
                ? citiesData
                : [{ value: '', label: 'No cities for selected state' }]
            }
            label='City'
            labelClassName='!text-base !leading-22px'
            name='city'
            placeholder='Select City'
            error={errors.city?.message}
            parentClassName=''
            onChange={(selected: { value: string }) => {
              if (!selected?.value) {
                setValue('city', null, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }
            }}
            StylesConfig={{
              control: () => ({
                minHeight: '50px',
              }),
              singleValue: () => ({
                fontSize: '16px',
              }),
              placeholder: () => ({
                fontSize: '16px',
              }),
            }}
            control={control}
            isRequired={checkIsRequiredField('city')}
            isDisabled={
              checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.CITY) ||
              !selectedState?.value
            }
          />
        </ProfileTippy>
        <ProfileTippy enable={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.STATE)}>
          <Select
            options={
              allStatesResponse?.length
                ? allStatesResponse.map(s => ({
                    label: s.short_form,
                    value: s.value,
                    country_id: s.country_id,
                  }))
                : [{ value: '', label: 'No states for selected country' }]
            }
            label='State'
            labelClassName='!text-base !leading-22px'
            name='state'
            placeholder='Select State'
            error={errors.state?.message}
            parentClassName=''
            onChange={(selected: { value: string }) => {
              if (!selected.value) {
                setValue('state', null, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }
              setValue('city', null, {
                shouldDirty: true,
              });
            }}
            StylesConfig={{
              control: () => ({
                minHeight: '50px',
              }),
              singleValue: () => ({
                fontSize: '16px',
              }),
              placeholder: () => ({
                fontSize: '16px',
              }),
            }}
            control={control}
            isLoading={isFetchingStates}
            isDisabled={
              checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.STATE) ||
              !getValues('country')?.value
            }
          />
        </ProfileTippy>
        <ProfileTippy enable={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.COUNTRY)}>
          <Select
            options={allCountries?.filter(
              (option: { value: string; label: string }) => option.label === 'United States'
            )}
            label='Country'
            name='country'
            labelClassName='!text-base !leading-22px'
            placeholder='Select Country'
            onChange={(selected: { value: string }) => {
              const country_id = selected?.value;
              if ((country_id && getValues('state')?.country_id !== country_id) || !selected) {
                setValue('state', null, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
                setValue('city', null, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }
            }}
            error={errors.country?.message}
            parentClassName=''
            StylesConfig={{
              control: () => ({
                minHeight: '50px',
              }),
              singleValue: () => ({
                fontSize: '16px',
              }),
              placeholder: () => ({
                fontSize: '16px',
              }),
            }}
            control={control}
            isLoading={isFetchingCountries}
            isClearable
            isRequired={checkIsRequiredField('country')}
            isDisabled={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.COUNTRY)}
          />
        </ProfileTippy>
        <ProfileTippy
          enable={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.POSTAL_CODE)}
        >
          <InputField
            type='string'
            label='ZIP'
            register={register}
            name='postal_code'
            error={errors.postal_code?.message}
            isRequired={checkIsRequiredField('address1')}
            parentClassName=''
            placeholder='Enter ZIP code'
            labelClass='!text-base !leading-22px'
            inputClass={'!text-base !leading-6 !p-3 bg-white'}
            isDisabled={checkIfFieldIsDisabled(QUEUE_REQUEST_METADATA_FIELD_NAME.POSTAL_CODE)}
          />
        </ProfileTippy>
      </div>
    </div>
  );
};

export default TherapistAddress;
