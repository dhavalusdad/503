import { useEffect, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import { getCarrierByStateAsync } from '@/api/carrier';
import { useGetCitiesByState } from '@/api/city';
import { cityQueryKey } from '@/api/common/city.queryKey';
import { fieldOptionsQueryKey } from '@/api/common/fieldOptions.queryKey';
import { languageQueryKey } from '@/api/common/language.queryKey';
import { getFieldOptionsAsync } from '@/api/field-option';
import { getLanguagesAsync } from '@/api/language';
import { useGetAllCredentialedStates } from '@/api/state';
import { GENDER_OPTION, selectStyles, SESSION_OPTIONS } from '@/constants/CommonConstant';
import { FieldOptionType, PaymentMethodEnum } from '@/enums';
import { appointmentFilterSchema } from '@/features/appointment/component/ClientAppointmentsBooking/validationSchema';
import type { AppointmentFiltersProps } from '@/features/appointment/types';
import Button from '@/stories/Common/Button';
import Select, { CustomAsyncSelect, type SelectOption } from '@/stories/Common/Select';

import type { MultiValue } from 'react-select';

const AppointmentFilters = ({
  filter,
  isLoading,
  onSelectChange,
  onSearch,
  onClearFilters,
  activeSearch,
}: AppointmentFiltersProps) => {
  const [clearKey, setClearKey] = useState(0);

  const { data: statesData, isLoading: statesLoading } = useGetAllCredentialedStates({
    isCredentialed: true,
  });

  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesByState(
    filter.state?.value || '',
    {
      options: {
        enabled: !!filter.state,
        queryKey: cityQueryKey.getCitiesByStateKey(filter.state?.value || ''),
      },
      isCredentialed: true,
    }
  );

  const {
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(appointmentFilterSchema),
    defaultValues: filter,
    mode: 'onChange',
  });

  // clear fileter on first load

  useEffect(() => {
    onClearFilters();
    reset({});
  }, []);

  const hasAnyFilterValue = Object.values(filter).some(value => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== '' && value !== null && value !== undefined;
  });

  const handleClearFilters = () => {
    onClearFilters();
    reset();
    setClearKey(prev => prev + 1);
  };

  return (
    <>
      <div
        className='grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5'
        id='tour-filters-section'
      >
        <Select
          control={control}
          key={`state-${clearKey}`}
          name='state'
          label='State'
          isClearable={true}
          labelClassName='!text-base'
          options={statesData?.length ? statesData : []}
          placeholder='Select State'
          error={errors.state?.message}
          onChange={value => {
            onSelectChange('carrier', null);
            onSelectChange('city', null);
            setValue('carrier', null);
            setValue('city', null);
            onSelectChange('state', value as SelectOption);
          }}
          isLoading={statesLoading}
          StylesConfig={selectStyles}
        />

        <Select
          control={control}
          key={`city-${clearKey}`}
          name='city'
          // isRequired={true}
          label='City'
          isClearable={true}
          labelClassName='!text-base'
          options={citiesData?.length ? citiesData : []}
          placeholder='Select City'
          error={errors.city?.message}
          onChange={selected => onSelectChange('city', selected as SelectOption)}
          isLoading={citiesLoading}
          StylesConfig={selectStyles}
        />

        <CustomAsyncSelect
          control={control}
          isRequired={true}
          key={`payment-${clearKey}`}
          label='Payment Method'
          name='paymentMethod'
          isClearable={true}
          labelClassName='!text-base'
          loadOptions={(page, searchTerm) =>
            getFieldOptionsAsync('PaymentMethod', page, searchTerm)
          }
          queryKey={fieldOptionsQueryKey.getFieldOptionsKey('PaymentMethod')}
          pageSize={10}
          onChange={value => {
            onSelectChange('carrier', null);
            setValue('carrier', null);
            onSelectChange('paymentMethod', value as SelectOption);
          }}
          StylesConfig={selectStyles}
          error={errors.paymentMethod?.message}
        />

        {filter.paymentMethod?.label === PaymentMethodEnum.Insurance && (
          <CustomAsyncSelect
            isRequired={true}
            control={control}
            name='carrier'
            key={`insurance-${clearKey}`}
            label='Insurance'
            isClearable={true}
            labelClassName='!text-base'
            value={filter.carrier}
            refetchOnChangeValue={[filter.state]}
            loadOptions={(page, searchTerm) =>
              getCarrierByStateAsync(page, searchTerm, filter.state?.value)
            }
            queryKey={fieldOptionsQueryKey.getFieldOptionsKey('Carrier')}
            pageSize={10}
            onChange={value => onSelectChange('carrier', value as SelectOption)}
            StylesConfig={selectStyles}
            error={errors.carrier?.message}
          />
        )}

        <CustomAsyncSelect
          control={control}
          isRequired={true}
          name='therapyType'
          key={`therapy-${clearKey}`}
          label='Therapy Type'
          isClearable={true}
          labelClassName='!text-base'
          loadOptions={(page, searchTerm) =>
            getFieldOptionsAsync(FieldOptionType.THERAPY_TYPE, page, searchTerm)
          }
          queryKey={fieldOptionsQueryKey.getFieldOptionsKey(FieldOptionType.THERAPY_TYPE)}
          pageSize={10}
          onChange={value => onSelectChange('therapyType', value as SelectOption)}
          StylesConfig={selectStyles}
          value={filter.therapyType}
          error={errors.therapyType?.message}
        />

        <CustomAsyncSelect
          control={control}
          isRequired={true}
          key={`focus-${clearKey}`}
          label='Area of Focus'
          name='areaOfFocus'
          isClearable={true}
          labelClassName='!text-base'
          loadOptions={(page, searchTerm) =>
            getFieldOptionsAsync(FieldOptionType.AREA_OF_FOCUS, page, searchTerm)
          }
          queryKey={fieldOptionsQueryKey.getFieldOptionsKey(FieldOptionType.AREA_OF_FOCUS)}
          pageSize={10}
          isMulti
          onChange={value => onSelectChange('areaOfFocus', value as MultiValue<SelectOption>)}
          StylesConfig={selectStyles}
          value={filter.areaOfFocus?.length > 0 ? filter.areaOfFocus : null}
          error={errors.areaOfFocus?.message}
        />

        <CustomAsyncSelect
          control={control}
          key={`language-${clearKey}`}
          label='Languages'
          name='language'
          isClearable={true}
          labelClassName='!text-base'
          loadOptions={getLanguagesAsync}
          queryKey={languageQueryKey.getLanguagesKey()}
          pageSize={10}
          onChange={value => onSelectChange('language', value as SelectOption)}
          StylesConfig={selectStyles}
          value={filter.language || null}
          error={errors.language?.message}
        />

        <Select
          control={control}
          name='therapistGender'
          key={`gender-${clearKey}`}
          label='Therapist Gender'
          labelClassName='!text-base'
          isClearable={true}
          options={GENDER_OPTION}
          onChange={value => onSelectChange('therapistGender', value as SelectOption)}
          StylesConfig={selectStyles}
          error={errors.therapistGender?.message}
        />

        <Select
          control={control}
          isRequired={true}
          key={`session-${clearKey}`}
          name='sessionType'
          label='Session Type'
          labelClassName='!text-base'
          isClearable={true}
          options={SESSION_OPTIONS}
          onChange={value => onSelectChange('sessionType', value as SelectOption)}
          StylesConfig={selectStyles}
          value={
            filter.sessionType ? { label: filter.sessionType, value: filter.sessionType } : null
          }
          error={errors.sessionType?.message}
        />
      </div>

      <div className='flex items-center justify-end gap-4 mt-5'>
        <Button
          id='tour-search-therapist-btn'
          variant='filled'
          type='button'
          title='Search Therapist'
          className='px-6 rounded-10px !z-[0]'
          onClick={handleSubmit(onSearch)}
          isLoading={isLoading && activeSearch}
        />

        {hasAnyFilterValue && (
          <Button
            variant='outline'
            title='Clear Filters'
            className='px-6 rounded-10px !z-[0]'
            onClick={handleClearFilters}
          />
        )}
      </div>
    </>
  );
};

export default AppointmentFilters;
