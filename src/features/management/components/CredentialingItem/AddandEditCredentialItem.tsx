import { useEffect, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { getCarrierByStateAsync } from '@/api/carrier';
import { STATE_KEYS_NAME } from '@/api/common/state.queryKey';
import {
  useCreateCredentialingItems,
  useGetCredentialingItemsById,
  useUpdateCredentialingItems,
} from '@/api/creadentialingItem';
import { getCredentialStatesAsync } from '@/api/state';
import type { OptionType } from '@/features/calendar/types';
import type { CredentialingFormData } from '@/features/management/types';
import { credentialingSchema } from '@/features/management/validation';
import Button from '@/stories/Common/Button';
import CheckboxField from '@/stories/Common/CheckBox';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import InputField from '@/stories/Common/Input';
import Select, { CustomAsyncSelect } from '@/stories/Common/Select';

const AddAndEditCredentialItem = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedStateId, setSelectedStateId] = useState<string | undefined>(undefined);

  // const [openAddEditCarrierNameModal, setOpenAddEditCarrierNameModal] = useState(false);
  // const [openAddEditStateNameModal, setOpenAddEditStateNameModal] = useState(false);
  const createCredentialingItem = useCreateCredentialingItems();
  const { data: getCredentialByIdData, dataUpdatedAt: getCredentialByIdDataUpdatedAt } =
    useGetCredentialingItemsById(id as string);
  const editCredentialingItem = useUpdateCredentialingItems(id as string);
  const isEditMode = !!id;
  const {
    register,
    formState: { errors },
    reset,
    setValue,
    getValues,
    handleSubmit,
  } = useForm<CredentialingFormData>({
    resolver: yupResolver(credentialingSchema),
    defaultValues: {
      carrierName: null,
      dateRoster: null,
      recredentialDate: null,
      status: '',
      ticketId: '',
      state: null,
      credentialDate: null,
      recredentialInProgress: false,
      idNumber: '',
    },
  });

  const statusOptions = [
    { label: 'Credentialed', value: 'Credentialed' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Expired', value: 'Expired' },
    { label: 'Denied', value: 'Denied' },
    { label: 'On Roster', value: 'On Roster' },
  ];

  useEffect(() => {
    if (getCredentialByIdData) {
      const stateId = getCredentialByIdData?.state?.state?.id;
      if (stateId) {
        setSelectedStateId(stateId);
      }

      reset({
        carrierName:
          getCredentialByIdData?.carrier?.id && getCredentialByIdData?.carrier?.carrier_name
            ? {
                value: getCredentialByIdData.carrier.id,
                label: getCredentialByIdData.carrier.carrier_name,
              }
            : null,
        dateRoster: getCredentialByIdData?.date_roster || null,
        recredentialDate: getCredentialByIdData?.recredential_date || null,
        status: getCredentialByIdData?.status || '',
        ticketId: getCredentialByIdData?.ticket_id || '',
        state:
          getCredentialByIdData?.state?.state?.id && getCredentialByIdData?.state?.state.name
            ? {
                value: getCredentialByIdData?.state?.state.id,
                label: getCredentialByIdData?.state?.state.name,
              }
            : null,
        credentialDate: getCredentialByIdData?.credential_date || null,
        idNumber: getCredentialByIdData?.id_number || '',
        recredentialInProgress: Boolean(getCredentialByIdData?.is_recredential_in_progress),
      });
    }
  }, [getCredentialByIdDataUpdatedAt, reset]);

  // Small helper to update form values and trigger re-render
  const handleChange = (
    field: keyof CredentialingFormData,
    value: string | boolean | Date | OptionType | null
  ) => {
    setValue(field, value as never, { shouldValidate: true });
  };

  const handleCancel = () => {
    reset();
    navigate(-1);
  };

  const onSubmit = async (formValues: CredentialingFormData) => {
    try {
      const payload = {
        carrier_id: formValues.carrierName?.value || null,
        state_id:
          formValues.state && typeof formValues.state === 'object'
            ? formValues.state.value || null
            : null,
        id_number: formValues.idNumber,
        ticket_id: formValues.ticketId,
        status: formValues.status,
        credential_date: formValues.credentialDate,
        recredential_date: formValues.recredentialDate,
        date_roster: formValues.dateRoster,
        therapist_id: state?.therapist_id,
        is_recredential_in_progress: formValues.recredentialInProgress,
      };

      if (isEditMode) {
        await editCredentialingItem.mutateAsync(payload);
        // reset(payload);
      } else {
        await createCredentialingItem.mutateAsync(payload);
        navigate(-1);
        reset();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='bg-white rounded-20px border border-solid border-surface p-5'>
      <div className='flex flex-col gap-5'>
        <h2 className='text-lg font-bold leading-6 text-blackdark'>Credentialing Item</h2>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
          {/* State */}

          <CustomAsyncSelect
            queryKey={STATE_KEYS_NAME.LIST}
            label='State'
            isClearable
            labelClassName='!text-base !leading-5'
            loadOptions={getCredentialStatesAsync}
            value={getValues('state')}
            onChange={selected => {
              handleChange('state', selected as OptionType | null);

              // Update selectedStateId and reset carrier name when state changes
              const selectedOption = selected as OptionType | null;
              if (selectedOption?.value) {
                setSelectedStateId(selectedOption.value as string);
              } else {
                setSelectedStateId(undefined);
              }
              // Reset carrier name when state changes
              handleChange('carrierName', null);
            }}
            // AddOption={STATE_ADD_OPTION}
            className='sm:text-base text-sm'
            StylesConfig={{
              control: () => ({
                minHeight: '50px',
              }),
              singleValue: () => ({
                fontSize: '16px',
              }),
              option: () => ({
                fontSize: '16px',
              }),
              menu: () => ({
                zIndex: '99',
              }),
            }}
            name='state'
            error={errors.state?.message}
          />
          {/* Carrier Name */}
          <CustomAsyncSelect
            queryKey='carrierName'
            label='Carrier Name'
            isClearable
            labelClassName='!text-base !leading-5'
            loadOptions={(page, searchTerm) =>
              getCarrierByStateAsync(page, searchTerm, selectedStateId as string)
            }
            onChange={selected => handleChange('carrierName', selected as OptionType | null)}
            value={getValues('carrierName')}
            cacheOptions={false}
            // AddOption={{
            //   label: 'Add New Carrier Name',
            //   value: 'CREATE',
            // }}
            className='sm:text-base text-sm'
            StylesConfig={{
              control: () => ({
                minHeight: '50px',
              }),
              singleValue: () => ({
                fontSize: '16px',
              }),
              option: () => ({
                fontSize: '16px',
              }),
              menu: () => ({
                zIndex: '99',
              }),
            }}
            name='carrierName'
            error={errors.carrierName?.message}
          />

          {/* Date Roster */}
          <CustomDatePicker
            label='Date Roster'
            selected={getValues('dateRoster')}
            onChange={date => handleChange('dateRoster', date || null)}
            placeholderText='Select Date'
            dateFormat='MM/dd/yyyy'
            error={errors.dateRoster?.message}
            className='!py-3'
          />
          {/* Credential Date */}
          <CustomDatePicker
            label='Credential Date'
            selected={getValues('credentialDate')}
            onChange={date => handleChange('credentialDate', date || null)}
            placeholderText='Select Date'
            dateFormat='MM/dd/yyyy'
            error={errors.credentialDate?.message}
            className='!py-3'
          />
          {/* Recredential Date */}
          <CustomDatePicker
            label='Recredential Date'
            selected={getValues('recredentialDate')}
            onChange={date => handleChange('recredentialDate', date || null)}
            placeholderText='Select Date'
            dateFormat='MM/dd/yyyy'
            error={errors.recredentialDate?.message}
            className='!py-3'
          />
          {/* Recredential in Progress */}
          <CheckboxField
            id='recredential-in-progress'
            label='Recredential in Progress'
            labelClass='w-full'
            isChecked={getValues('recredentialInProgress')}
            onChange={e => handleChange('recredentialInProgress', Boolean(e.target.checked))}
          />
          {/* Status */}
          <Select
            label='Status'
            labelClassName='!text-base !leading-5'
            isMulti={false}
            options={statusOptions}
            value={statusOptions.find(option => option.value === getValues('status')) || null}
            onChange={selected =>
              handleChange('status', ((selected as OptionType)?.value || '') as string)
            }
            placeholder='Select Status'
            isClearable
            error={errors.status?.message}
            StylesConfig={{
              control: () => ({
                minHeight: '50px',
              }),
              singleValue: () => ({
                fontSize: '16px',
              }),
              option: () => ({
                fontSize: '16px',
              }),
              menu: () => ({
                zIndex: '99',
              }),
            }}
          />
          {/* ID Number */}
          <InputField
            type='text'
            label='ID Number'
            labelClass='!text-base !leading-5'
            inputClass='!text-base !leading-5'
            placeholder='Enter ID Number'
            register={register}
            name={'idNumber'}
            error={errors.idNumber?.message}
          />
          {/* Ticket ID */}
          <InputField
            type='text'
            label='Ticket ID'
            labelClass='!text-base !leading-5'
            inputClass='!text-base !leading-5'
            placeholder='Enter Ticket ID'
            register={register}
            name={'ticketId'}
            error={errors.ticketId?.message}
          />
        </div>
        {/* Action Buttons */}
        <div className='flex items-center justify-end gap-4 pt-30px border-t border-solid border-surface'>
          <Button
            type='button'
            variant='outline'
            title='Cancel'
            onClick={handleCancel}
            className='!px-6 rounded-10px'
          />
          <Button
            type='button'
            variant='filled'
            onClick={() => handleSubmit(onSubmit)()}
            title='Save'
            isDisabled={createCredentialingItem.isPending}
            className='!px-6 rounded-10px'
          />
        </div>
      </div>
      {/* <AddEditCarrierNameModal
        isOpen={openAddEditCarrierNameModal}
        onClose={() => setOpenAddEditCarrierNameModal(false)}
        isEdit={false}
      /> */}

      {/* <AddEditStateNameModal
        isOpen={openAddEditStateNameModal}
        onClose={() => setOpenAddEditStateNameModal(false)}
        isEdit={false}
      /> */}
    </div>
  );
};

export default AddAndEditCredentialItem;
